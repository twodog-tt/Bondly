package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"

	"gorm.io/gorm"
)

type ContentService struct {
	contentRepo *repositories.ContentRepository
}

func NewContentService(contentRepo *repositories.ContentRepository) *ContentService {
	return &ContentService{
		contentRepo: contentRepo,
	}
}

// CreateContent 创建内容
func (s *ContentService) CreateContent(ctx context.Context, content *models.Content) error {
	// 设置默认值
	if content.Type == "" {
		content.Type = "article"
	}
	if content.Status == "" {
		content.Status = "draft"
	}

	return s.contentRepo.Create(content)
}

// GetContent 获取内容
func (s *ContentService) GetContent(ctx context.Context, id int64) (*models.Content, error) {
	content, err := s.contentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}
		return nil, err
	}

	// 增加浏览量
	s.contentRepo.IncrementViews(id)

	return content, nil
}

// UpdateContent 更新内容
func (s *ContentService) UpdateContent(ctx context.Context, id int64, updateData *models.Content) (*models.Content, error) {
	// 检查内容是否存在
	existingContent, err := s.contentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}
		return nil, err
	}

	// 更新字段
	if updateData.Title != "" {
		existingContent.Title = updateData.Title
	}
	if updateData.Content != "" {
		existingContent.Content = updateData.Content
	}
	if updateData.Type != "" {
		existingContent.Type = updateData.Type
	}
	if updateData.Status != "" {
		existingContent.Status = updateData.Status
	}
	// 更新封面图片URL（允许设置为空值）
	if updateData.CoverImageURL != nil {
		existingContent.CoverImageURL = updateData.CoverImageURL
	}

	err = s.contentRepo.Update(existingContent)
	if err != nil {
		return nil, err
	}

	return existingContent, nil
}

// DeleteContent 删除内容
func (s *ContentService) DeleteContent(ctx context.Context, id int64) error {
	// 检查内容是否存在
	_, err := s.contentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("content not found")
		}
		return err
	}

	return s.contentRepo.Delete(id)
}

// ListContent 获取内容列表
func (s *ContentService) ListContent(ctx context.Context, page, limit int) ([]models.Content, int64, error) {
	offset := (page - 1) * limit

	contents, err := s.contentRepo.List(offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.contentRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	return contents, total, nil
}

// GetContentByAuthor 根据作者获取内容列表
func (s *ContentService) GetContentByAuthor(ctx context.Context, authorID int64, page, limit int) ([]models.Content, int64, error) {
	offset := (page - 1) * limit

	contents, err := s.contentRepo.GetByAuthorID(authorID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.contentRepo.CountByAuthorID(authorID)
	if err != nil {
		return nil, 0, err
	}

	return contents, total, nil
}
