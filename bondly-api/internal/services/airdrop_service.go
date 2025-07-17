package services

import (
	"bondly-api/config"
	"bondly-api/internal/blockchain"
	"bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"fmt"
	"math/big"
	"time"
)

type AirdropService struct {
	ethClient *blockchain.EthereumClient
	userRepo  *repositories.UserRepository
	config    *config.Config
}

func NewAirdropService(ethClient *blockchain.EthereumClient, userRepo *repositories.UserRepository, cfg *config.Config) *AirdropService {
	return &AirdropService{
		ethClient: ethClient,
		userRepo:  userRepo,
		config:    cfg,
	}
}

// AirdropToNewUser 为新用户空投BOND代币
func (s *AirdropService) AirdropToNewUser(ctx context.Context, userID int64, walletAddress string) error {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("开始为新用户空投BOND代币", map[string]interface{}{
		"user_id":        userID,
		"wallet_address": walletAddress,
	})

	// 1. 检查用户是否已经获得过空投
	hasAirdropped, err := s.userRepo.HasUserReceivedAirdrop(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "检查空投状态失败", err)
		return fmt.Errorf("failed to check airdrop status: %v", err)
	}

	if hasAirdropped {
		bizLog.BusinessLogic("用户已获得过空投", map[string]interface{}{
			"user_id": userID,
		})
		return fmt.Errorf("user has already received airdrop")
	}

	// 2. 检查中转钱包余额
	relayWalletAddress := "0x2C830B8D1a6A9B840bde165a36df2A69fc9AA075"
	bondTokenAddress := "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E" // BOND代币合约地址

	balance, err := s.ethClient.GetTokenBalance(bondTokenAddress, relayWalletAddress)
	if err != nil {
		bizLog.BusinessLogic("获取中转钱包余额失败", map[string]interface{}{
			"relay_wallet": relayWalletAddress,
			"error":        err.Error(),
		})
		return fmt.Errorf("failed to get relay wallet balance: %v", err)
	}

	airdropAmount := big.NewInt(1000)                                     // 1000个BOND代币
	airdropAmountWei := new(big.Int).Mul(airdropAmount, big.NewInt(1e18)) // 转换为wei

	if balance.Cmp(airdropAmountWei) < 0 {
		bizLog.BusinessLogic("中转钱包余额不足", map[string]interface{}{
			"relay_wallet":    relayWalletAddress,
			"current_balance": balance.String(),
			"required_amount": airdropAmountWei.String(),
		})
		return fmt.Errorf("insufficient balance in relay wallet: %s, required: %s", balance.String(), airdropAmountWei.String())
	}

	// 3. 执行转账
	bizLog.BusinessLogic("开始执行BOND代币转账", map[string]interface{}{
		"from":   relayWalletAddress,
		"to":     walletAddress,
		"amount": airdropAmountWei.String(),
	})

	txHash, err := s.ethClient.TransferTokens(bondTokenAddress, walletAddress, airdropAmountWei)
	if err != nil {
		bizLog.BusinessLogic("BOND代币转账失败", map[string]interface{}{
			"from":   relayWalletAddress,
			"to":     walletAddress,
			"amount": airdropAmountWei.String(),
			"error":  err.Error(),
		})
		return fmt.Errorf("failed to transfer tokens: %v", err)
	}

	bizLog.BusinessLogic("BOND代币转账交易已发送", map[string]interface{}{
		"tx_hash": txHash,
		"from":    relayWalletAddress,
		"to":      walletAddress,
		"amount":  airdropAmountWei.String(),
	})

	// 4. 记录空投记录
	airdropRecord := &models.AirdropRecord{
		UserID:        userID,
		WalletAddress: walletAddress,
		Amount:        airdropAmountWei.String(),
		TxHash:        txHash,
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.userRepo.CreateAirdropRecord(airdropRecord); err != nil {
		bizLog.DatabaseError("insert", "airdrop_records", "创建空投记录失败", err)
		return fmt.Errorf("failed to create airdrop record: %v", err)
	}

	// 5. 标记用户已获得空投
	if err := s.userRepo.MarkUserReceivedAirdrop(userID); err != nil {
		bizLog.DatabaseError("update", "users", "标记用户空投状态失败", err)
		return fmt.Errorf("failed to mark user airdrop status: %v", err)
	}

	// 6. 异步等待交易确认
	go s.waitForTransactionConfirmation(ctx, txHash, airdropRecord.ID)

	bizLog.BusinessLogic("新用户空投BOND代币完成", map[string]interface{}{
		"user_id":        userID,
		"wallet_address": walletAddress,
		"amount":         airdropAmountWei.String(),
		"tx_hash":        txHash,
	})

	return nil
}

