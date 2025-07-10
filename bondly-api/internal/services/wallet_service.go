package services

import (
	"bondly-api/config"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/errors"
	"bondly-api/internal/utils"
	"context"
	"fmt"
)

type WalletService struct {
	config *config.Config
}

func NewWalletService(cfg *config.Config) *WalletService {
	return &WalletService{
		config: cfg,
	}
}

// GenerateCustodyWallet 为用户生成托管钱包
func (s *WalletService) GenerateCustodyWallet(ctx context.Context) (*utils.WalletInfo, error) {
	log := loggerpkg.FromContext(ctx)

	// 获取配置中的钱包密钥
	secretKey := s.config.Wallet.SecretKey
	if secretKey == "" {
		return nil, errors.NewInternalError(fmt.Errorf("WALLET_SECRET_KEY environment variable not set"))
	}

	// 生成钱包
	walletInfo, err := utils.GenerateWallet()
	if err != nil {
		log.WithField("error", err).Error("Failed to generate wallet")
		return nil, errors.NewInternalError(fmt.Errorf("failed to generate wallet: %w", err))
	}

	// 加密私钥
	encryptedPrivateKey, err := utils.EncryptPrivateKey(walletInfo.PrivateKey, secretKey)
	if err != nil {
		log.WithField("error", err).Error("Failed to encrypt private key")
		return nil, errors.NewInternalError(fmt.Errorf("failed to encrypt private key: %w", err))
	}

	// 设置加密后的私钥
	walletInfo.EncryptedKey = encryptedPrivateKey

	log.WithField("address", walletInfo.Address).Info("Generated custody wallet successfully")

	return walletInfo, nil
}

// DecryptPrivateKey 解密私钥（用于需要私钥的操作）
func (s *WalletService) DecryptPrivateKey(ctx context.Context, encryptedPrivateKey string) (string, error) {
	log := loggerpkg.FromContext(ctx)

	// 获取配置中的钱包密钥
	secretKey := s.config.Wallet.SecretKey
	if secretKey == "" {
		return "", errors.NewInternalError(fmt.Errorf("WALLET_SECRET_KEY environment variable not set"))
	}

	// 解密私钥
	privateKey, err := utils.DecryptPrivateKey(encryptedPrivateKey, secretKey)
	if err != nil {
		log.WithField("error", err).Error("Failed to decrypt private key")
		return "", errors.NewInternalError(fmt.Errorf("failed to decrypt private key: %w", err))
	}

	return privateKey, nil
}

// ValidateCustodyWalletAddress 验证托管钱包地址
func (s *WalletService) ValidateCustodyWalletAddress(ctx context.Context, address string) error {
	if address == "" {
		return errors.NewCustodyWalletEmptyError()
	}

	if !utils.ValidateAddress(address) {
		return errors.NewCustodyWalletInvalidError(fmt.Errorf("invalid wallet address format"))
	}

	return nil
}

// ValidateEncryptedPrivateKey 验证加密私钥
func (s *WalletService) ValidateEncryptedPrivateKey(ctx context.Context, encryptedPrivateKey string) error {
	if encryptedPrivateKey == "" {
		return errors.NewPrivateKeyEmptyError()
	}

	// 尝试解密以验证格式
	_, err := s.DecryptPrivateKey(ctx, encryptedPrivateKey)
	if err != nil {
		return errors.NewPrivateKeyInvalidError(err)
	}

	return nil
}
