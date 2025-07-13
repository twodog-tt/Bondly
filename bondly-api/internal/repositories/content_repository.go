package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type ContentRepository struct {
	db *gorm.DB
}

func NewContentRepository(db *gorm.DB) *ContentRepository {
	return &ContentRepository{
		db: db,
	}
}

// Create 创建内容
func (r *ContentRepository) Create(content *models.Content) error {
	return r.db.Create(content).Error
}

// GetByID 根据ID获取内容
func (r *ContentRepository) GetByID(id int64) (*models.Content, error) {
	var content models.Content
	err := r.db.Preload("Author").First(&content, id).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// Update 更新内容
func (r *ContentRepository) Update(content *models.Content) error {
	return r.db.Save(content).Error
}

// Delete 删除内容
func (r *ContentRepository) Delete(id int64) error {
	return r.db.Delete(&models.Content{}, id).Error
}

// List 获取内容列表
func (r *ContentRepository) List(offset, limit int) ([]models.Content, error) {
	var contents []models.Content
	err := r.db.Preload("Author").Offset(offset).Limit(limit).Order("created_at DESC").Find(&contents).Error
	return contents, err
}

// ListWithStatus 根据状态获取内容列表
func (r *ContentRepository) ListWithStatus(offset, limit int, status string) ([]models.Content, error) {
	var contents []models.Content
	query := r.db.Preload("Author").Offset(offset).Limit(limit).Order("created_at DESC")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Find(&contents).Error
	return contents, err
}

// Count 获取内容总数
func (r *ContentRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Content{}).Count(&count).Error
	return count, err
}

// CountWithStatus 根据状态获取内容总数
func (r *ContentRepository) CountWithStatus(status string) (int64, error) {
	var count int64
	query := r.db.Model(&models.Content{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Count(&count).Error
	return count, err
}

// GetByAuthorID 根据作者ID获取内容列表
func (r *ContentRepository) GetByAuthorID(authorID int64, offset, limit int) ([]models.Content, error) {
	var contents []models.Content
	err := r.db.Preload("Author").Where("author_id = ?", authorID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&contents).Error
	return contents, err
}

// CountByAuthorID 根据作者ID获取内容数量
func (r *ContentRepository) CountByAuthorID(authorID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.Content{}).Where("author_id = ?", authorID).Count(&count).Error
	return count, err
}

// IncrementViews 增加浏览量
func (r *ContentRepository) IncrementViews(id int64) error {
	return r.db.Model(&models.Content{}).Where("id = ?", id).UpdateColumn("views", gorm.Expr("views + 1")).Error
}

// GetInteractionStats 获取内容的互动统计
func (r *ContentRepository) GetInteractionStats(contentID int64) (likes int64, dislikes int64, err error) {
	// 统计点赞数
	if err := r.db.Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "like").Count(&likes).Error; err != nil {
		return 0, 0, err
	}

	// 统计点踩数
	if err := r.db.Model(&models.ContentInteraction{}).Where("content_id = ? AND interaction_type = ?", contentID, "dislike").Count(&dislikes).Error; err != nil {
		return 0, 0, err
	}

	return likes, dislikes, nil
}
