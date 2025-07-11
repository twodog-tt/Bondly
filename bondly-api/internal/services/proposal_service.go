package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ProposalService struct {
	proposalRepo *repositories.ProposalRepository
}

func NewProposalService(proposalRepo *repositories.ProposalRepository) *ProposalService {
	return &ProposalService{
		proposalRepo: proposalRepo,
	}
}

// CreateProposal 创建提案
func (s *ProposalService) CreateProposal(ctx context.Context, proposal *models.Proposal) error {
	// 设置默认值
	if proposal.Status == "" {
		proposal.Status = "active"
	}
	if proposal.StartTime.IsZero() {
		proposal.StartTime = time.Now()
	}
	if proposal.EndTime.IsZero() {
		proposal.EndTime = time.Now().Add(7 * 24 * time.Hour) // 默认7天
	}

	return s.proposalRepo.Create(proposal)
}

// GetProposal 获取提案
func (s *ProposalService) GetProposal(ctx context.Context, id int64) (*models.Proposal, error) {
	proposal, err := s.proposalRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("proposal not found")
		}
		return nil, err
	}

	return proposal, nil
}

// UpdateProposal 更新提案
func (s *ProposalService) UpdateProposal(ctx context.Context, id int64, updateData *models.Proposal) (*models.Proposal, error) {
	// 检查提案是否存在
	existingProposal, err := s.proposalRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("proposal not found")
		}
		return nil, err
	}

	// 更新字段
	if updateData.Title != "" {
		existingProposal.Title = updateData.Title
	}
	if updateData.Description != "" {
		existingProposal.Description = updateData.Description
	}
	if updateData.Status != "" {
		existingProposal.Status = updateData.Status
	}
	if !updateData.StartTime.IsZero() {
		existingProposal.StartTime = updateData.StartTime
	}
	if !updateData.EndTime.IsZero() {
		existingProposal.EndTime = updateData.EndTime
	}

	err = s.proposalRepo.Update(existingProposal)
	if err != nil {
		return nil, err
	}

	return existingProposal, nil
}

// DeleteProposal 删除提案
func (s *ProposalService) DeleteProposal(ctx context.Context, id int64) error {
	// 检查提案是否存在
	_, err := s.proposalRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("proposal not found")
		}
		return err
	}

	return s.proposalRepo.Delete(id)
}

// ListProposal 获取提案列表
func (s *ProposalService) ListProposal(ctx context.Context, page, limit int) ([]models.Proposal, int64, error) {
	offset := (page - 1) * limit

	proposals, err := s.proposalRepo.List(offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.proposalRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	return proposals, total, nil
}

// GetProposalByProposer 根据提案人获取提案列表
func (s *ProposalService) GetProposalByProposer(ctx context.Context, proposerID int64, page, limit int) ([]models.Proposal, int64, error) {
	offset := (page - 1) * limit

	proposals, err := s.proposalRepo.GetByProposerID(proposerID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.proposalRepo.CountByProposerID(proposerID)
	if err != nil {
		return nil, 0, err
	}

	return proposals, total, nil
}

// GetProposalByStatus 根据状态获取提案列表
func (s *ProposalService) GetProposalByStatus(ctx context.Context, status string, page, limit int) ([]models.Proposal, int64, error) {
	offset := (page - 1) * limit

	proposals, err := s.proposalRepo.GetByStatus(status, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.proposalRepo.CountByStatus(status)
	if err != nil {
		return nil, 0, err
	}

	return proposals, total, nil
}

// UpdateVotes 更新投票数
func (s *ProposalService) UpdateVotes(ctx context.Context, id int64, votesFor, votesAgainst int) error {
	return s.proposalRepo.UpdateVotes(id, votesFor, votesAgainst)
}
