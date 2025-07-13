package services

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// ContentInteractionService 内容互动服务
type ContentInteractionService struct {
	db *gorm.DB
}

// NewContentInteractionService 创建内容互动服务
func NewContentInteractionService(db *gorm.DB) *ContentInteractionService {
	return &ContentInteractionService{
		db: db,
	}
}

// CreateInteraction 创建内容互动
func (s *ContentInteractionService) CreateInteraction(req dto.CreateInteractionRequest) (*dto.ContentInteraction, error) {
	ctx := context.Background()

	// 检查内容是否存在
	var content models.Content
	if err := s.db.WithContext(ctx).First(&content, req.ContentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}
		return nil, err
	}

	// 检查是否已存在相同的互动
	var existingInteraction models.ContentInteraction
	err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ? AND interaction_type = ?",
		req.ContentID, req.UserID, req.InteractionType).First(&existingInteraction).Error

	if err == nil {
		// 已存在相同的互动，返回现有记录
		return s.convertToDTO(&existingInteraction), nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// 创建新的互动记录
	interaction := models.ContentInteraction{
		ContentID:       req.ContentID,
		UserID:          req.UserID,
		InteractionType: req.InteractionType,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.db.WithContext(ctx).Create(&interaction).Error; err != nil {
		return nil, err
	}

	// 同步更新content表中的统计字段
	if err := s.updateContentStats(ctx, req.ContentID, req.InteractionType, 1); err != nil {
		// 记录错误但不影响主流程
		// TODO: 考虑使用事务来确保数据一致性
	}

	return s.convertToDTO(&interaction), nil
}

// DeleteInteraction 删除内容互动
func (s *ContentInteractionService) DeleteInteraction(contentID int64, userID int64, interactionType string) error {
	ctx := context.Background()

	// 查找并删除互动记录
	result := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ? AND interaction_type = ?",
		contentID, userID, interactionType).Delete(&models.ContentInteraction{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("interaction not found")
	}

	// 同步更新content表中的统计字段
	if err := s.updateContentStats(ctx, contentID, interactionType, -1); err != nil {
		// 记录错误但不影响主流程
		// TODO: 考虑使用事务来确保数据一致性
	}

	return nil
}

// GetInteractionStats 获取内容互动统计
func (s *ContentInteractionService) GetInteractionStats(contentID int64) (*dto.InteractionStats, error) {
	ctx := context.Background()

	// 检查内容是否存在
	var content models.Content
	if err := s.db.WithContext(ctx).First(&content, contentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}
		return nil, err
	}

	stats := &dto.InteractionStats{
		ContentID: contentID,
	}

	// 统计点赞数
	var likeCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "like").Count(&likeCount).Error; err != nil {
		return nil, err
	}
	stats.Likes = likeCount

	// 统计点踩数
	var dislikeCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "dislike").Count(&dislikeCount).Error; err != nil {
		return nil, err
	}
	stats.Dislikes = dislikeCount

	// 统计收藏数
	var bookmarkCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "bookmark").Count(&bookmarkCount).Error; err != nil {
		return nil, err
	}
	stats.Bookmarks = bookmarkCount

	// 统计分享数
	var shareCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "share").Count(&shareCount).Error; err != nil {
		return nil, err
	}
	stats.Shares = shareCount

	return stats, nil
}

// GetUserInteractionStatus 获取用户互动状态
func (s *ContentInteractionService) GetUserInteractionStatus(contentID int64, userID int64) (*dto.UserInteractionStatus, error) {
	ctx := context.Background()

	status := &dto.UserInteractionStatus{}

	// 检查点赞状态
	var likeInteraction models.ContentInteraction
	if err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ? AND interaction_type = ?", contentID, userID, "like").First(&likeInteraction).Error; err == nil {
		status.Liked = true
	}

	// 检查点踩状态
	var dislikeInteraction models.ContentInteraction
	if err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ? AND interaction_type = ?", contentID, userID, "dislike").First(&dislikeInteraction).Error; err == nil {
		status.Disliked = true
	}

	// 检查收藏状态
	var bookmarkInteraction models.ContentInteraction
	if err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ? AND interaction_type = ?", contentID, userID, "bookmark").First(&bookmarkInteraction).Error; err == nil {
		status.Bookmarked = true
	}

	return status, nil
}

// GetUserInteractionStats 获取用户互动统计
func (s *ContentInteractionService) GetUserInteractionStats(ctx context.Context, userID int64) (*dto.UserInteractionStats, error) {
	var stats dto.UserInteractionStats
	stats.UserID = userID

	// 统计点赞数
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("user_id = ? AND interaction_type = ?", userID, "like").Count(&stats.TotalLikes).Error; err != nil {
		return nil, err
	}

	// 统计踩数
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("user_id = ? AND interaction_type = ?", userID, "dislike").Count(&stats.TotalDislikes).Error; err != nil {
		return nil, err
	}

	// 统计收藏数
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("user_id = ? AND interaction_type = ?", userID, "bookmark").Count(&stats.TotalBookmarks).Error; err != nil {
		return nil, err
	}

	// 统计分享数
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("user_id = ? AND interaction_type = ?", userID, "share").Count(&stats.TotalShares).Error; err != nil {
		return nil, err
	}

	return &stats, nil
}

// GetUserBookmarks 获取用户的收藏列表
func (s *ContentInteractionService) GetUserBookmarks(ctx context.Context, userID int64, page, limit int) ([]models.Content, int64, error) {
	var interactions []models.ContentInteraction
	var total int64

	// 获取总数
	if err := s.db.WithContext(ctx).Model(&models.ContentInteraction{}).Where("user_id = ? AND interaction_type = ?", userID, "bookmark").Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取收藏的内容
	offset := (page - 1) * limit
	err := s.db.WithContext(ctx).
		Preload("Content.Author").
		Where("user_id = ? AND interaction_type = ?", userID, "bookmark").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&interactions).Error

	if err != nil {
		return nil, 0, err
	}

	// 提取内容
	var contents []models.Content
	for _, interaction := range interactions {
		contents = append(contents, interaction.Content)
	}

	return contents, total, nil
}

// convertToDTO 转换为DTO
func (s *ContentInteractionService) convertToDTO(interaction *models.ContentInteraction) *dto.ContentInteraction {
	return &dto.ContentInteraction{
		ID:              interaction.ID,
		ContentID:       interaction.ContentID,
		UserID:          interaction.UserID,
		InteractionType: interaction.InteractionType,
		CreatedAt:       interaction.CreatedAt.Format(time.RFC3339),
	}
}

// updateContentStats 更新content表中的统计字段
func (s *ContentInteractionService) updateContentStats(ctx context.Context, contentID int64, interactionType string, delta int) error {
	var updateField string
	switch interactionType {
	case "like":
		updateField = "likes"
	case "dislike":
		updateField = "dislikes"
	default:
		// 对于bookmark和share，不需要更新content表
		return nil
	}

	// 使用原生SQL更新，避免并发问题
	query := fmt.Sprintf("UPDATE contents SET %s = %s + ?, updated_at = NOW() WHERE id = ?", updateField, updateField)
	return s.db.WithContext(ctx).Exec(query, delta, contentID).Error
}