// waitForTransactionConfirmation 异步等待交易确认
func (s *AirdropService) waitForTransactionConfirmation(ctx context.Context, txHash string, recordID int64) {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("开始等待交易确认", map[string]interface{}{
		"tx_hash":   txHash,
		"record_id": recordID,
	})

	// 等待交易确认（等待1个区块确认）
	receipt, err := s.ethClient.WaitForTransaction(txHash, 1)
	if err != nil {
		bizLog.BusinessLogic("等待交易确认失败", map[string]interface{}{
			"tx_hash": txHash,
			"error":   err.Error(),
		})

		// 更新记录状态为失败
		if updateErr := s.userRepo.UpdateAirdropRecordStatus(recordID, "failed"); updateErr != nil {
			bizLog.DatabaseError("update", "airdrop_records", "更新空投记录状态失败", updateErr)
		}
		return
	}

	// 检查交易状态
	status := "success"
	if receipt.Status == 0 {
		status = "failed"
		bizLog.BusinessLogic("交易执行失败", map[string]interface{}{
			"tx_hash": txHash,
			"status":  receipt.Status,
		})
	} else {
		bizLog.BusinessLogic("交易确认成功", map[string]interface{}{
			"tx_hash":      txHash,
			"block_number": receipt.BlockNumber.Uint64(),
			"gas_used":     receipt.GasUsed,
		})
	}

	// 更新记录状态
	if err := s.userRepo.UpdateAirdropRecordStatus(recordID, status); err != nil {
		bizLog.DatabaseError("update", "airdrop_records", "更新空投记录状态失败", err)
	}
}

// GetAirdropStatus 获取用户空投状态
func (s *AirdropService) GetAirdropStatus(ctx context.Context, userID int64) (*models.AirdropRecord, error) {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("查询用户空投状态", map[string]interface{}{
		"user_id": userID,
	})

	record, err := s.userRepo.GetAirdropRecordByUserID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "airdrop_records", "查询空投记录失败", err)
		return nil, fmt.Errorf("failed to get airdrop record: %v", err)
	}

	return record, nil
}

// AirdropToCustodyWallet 为新注册用户空投BOND代币到托管钱包
func (s *AirdropService) AirdropToCustodyWallet(ctx context.Context, userID int64, custodyWalletAddress string) error {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("开始为新注册用户托管钱包空投BOND代币", map[string]interface{}{
		"user_id":                userID,
		"custody_wallet_address": custodyWalletAddress,
		"airdrop_type":           "custody_wallet",
	})

	// 1. 检查用户是否已经获得过空投（任何类型）
	hasAirdropped, err := s.userRepo.HasUserReceivedAirdrop(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "检查空投状态失败", err)
		return fmt.Errorf("failed to check airdrop status: %v", err)
	}

	if hasAirdropped {
		bizLog.BusinessLogic("用户已获得过空投", map[string]interface{}{
			"user_id": userID,
		})
		return fmt.Errorf("user has already received airdrop")
	}

	return s.executeAirdrop(ctx, userID, custodyWalletAddress, "custody_wallet")
}

// AirdropToUserWallet 为用户绑定钱包时空投BOND代币到用户钱包
func (s *AirdropService) AirdropToUserWallet(ctx context.Context, userID int64, userWalletAddress string) error {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("开始为用户钱包绑定空投BOND代币", map[string]interface{}{
		"user_id":             userID,
		"user_wallet_address": userWalletAddress,
		"airdrop_type":        "user_wallet",
	})

	// 1. 检查用户是否已经获得过钱包绑定空投
	hasWalletAirdrop, err := s.userRepo.HasUserReceivedWalletAirdrop(userID)
	if err != nil {
		bizLog.DatabaseError("select", "airdrop_records", "检查钱包绑定空投状态失败", err)
		return fmt.Errorf("failed to check wallet airdrop status: %v", err)
	}

	if hasWalletAirdrop {
		bizLog.BusinessLogic("用户已获得过钱包绑定空投", map[string]interface{}{
			"user_id": userID,
		})
		return fmt.Errorf("user has already received wallet binding airdrop")
	}

	return s.executeAirdrop(ctx, userID, userWalletAddress, "user_wallet")
}

