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
func (r *UserRepository) GetByID(id int64) (*models.User, error) {
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
func (r *UserRepository) UpdateLastLogin(id int64) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("last_login_at", time.Now()).Error
}

// UpdateReputationScore 更新声誉积分
func (r *UserRepository) UpdateReputationScore(id int64, score int) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("reputation_score", score).Error
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

// HasUserReceivedAirdrop 检查用户是否已获得空投
func (r *UserRepository) HasUserReceivedAirdrop(userID int64) (bool, error) {
	var user models.User
	err := r.db.Select("has_received_airdrop").Where("id = ?", userID).First(&user).Error
	if err != nil {
		return false, err
	}
	return user.HasReceivedAirdrop, nil
}

// MarkUserReceivedAirdrop 标记用户已获得空投
func (r *UserRepository) MarkUserReceivedAirdrop(userID int64) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("has_received_airdrop", true).Error
}

// CreateAirdropRecord 创建空投记录
func (r *UserRepository) CreateAirdropRecord(record *models.AirdropRecord) error {
	return r.db.Create(record).Error
}

// GetAirdropRecordByUserID 根据用户ID获取空投记录
func (r *UserRepository) GetAirdropRecordByUserID(userID int64) (*models.AirdropRecord, error) {
	var record models.AirdropRecord
	err := r.db.Where("user_id = ?", userID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// UpdateAirdropRecordStatus 更新空投记录状态
func (r *UserRepository) UpdateAirdropRecordStatus(recordID int64, status string) error {
	return r.db.Model(&models.AirdropRecord{}).Where("id = ?", recordID).Update("status", status).Error
}

// GetAirdropRecords 获取空投记录列表
func (r *UserRepository) GetAirdropRecords(offset, limit int) ([]models.AirdropRecord, error) {
	var records []models.AirdropRecord
	err := r.db.Preload("User").Order("created_at DESC").Offset(offset).Limit(limit).Find(&records).Error
	return records, err
}

// HasUserReceivedWalletAirdrop 检查用户是否已获得过钱包绑定空投
func (r *UserRepository) HasUserReceivedWalletAirdrop(userID int64) (bool, error) {
	var count int64
	err := r.db.Model(&models.AirdropRecord{}).Where("user_id = ? AND wallet_address != ''", userID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
