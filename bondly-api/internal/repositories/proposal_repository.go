package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type ProposalRepository struct {
	db *gorm.DB
}

func NewProposalRepository(db *gorm.DB) *ProposalRepository {
	return &ProposalRepository{
		db: db,
	}
}

// Create 创建提案
func (r *ProposalRepository) Create(proposal *models.Proposal) error {
	return r.db.Create(proposal).Error
}

// GetByID 根据ID获取提案
func (r *ProposalRepository) GetByID(id int64) (*models.Proposal, error) {
	var proposal models.Proposal
	err := r.db.Preload("Proposer").First(&proposal, id).Error
	if err != nil {
		return nil, err
	}
	return &proposal, nil
}

// Update 更新提案
func (r *ProposalRepository) Update(proposal *models.Proposal) error {
	return r.db.Save(proposal).Error
}

// Delete 删除提案
func (r *ProposalRepository) Delete(id int64) error {
	return r.db.Delete(&models.Proposal{}, id).Error
}

// List 获取提案列表
func (r *ProposalRepository) List(offset, limit int) ([]models.Proposal, error) {
	var proposals []models.Proposal
	err := r.db.Preload("Proposer").Offset(offset).Limit(limit).Order("created_at DESC").Find(&proposals).Error
	return proposals, err
}

// Count 获取提案总数
func (r *ProposalRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Proposal{}).Count(&count).Error
	return count, err
}

// GetByProposerID 根据提案人ID获取提案列表
func (r *ProposalRepository) GetByProposerID(proposerID int64, offset, limit int) ([]models.Proposal, error) {
	var proposals []models.Proposal
	err := r.db.Preload("Proposer").Where("proposer_id = ?", proposerID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&proposals).Error
	return proposals, err
}

// CountByProposerID 根据提案人ID获取提案数量
func (r *ProposalRepository) CountByProposerID(proposerID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.Proposal{}).Where("proposer_id = ?", proposerID).Count(&count).Error
	return count, err
}

// GetByStatus 根据状态获取提案列表
func (r *ProposalRepository) GetByStatus(status string, offset, limit int) ([]models.Proposal, error) {
	var proposals []models.Proposal
	err := r.db.Preload("Proposer").Where("status = ?", status).Offset(offset).Limit(limit).Order("created_at DESC").Find(&proposals).Error
	return proposals, err
}

// CountByStatus 根据状态获取提案数量
func (r *ProposalRepository) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Proposal{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// UpdateVotes 更新投票数
func (r *ProposalRepository) UpdateVotes(id int64, votesFor, votesAgainst int) error {
	return r.db.Model(&models.Proposal{}).Where("id = ?", id).Updates(map[string]interface{}{
		"votes_for":     votesFor,
		"votes_against": votesAgainst,
	}).Error
}