// executeAirdrop 执行空投的通用方法
func (s *AirdropService) executeAirdrop(ctx context.Context, userID int64, targetWalletAddress, airdropType string) error {
	bizLog := logger.NewBusinessLogger(ctx)

	// 2. 检查中转钱包余额
	relayWalletAddress := "0x2C830B8D1a6A9B840bde165a36df2A69fc9AA075"
	bondTokenAddress := "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E" // BOND代币合约地址

	balance, err := s.ethClient.GetTokenBalance(bondTokenAddress, relayWalletAddress)
	if err != nil {
		bizLog.BusinessLogic("获取中转钱包余额失败", map[string]interface{}{
			"relay_wallet": relayWalletAddress,
			"error":        err.Error(),
		})
		return fmt.Errorf("failed to get relay wallet balance: %v", err)
	}

	airdropAmount := big.NewInt(1000)                                     // 1000个BOND代币
	airdropAmountWei := new(big.Int).Mul(airdropAmount, big.NewInt(1e18)) // 转换为wei

	if balance.Cmp(airdropAmountWei) < 0 {
		bizLog.BusinessLogic("中转钱包余额不足", map[string]interface{}{
			"relay_wallet":    relayWalletAddress,
			"current_balance": balance.String(),
			"required_amount": airdropAmountWei.String(),
		})
		return fmt.Errorf("insufficient balance in relay wallet: %s, required: %s", balance.String(), airdropAmountWei.String())
	}

	// 3. 执行转账
	bizLog.BusinessLogic("开始执行BOND代币转账", map[string]interface{}{
		"from":         relayWalletAddress,
		"to":           targetWalletAddress,
		"amount":       airdropAmountWei.String(),
		"airdrop_type": airdropType,
	})

	txHash, err := s.ethClient.TransferTokens(bondTokenAddress, targetWalletAddress, airdropAmountWei)
	if err != nil {
		bizLog.BusinessLogic("BOND代币转账失败", map[string]interface{}{
			"from":         relayWalletAddress,
			"to":           targetWalletAddress,
			"amount":       airdropAmountWei.String(),
			"airdrop_type": airdropType,
			"error":        err.Error(),
		})
		return fmt.Errorf("failed to transfer tokens: %v", err)
	}

	bizLog.BusinessLogic("BOND代币转账交易已发送", map[string]interface{}{
		"tx_hash":      txHash,
		"from":         relayWalletAddress,
		"to":           targetWalletAddress,
		"amount":       airdropAmountWei.String(),
		"airdrop_type": airdropType,
	})

	// 4. 记录空投记录
	airdropRecord := &models.AirdropRecord{
		UserID:        userID,
		WalletAddress: targetWalletAddress,
		Amount:        airdropAmountWei.String(),
		TxHash:        txHash,
		Status:        "pending",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.userRepo.CreateAirdropRecord(airdropRecord); err != nil {
		bizLog.DatabaseError("insert", "airdrop_records", "创建空投记录失败", err)
		return fmt.Errorf("failed to create airdrop record: %v", err)
	}

	// 5. 根据空投类型标记用户空投状态
	if airdropType == "custody_wallet" {
		if err := s.userRepo.MarkUserReceivedAirdrop(userID); err != nil {
			bizLog.DatabaseError("update", "users", "标记用户空投状态失败", err)
			return fmt.Errorf("failed to mark user airdrop status: %v", err)
		}
	}

	// 6. 异步等待交易确认
	go s.waitForTransactionConfirmation(ctx, txHash, airdropRecord.ID)

	bizLog.BusinessLogic("空投BOND代币完成", map[string]interface{}{
		"user_id":        userID,
		"wallet_address": targetWalletAddress,
		"amount":         airdropAmountWei.String(),
		"tx_hash":        txHash,
		"airdrop_type":   airdropType,
	})

	return nil
}

// GetAirdropHistory 获取空投历史记录
func (s *AirdropService) GetAirdropHistory(ctx context.Context, offset, limit int) ([]models.AirdropRecord, error) {
	bizLog := logger.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("查询空投历史记录", map[string]interface{}{
		"offset": offset,
		"limit":  limit,
	})

	records, err := s.userRepo.GetAirdropRecords(offset, limit)
	if err != nil {
		bizLog.DatabaseError("select", "airdrop_records", "查询空投历史失败", err)
		return nil, fmt.Errorf("failed to get airdrop history: %v", err)
	}

	return records, nil
}
