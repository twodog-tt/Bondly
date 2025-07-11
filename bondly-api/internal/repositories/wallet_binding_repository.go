package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type WalletBindingRepository struct {
	db *gorm.DB
}

func NewWalletBindingRepository(db *gorm.DB) *WalletBindingRepository {
	return &WalletBindingRepository{
		db: db,
	}
}

// Create 创建钱包绑定
func (r *WalletBindingRepository) Create(binding *models.WalletBinding) error {
	return r.db.Create(binding).Error
}

// GetByID 根据ID获取钱包绑定
func (r *WalletBindingRepository) GetByID(id int64) (*models.WalletBinding, error) {
	var binding models.WalletBinding
	err := r.db.Preload("User").First(&binding, id).Error
	if err != nil {
		return nil, err
	}
	return &binding, nil
}

// Update 更新钱包绑定
func (r *WalletBindingRepository) Update(binding *models.WalletBinding) error {
	return r.db.Save(binding).Error
}

// Delete 删除钱包绑定
func (r *WalletBindingRepository) Delete(id int64) error {
	return r.db.Delete(&models.WalletBinding{}, id).Error
}

// List 获取钱包绑定列表
func (r *WalletBindingRepository) List(offset, limit int) ([]models.WalletBinding, error) {
	var bindings []models.WalletBinding
	err := r.db.Preload("User").Offset(offset).Limit(limit).Order("created_at DESC").Find(&bindings).Error
	return bindings, err
}

// Count 获取钱包绑定总数
func (r *WalletBindingRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.WalletBinding{}).Count(&count).Error
	return count, err
}

// GetByUserID 根据用户ID获取钱包绑定列表
func (r *WalletBindingRepository) GetByUserID(userID int64) ([]models.WalletBinding, error) {
	var bindings []models.WalletBinding
	err := r.db.Preload("User").Where("user_id = ?", userID).Find(&bindings).Error
	return bindings, err
}

// GetByWalletAddress 根据钱包地址获取绑定
func (r *WalletBindingRepository) GetByWalletAddress(walletAddress string) (*models.WalletBinding, error) {
	var binding models.WalletBinding
	err := r.db.Preload("User").Where("wallet_address = ?", walletAddress).First(&binding).Error
	if err != nil {
		return nil, err
	}
	return &binding, nil
}

// GetByNetwork 根据网络类型获取钱包绑定列表
func (r *WalletBindingRepository) GetByNetwork(network string, offset, limit int) ([]models.WalletBinding, error) {
	var bindings []models.WalletBinding
	err := r.db.Preload("User").Where("network = ?", network).Offset(offset).Limit(limit).Order("created_at DESC").Find(&bindings).Error
	return bindings, err
}

// CountByNetwork 根据网络类型获取钱包绑定数量
func (r *WalletBindingRepository) CountByNetwork(network string) (int64, error) {
	var count int64
	err := r.db.Model(&models.WalletBinding{}).Where("network = ?", network).Count(&count).Error
	return count, err
}

// ExistsByWalletAddress 检查钱包地址是否已绑定
func (r *WalletBindingRepository) ExistsByWalletAddress(walletAddress string) (bool, error) {
	var count int64
	err := r.db.Model(&models.WalletBinding{}).Where("wallet_address = ?", walletAddress).Count(&count).Error
	return count > 0, err
}

// ExistsByUserAndWallet 检查用户是否已绑定该钱包地址
func (r *WalletBindingRepository) ExistsByUserAndWallet(userID int64, walletAddress string) (bool, error) {
	var count int64
	err := r.db.Model(&models.WalletBinding{}).Where("user_id = ? AND wallet_address = ?", userID, walletAddress).Count(&count).Error
	return count > 0, err
}
