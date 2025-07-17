package services

import (
	"bondly-api/config"
	"bondly-api/internal/blockchain"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"fmt"
	"math/big"

	"github.com/sirupsen/logrus"
)

type ReputationService struct {
	userRepo        *repositories.UserRepository
	reputationVault *blockchain.ReputationVault
	config          config.EthereumConfig
}

func NewReputationService(userRepo *repositories.UserRepository, config config.EthereumConfig) *ReputationService {
	// 初始化ReputationVault合约客户端
	reputationVault, err := blockchain.NewReputationVault(config)
	if err != nil {
		logrus.WithError(err).Warn("Failed to initialize ReputationVault contract, reputation sync will be disabled")
		reputationVault = nil
	}

	return &ReputationService{
		userRepo:        userRepo,
		reputationVault: reputationVault,
		config:          config,
	}
}

// GetUserReputation 获取用户声誉分数（优先从链上获取）
func (s *ReputationService) GetUserReputation(ctx context.Context, userID int64) (int, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	// 获取用户信息
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByID", err)
		return 0, fmt.Errorf("failed to get user: %w", err)
	}

	// 如果用户有钱包地址且ReputationVault可用，优先从链上获取
	if user.WalletAddress != nil && s.reputationVault != nil {
		chainReputation, err := s.getReputationFromChain(ctx, *user.WalletAddress)
		if err != nil {
			bizLog.ThirdPartyError("blockchain", "getReputation", nil, err)
			logrus.WithFields(logrus.Fields{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"error":          err,
			}).Warn("Failed to get reputation from chain, using database value")
		} else {
			// 链上获取成功，同步到数据库
			if err := s.syncReputationToDatabase(ctx, userID, chainReputation); err != nil {
				bizLog.DatabaseError("update", "users", "UpdateReputationScore", err)
			}
			return chainReputation, nil
		}
	}

	// 返回数据库中的声誉分数
	bizLog.BusinessLogic("获取声誉分数", map[string]interface{}{
		"user_id":    userID,
		"reputation": user.ReputationScore,
		"source":     "database",
	})

	return user.ReputationScore, nil
}

// GetUserReputationByAddress 根据钱包地址获取用户声誉分数
func (s *ReputationService) GetUserReputationByAddress(ctx context.Context, walletAddress string) (int, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	// 优先从链上获取
	if s.reputationVault != nil {
		chainReputation, err := s.getReputationFromChain(ctx, walletAddress)
		if err != nil {
			bizLog.ThirdPartyError("blockchain", "getReputation", nil, err)
		} else {
			// 尝试同步到数据库
			user, err := s.userRepo.GetByWalletAddress(walletAddress)
			if err == nil {
				s.syncReputationToDatabase(ctx, user.ID, chainReputation)
			}
			return chainReputation, nil
		}
	}

	// 链上获取失败，从数据库获取
	user, err := s.userRepo.GetByWalletAddress(walletAddress)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByWalletAddress", err)
		return 0, fmt.Errorf("failed to get user by wallet address: %w", err)
	}

	bizLog.BusinessLogic("获取声誉分数", map[string]interface{}{
		"wallet_address": walletAddress,
		"reputation":     user.ReputationScore,
		"source":         "database",
	})

	return user.ReputationScore, nil
}

// AddReputation 增加用户声誉分数
func (s *ReputationService) AddReputation(ctx context.Context, userID int64, amount int, reason string) error {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByID", err)
		return fmt.Errorf("failed to get user: %w", err)
	}

	// 如果用户有钱包地址且ReputationVault可用，同时更新链上数据
	if user.WalletAddress != nil && s.reputationVault != nil && s.config.RelayWalletKey != "" {
		amountBig := big.NewInt(int64(amount))
		txHash, err := s.reputationVault.AddReputation(ctx, *user.WalletAddress, amountBig, s.config.RelayWalletKey)
		if err != nil {
			bizLog.ThirdPartyError("blockchain", "addReputation", map[string]interface{}{
				"user_id": userID,
				"amount":  amount,
			}, err)
			logrus.WithFields(logrus.Fields{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"amount":         amount,
				"error":          err,
			}).Warn("Failed to add reputation on chain, updating database only")
		} else {
			bizLog.Success("addReputation", map[string]interface{}{
				"tx_hash": txHash,
			})
			logrus.WithFields(logrus.Fields{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"amount":         amount,
				"tx_hash":        txHash,
			}).Info("Successfully added reputation on chain")
		}
	}

	// 更新数据库
	newScore := user.ReputationScore + amount
	if newScore < 0 {
		newScore = 0
	}

	err = s.userRepo.UpdateReputationScore(userID, newScore)
	if err != nil {
		bizLog.DatabaseError("update", "users", "UpdateReputationScore", err)
		return fmt.Errorf("failed to update reputation score: %w", err)
	}

	bizLog.Success("reputationChanged", map[string]interface{}{
		"user_id":   userID,
		"old_score": user.ReputationScore,
		"new_score": newScore,
		"change":    amount,
		"reason":    reason,
	})

	return nil
}

