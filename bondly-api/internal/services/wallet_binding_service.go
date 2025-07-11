package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"

	"gorm.io/gorm"
)

type WalletBindingService struct {
	walletBindingRepo *repositories.WalletBindingRepository
}

func NewWalletBindingService(walletBindingRepo *repositories.WalletBindingRepository) *WalletBindingService {
	return &WalletBindingService{
		walletBindingRepo: walletBindingRepo,
	}
}

// CreateWalletBinding 创建钱包绑定
func (s *WalletBindingService) CreateWalletBinding(ctx context.Context, binding *models.WalletBinding) error {
	// 设置默认值
	if binding.Network == "" {
		binding.Network = "ethereum"
	}

	// 检查钱包地址是否已被绑定
	exists, err := s.walletBindingRepo.ExistsByWalletAddress(binding.WalletAddress)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("wallet address already bound")
	}

	// 检查用户是否已绑定该钱包
	exists, err = s.walletBindingRepo.ExistsByUserAndWallet(binding.UserID, binding.WalletAddress)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user already bound this wallet")
	}

	return s.walletBindingRepo.Create(binding)
}

// GetWalletBinding 获取钱包绑定
func (s *WalletBindingService) GetWalletBinding(ctx context.Context, id int64) (*models.WalletBinding, error) {
	binding, err := s.walletBindingRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("wallet binding not found")
		}
		return nil, err
	}

	return binding, nil
}

// UpdateWalletBinding 更新钱包绑定
func (s *WalletBindingService) UpdateWalletBinding(ctx context.Context, id int64, updateData *models.WalletBinding) (*models.WalletBinding, error) {
	// 检查钱包绑定是否存在
	existingBinding, err := s.walletBindingRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("wallet binding not found")
		}
		return nil, err
	}

	// 更新字段
	if updateData.WalletAddress != "" {
		existingBinding.WalletAddress = updateData.WalletAddress
	}
	if updateData.Network != "" {
		existingBinding.Network = updateData.Network
	}

	err = s.walletBindingRepo.Update(existingBinding)
	if err != nil {
		return nil, err
	}

	return existingBinding, nil
}

// DeleteWalletBinding 删除钱包绑定
func (s *WalletBindingService) DeleteWalletBinding(ctx context.Context, id int64) error {
	// 检查钱包绑定是否存在
	_, err := s.walletBindingRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("wallet binding not found")
		}
		return err
	}

	return s.walletBindingRepo.Delete(id)
}

// ListWalletBinding 获取钱包绑定列表
func (s *WalletBindingService) ListWalletBinding(ctx context.Context, page, limit int) ([]models.WalletBinding, int64, error) {
	offset := (page - 1) * limit

	bindings, err := s.walletBindingRepo.List(offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.walletBindingRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	return bindings, total, nil
}

// GetWalletBindingByUser 根据用户获取钱包绑定列表
func (s *WalletBindingService) GetWalletBindingByUser(ctx context.Context, userID int64) ([]models.WalletBinding, error) {
	bindings, err := s.walletBindingRepo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	return bindings, nil
}

// GetWalletBindingByWalletAddress 根据钱包地址获取绑定
func (s *WalletBindingService) GetWalletBindingByWalletAddress(ctx context.Context, walletAddress string) (*models.WalletBinding, error) {
	binding, err := s.walletBindingRepo.GetByWalletAddress(walletAddress)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("wallet binding not found")
		}
		return nil, err
	}

	return binding, nil
}

// GetWalletBindingByNetwork 根据网络类型获取钱包绑定列表
func (s *WalletBindingService) GetWalletBindingByNetwork(ctx context.Context, network string, page, limit int) ([]models.WalletBinding, int64, error) {
	offset := (page - 1) * limit

	bindings, err := s.walletBindingRepo.GetByNetwork(network, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.walletBindingRepo.CountByNetwork(network)
	if err != nil {
		return nil, 0, err
	}

	return bindings, total, nil
}
