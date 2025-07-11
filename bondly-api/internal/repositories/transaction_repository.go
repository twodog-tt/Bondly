package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{
		db: db,
	}
}

// Create 创建交易
func (r *TransactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

// GetByID 根据ID获取交易
func (r *TransactionRepository) GetByID(id int64) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.First(&transaction, id).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// Update 更新交易
func (r *TransactionRepository) Update(transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

// Delete 删除交易
func (r *TransactionRepository) Delete(id int64) error {
	return r.db.Delete(&models.Transaction{}, id).Error
}

// List 获取交易列表
func (r *TransactionRepository) List(offset, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

// Count 获取交易总数
func (r *TransactionRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Transaction{}).Count(&count).Error
	return count, err
}

// GetByHash 根据哈希获取交易
func (r *TransactionRepository) GetByHash(hash string) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.Where("transaction_hash = ?", hash).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// GetByStatus 根据状态获取交易列表
func (r *TransactionRepository) GetByStatus(status string, offset, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("status = ?", status).Offset(offset).Limit(limit).Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

// CountByStatus 根据状态获取交易数量
func (r *TransactionRepository) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Transaction{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// GetByFromAddress 根据发送地址获取交易列表
func (r *TransactionRepository) GetByFromAddress(fromAddress string, offset, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("from_address = ?", fromAddress).Offset(offset).Limit(limit).Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

// GetByToAddress 根据接收地址获取交易列表
func (r *TransactionRepository) GetByToAddress(toAddress string, offset, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("to_address = ?", toAddress).Offset(offset).Limit(limit).Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}
