package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

// Create 创建评论
func (r *CommentRepository) Create(comment *models.Comment) error {
	return r.db.Create(comment).Error
}

// GetByID 根据ID获取评论
func (r *CommentRepository) GetByID(id int64) (*models.Comment, error) {
	var comment models.Comment
	err := r.db.Preload("Author").Preload("Post").Preload("ParentComment").First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// Update 更新评论
func (r *CommentRepository) Update(comment *models.Comment) error {
	return r.db.Save(comment).Error
}

// Delete 删除评论
func (r *CommentRepository) Delete(id int64) error {
	return r.db.Delete(&models.Comment{}, id).Error
}

// List 获取评论列表
func (r *CommentRepository) List(offset, limit int) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("Author").Preload("Post").Preload("ParentComment").Offset(offset).Limit(limit).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// Count 获取评论总数
func (r *CommentRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Comment{}).Count(&count).Error
	return count, err
}

// GetByPostID 根据文章ID获取评论列表
func (r *CommentRepository) GetByPostID(postID int64, offset, limit int) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("Author").Preload("Post").Preload("ParentComment").Where("post_id = ?", postID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// CountByPostID 根据文章ID获取评论数量
func (r *CommentRepository) CountByPostID(postID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

// GetByAuthorID 根据作者ID获取评论列表
func (r *CommentRepository) GetByAuthorID(authorID int64, offset, limit int) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("Author").Preload("Post").Preload("ParentComment").Where("author_id = ?", authorID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// CountByAuthorID 根据作者ID获取评论数量
func (r *CommentRepository) CountByAuthorID(authorID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.Comment{}).Where("author_id = ?", authorID).Count(&count).Error
	return count, err
}

// GetByParentCommentID 根据父评论ID获取子评论列表
func (r *CommentRepository) GetByParentCommentID(parentCommentID int64, offset, limit int) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("Author").Preload("Post").Preload("ParentComment").Where("parent_comment_id = ?", parentCommentID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// CountByParentCommentID 根据父评论ID获取子评论数量
func (r *CommentRepository) CountByParentCommentID(parentCommentID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.Comment{}).Where("parent_comment_id = ?", parentCommentID).Count(&count).Error
	return count, err
}
