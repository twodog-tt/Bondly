package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"

	"gorm.io/gorm"
)

type TransactionService struct {
	transactionRepo *repositories.TransactionRepository
}

func NewTransactionService(transactionRepo *repositories.TransactionRepository) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
	}
}

// CreateTransaction 创建交易
func (s *TransactionService) CreateTransaction(ctx context.Context, transaction *models.Transaction) error {
	// 设置默认值
	if transaction.Status == "" {
		transaction.Status = "pending"
	}

	return s.transactionRepo.Create(transaction)
}

// GetTransaction 获取交易
func (s *TransactionService) GetTransaction(ctx context.Context, id int64) (*models.Transaction, error) {
	transaction, err := s.transactionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, err
	}

	return transaction, nil
}

// UpdateTransaction 更新交易
func (s *TransactionService) UpdateTransaction(ctx context.Context, id int64, updateData *models.Transaction) (*models.Transaction, error) {
	// 检查交易是否存在
	existingTransaction, err := s.transactionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, err
	}

	// 更新字段
	if updateData.Hash != "" {
		existingTransaction.Hash = updateData.Hash
	}
	if updateData.FromAddress != "" {
		existingTransaction.FromAddress = updateData.FromAddress
	}
	if updateData.ToAddress != "" {
		existingTransaction.ToAddress = updateData.ToAddress
	}
	if updateData.Value != "" {
		existingTransaction.Value = updateData.Value
	}
	if updateData.GasUsed != 0 {
		existingTransaction.GasUsed = updateData.GasUsed
	}
	if updateData.GasPrice != "" {
		existingTransaction.GasPrice = updateData.GasPrice
	}
	if updateData.Status != "" {
		existingTransaction.Status = updateData.Status
	}
	if updateData.BlockNumber != 0 {
		existingTransaction.BlockNumber = updateData.BlockNumber
	}

	err = s.transactionRepo.Update(existingTransaction)
	if err != nil {
		return nil, err
	}

	return existingTransaction, nil
}

// DeleteTransaction 删除交易
func (s *TransactionService) DeleteTransaction(ctx context.Context, id int64) error {
	// 检查交易是否存在
	_, err := s.transactionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("transaction not found")
		}
		return err
	}

	return s.transactionRepo.Delete(id)
}

// ListTransaction 获取交易列表
func (s *TransactionService) ListTransaction(ctx context.Context, page, limit int) ([]models.Transaction, int64, error) {
	offset := (page - 1) * limit

	transactions, err := s.transactionRepo.List(offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.transactionRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetTransactionByHash 根据哈希获取交易
func (s *TransactionService) GetTransactionByHash(ctx context.Context, hash string) (*models.Transaction, error) {
	transaction, err := s.transactionRepo.GetByHash(hash)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, err
	}

	return transaction, nil
}

// GetTransactionByStatus 根据状态获取交易列表
func (s *TransactionService) GetTransactionByStatus(ctx context.Context, status string, page, limit int) ([]models.Transaction, int64, error) {
	offset := (page - 1) * limit

	transactions, err := s.transactionRepo.GetByStatus(status, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.transactionRepo.CountByStatus(status)
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetTransactionByFromAddress 根据发送地址获取交易列表
func (s *TransactionService) GetTransactionByFromAddress(ctx context.Context, fromAddress string, page, limit int) ([]models.Transaction, error) {
	offset := (page - 1) * limit

	transactions, err := s.transactionRepo.GetByFromAddress(fromAddress, offset, limit)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// GetTransactionByToAddress 根据接收地址获取交易列表
func (s *TransactionService) GetTransactionByToAddress(ctx context.Context, toAddress string, page, limit int) ([]models.Transaction, error) {
	offset := (page - 1) * limit

	transactions, err := s.transactionRepo.GetByToAddress(toAddress, offset, limit)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}
