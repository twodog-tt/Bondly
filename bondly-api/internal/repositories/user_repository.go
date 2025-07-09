package repositories

import (
	"bondly-api/internal/models"
	"time"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// GetByID 根据ID获取用户
func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByWalletAddress 根据钱包地址获取用户
func (r *UserRepository) GetByWalletAddress(walletAddress string) (*models.User, error) {
	var user models.User
	err := r.db.Where("wallet_address = ?", walletAddress).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail 根据邮箱获取用户
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Create 创建用户
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// Update 更新用户
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// UpdateLastLogin 更新最后登录时间
func (r *UserRepository) UpdateLastLogin(id uint) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("last_login_at", time.Now()).Error
}

// UpdateReputationScore 更新声誉积分
func (r *UserRepository) UpdateReputationScore(id uint, score int) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("reputation_score", score).Error
}

// Delete 删除用户
func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

// List 获取用户列表
func (r *UserRepository) List(offset, limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Offset(offset).Limit(limit).Find(&users).Error
	return users, err
}

// ListByRole 根据角色获取用户列表
func (r *UserRepository) ListByRole(role string, offset, limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("role = ?", role).Offset(offset).Limit(limit).Find(&users).Error
	return users, err
}

// Count 获取用户总数
func (r *UserRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Count(&count).Error
	return count, err
}

// CountByRole 根据角色获取用户数量
func (r *UserRepository) CountByRole(role string) (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("role = ?", role).Count(&count).Error
	return count, err
}

// ExistsByWalletAddress 检查钱包地址是否存在
func (r *UserRepository) ExistsByWalletAddress(walletAddress string) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("wallet_address = ?", walletAddress).Count(&count).Error
	return count > 0, err
}

// ExistsByEmail 检查邮箱是否存在
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// GetTopUsersByReputation 获取声誉积分最高的用户
func (r *UserRepository) GetTopUsersByReputation(limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Order("reputation_score DESC").Limit(limit).Find(&users).Error
	return users, err
}