// SubtractReputation 减少用户声誉分数
func (s *ReputationService) SubtractReputation(ctx context.Context, userID int64, amount int, reason string) error {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByID", err)
		return fmt.Errorf("failed to get user: %w", err)
	}

	// 如果用户有钱包地址且ReputationVault可用，同时更新链上数据
	if user.WalletAddress != nil && s.reputationVault != nil && s.config.RelayWalletKey != "" {
		amountBig := big.NewInt(int64(amount))
		txHash, err := s.reputationVault.SubtractReputation(ctx, *user.WalletAddress, amountBig, s.config.RelayWalletKey)
		if err != nil {
			bizLog.ThirdPartyError("blockchain", "subtractReputation", map[string]interface{}{
				"user_id": userID,
				"amount":  amount,
			}, err)
			logrus.WithFields(logrus.Fields{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"amount":         amount,
				"error":          err,
			}).Warn("Failed to subtract reputation on chain, updating database only")
		} else {
			bizLog.Success("subtractReputation", map[string]interface{}{
				"tx_hash": txHash,
			})
			logrus.WithFields(logrus.Fields{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"amount":         amount,
				"tx_hash":        txHash,
			}).Info("Successfully subtracted reputation on chain")
		}
	}

	// 更新数据库
	newScore := user.ReputationScore - amount
	if newScore < 0 {
		newScore = 0
	}

	err = s.userRepo.UpdateReputationScore(userID, newScore)
	if err != nil {
		bizLog.DatabaseError("update", "users", "UpdateReputationScore", err)
		return fmt.Errorf("failed to update reputation score: %w", err)
	}

	bizLog.Success("reputationChanged", map[string]interface{}{
		"user_id":   userID,
		"old_score": user.ReputationScore,
		"new_score": newScore,
		"change":    -amount,
		"reason":    reason,
	})

	return nil
}

// SyncReputationFromChain 从链上同步用户声誉分数到数据库
func (s *ReputationService) SyncReputationFromChain(ctx context.Context, userID int64) error {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	if s.reputationVault == nil {
		return fmt.Errorf("reputation vault not available")
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByID", err)
		return fmt.Errorf("failed to get user: %w", err)
	}

	if user.WalletAddress == nil {
		return fmt.Errorf("user does not have a wallet address")
	}

	chainReputation, err := s.getReputationFromChain(ctx, *user.WalletAddress)
	if err != nil {
		bizLog.ThirdPartyError("blockchain", "getReputation", nil, err)
		return fmt.Errorf("failed to get reputation from chain: %w", err)
	}

	err = s.syncReputationToDatabase(ctx, userID, chainReputation)
	if err != nil {
		bizLog.DatabaseError("update", "users", "UpdateReputationScore", err)
		return fmt.Errorf("failed to sync reputation to database: %w", err)
	}

	bizLog.BusinessLogic("同步链上声誉", map[string]interface{}{
		"user_id":          userID,
		"wallet_address":   *user.WalletAddress,
		"chain_reputation": chainReputation,
	})

	return nil
}

// IsEligibleForGovernance 检查用户是否符合治理条件
func (s *ReputationService) IsEligibleForGovernance(ctx context.Context, userID int64) (bool, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetByID", err)
		return false, fmt.Errorf("failed to get user: %w", err)
	}

	// 如果用户有钱包地址且ReputationVault可用，从链上检查
	if user.WalletAddress != nil && s.reputationVault != nil {
		eligible, err := s.reputationVault.IsEligible(ctx, *user.WalletAddress)
		if err != nil {
			bizLog.ThirdPartyError("blockchain", "isEligible", nil, err)
		} else {
			bizLog.BusinessLogic("检查治理资格", map[string]interface{}{
				"user_id":        userID,
				"wallet_address": *user.WalletAddress,
				"eligible":       eligible,
				"source":         "chain",
			})
			return eligible, nil
		}
	}

	// 链上检查失败，使用数据库中的声誉分数判断（简单逻辑：声誉分数 >= 100）
	eligible := user.ReputationScore >= 100

	bizLog.BusinessLogic("检查治理资格", map[string]interface{}{
		"user_id":    userID,
		"reputation": user.ReputationScore,
		"eligible":   eligible,
		"source":     "database",
	})

	return eligible, nil
}

// GetTopUsersByReputation 获取声誉排行榜
func (s *ReputationService) GetTopUsersByReputation(ctx context.Context, limit int) ([]models.User, error) {
	return s.userRepo.GetTopUsersByReputation(limit)
}

// getReputationFromChain 从链上获取声誉分数
func (s *ReputationService) getReputationFromChain(ctx context.Context, walletAddress string) (int, error) {
	reputation, err := s.reputationVault.GetReputation(ctx, walletAddress)
	if err != nil {
		return 0, err
	}

	// 将 big.Int 转换为 int
	if !reputation.IsInt64() {
		return 0, fmt.Errorf("reputation value too large: %s", reputation.String())
	}

	return int(reputation.Int64()), nil
}

// syncReputationToDatabase 同步声誉分数到数据库
func (s *ReputationService) syncReputationToDatabase(ctx context.Context, userID int64, reputation int) error {
	return s.userRepo.UpdateReputationScore(userID, reputation)
}
