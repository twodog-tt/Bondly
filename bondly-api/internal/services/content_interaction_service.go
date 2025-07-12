package services

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"context"
	"errors"
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

// ToggleLike 切换内容点赞状态
func (s *ContentInteractionService) ToggleLike(ctx context.Context, contentID, userID int64, isLike bool) error {
	// 检查内容是否存在
	var content models.Content
	if err := s.db.WithContext(ctx).First(&content, contentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("content not found")
		}
		return err
	}

	// 查找现有的点赞记录
	var existingLike models.ContentLike
	err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ?", contentID, userID).First(&existingLike).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// 开始事务
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 创建新的点赞记录
			like := models.ContentLike{
				ContentID: contentID,
				UserID:    userID,
				IsLike:    isLike,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			if err := tx.Create(&like).Error; err != nil {
				return err
			}

			// 更新内容的点赞/踩计数
			if isLike {
				if err := tx.Model(&content).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
					return err
				}
			} else {
				if err := tx.Model(&content).UpdateColumn("dislikes", gorm.Expr("dislikes + ?", 1)).Error; err != nil {
					return err
				}
			}
		} else {
			// 更新现有的点赞记录
			oldIsLike := existingLike.IsLike
			if err := tx.Model(&existingLike).Update("is_like", isLike).Error; err != nil {
				return err
			}

			// 更新内容的点赞/踩计数
			if oldIsLike != isLike {
				if oldIsLike {
					// 从点赞改为踩
					if err := tx.Model(&content).UpdateColumn("likes", gorm.Expr("likes - ?", 1)).Error; err != nil {
						return err
					}
					if err := tx.Model(&content).UpdateColumn("dislikes", gorm.Expr("dislikes + ?", 1)).Error; err != nil {
						return err
					}
				} else {
					// 从踩改为点赞
					if err := tx.Model(&content).UpdateColumn("dislikes", gorm.Expr("dislikes - ?", 1)).Error; err != nil {
						return err
					}
					if err := tx.Model(&content).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

// GetUserLikeStatus 获取用户对内容的点赞状态
func (s *ContentInteractionService) GetUserLikeStatus(ctx context.Context, contentID, userID int64) (*models.ContentLike, error) {
	var like models.ContentLike
	err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ?", contentID, userID).First(&like).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // 用户没有点赞记录
		}
		return nil, err
	}
	return &like, nil
}

// ToggleBookmark 切换内容收藏状态
func (s *ContentInteractionService) ToggleBookmark(ctx context.Context, contentID, userID int64) error {
	// 检查内容是否存在
	var content models.Content
	if err := s.db.WithContext(ctx).First(&content, contentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("content not found")
		}
		return err
	}

	// 查找现有的收藏记录
	var existingBookmark models.ContentBookmark
	err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ?", contentID, userID).First(&existingBookmark).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// 创建新的收藏记录
		bookmark := models.ContentBookmark{
			ContentID: contentID,
			UserID:    userID,
			CreatedAt: time.Now(),
		}
		return s.db.WithContext(ctx).Create(&bookmark).Error
	} else {
		// 删除现有的收藏记录
		return s.db.WithContext(ctx).Delete(&existingBookmark).Error
	}
}

// IsBookmarked 检查用户是否收藏了内容
func (s *ContentInteractionService) IsBookmarked(ctx context.Context, contentID, userID int64) (bool, error) {
	var count int64
	err := s.db.WithContext(ctx).Model(&models.ContentBookmark{}).Where("content_id = ? AND user_id = ?", contentID, userID).Count(&count).Error
	return count > 0, err
}

// RecordShare 记录内容分享
func (s *ContentInteractionService) RecordShare(ctx context.Context, contentID, userID int64, platform string) error {
	// 检查内容是否存在
	var content models.Content
	if err := s.db.WithContext(ctx).First(&content, contentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("content not found")
		}
		return err
	}

	// 创建分享记录
	share := models.ContentShare{
		ContentID: contentID,
		UserID:    userID,
		Platform:  platform,
		CreatedAt: time.Now(),
	}
	return s.db.WithContext(ctx).Create(&share).Error
}

// GetUserBookmarks 获取用户的收藏列表
func (s *ContentInteractionService) GetUserBookmarks(ctx context.Context, userID int64, page, limit int) ([]models.Content, int64, error) {
	var bookmarks []models.ContentBookmark
	var total int64

	// 获取总数
	if err := s.db.WithContext(ctx).Model(&models.ContentBookmark{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取收藏的内容
	offset := (page - 1) * limit
	err := s.db.WithContext(ctx).
		Preload("Content.Author").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&bookmarks).Error

	if err != nil {
		return nil, 0, err
	}

	// 提取内容
	var contents []models.Content
	for _, bookmark := range bookmarks {
		contents = append(contents, bookmark.Content)
	}

	return contents, total, nil
}

// GetUserInteractionStats 获取用户互动统计
func (s *ContentInteractionService) GetUserInteractionStats(ctx context.Context, userID int64) (*dto.UserInteractionStats, error) {
	var stats dto.UserInteractionStats
	stats.UserID = userID

	// 统计点赞数
	if err := s.db.WithContext(ctx).Model(&models.ContentLike{}).Where("user_id = ? AND is_like = ?", userID, true).Count(&stats.TotalLikes).Error; err != nil {
		return nil, err
	}

	// 统计踩数
	if err := s.db.WithContext(ctx).Model(&models.ContentLike{}).Where("user_id = ? AND is_like = ?", userID, false).Count(&stats.TotalDislikes).Error; err != nil {
		return nil, err
	}

	// 统计收藏数
	if err := s.db.WithContext(ctx).Model(&models.ContentBookmark{}).Where("user_id = ?", userID).Count(&stats.TotalBookmarks).Error; err != nil {
		return nil, err
	}

	// 统计分享数
	if err := s.db.WithContext(ctx).Model(&models.ContentShare{}).Where("user_id = ?", userID).Count(&stats.TotalShares).Error; err != nil {
		return nil, err
	}

	return &stats, nil
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
		Likes:     content.Likes,
		Dislikes:  content.Dislikes,
	}

	// 统计收藏数
	var bookmarkCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentBookmark{}).Where("content_id = ?", contentID).Count(&bookmarkCount).Error; err != nil {
		return nil, err
	}
	stats.Bookmarks = bookmarkCount

	// 统计分享数
	var shareCount int64
	if err := s.db.WithContext(ctx).Model(&models.ContentShare{}).Where("content_id = ?", contentID).Count(&shareCount).Error; err != nil {
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
	var like models.ContentLike
	if err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ?", contentID, userID).First(&like).Error; err == nil {
		status.Liked = like.IsLike
		status.Disliked = !like.IsLike
	}

	// 检查收藏状态
	var bookmark models.ContentBookmark
	if err := s.db.WithContext(ctx).Where("content_id = ? AND user_id = ?", contentID, userID).First(&bookmark).Error; err == nil {
		status.Bookmarked = true
	}

	return status, nil
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
