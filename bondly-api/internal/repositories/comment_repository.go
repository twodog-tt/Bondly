package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(comment *models.Comment) error {
	return r.db.Create(comment).Error
}

func (r *CommentRepository) GetByID(id int64) (*models.Comment, error) {
	var comment models.Comment
	err := r.db.Preload("Author").Preload("ChildComments").First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *CommentRepository) List(postID int64, contentID int64, parentCommentID *int64, offset, limit int) ([]models.Comment, int64, error) {
	var comments []models.Comment
	var total int64

	// 构建查询条件
	query := r.db.Model(&models.Comment{})
	if postID > 0 {
		query = query.Where("post_id = ?", postID)
	} else if contentID > 0 {
		query = query.Where("content_id = ?", contentID)
	}

	if parentCommentID != nil {
		query = query.Where("parent_comment_id = ?", *parentCommentID)
	} else {
		query = query.Where("parent_comment_id IS NULL")
	}

	query.Count(&total)
	err := query.Preload("Author").Preload("ChildComments").Order("created_at asc").Offset(offset).Limit(limit).Find(&comments).Error
	return comments, total, err
}

func (r *CommentRepository) Delete(id int64, authorID int64) error {
	return r.db.Where("id = ? AND author_id = ?", id, authorID).Delete(&models.Comment{}).Error
}

func (r *CommentRepository) Like(id int64) error {
	return r.db.Model(&models.Comment{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + 1")).Error
}

func (r *CommentRepository) Unlike(id int64) error {
	return r.db.Model(&models.Comment{}).Where("id = ? AND likes > 0", id).UpdateColumn("likes", gorm.Expr("likes - 1")).Error
}

// GetCommentCount 获取指定内容的评论数量
func (r *CommentRepository) GetCommentCount(postID int64, contentID int64) (int64, error) {
	var count int64
	query := r.db.Model(&models.Comment{})

	if postID > 0 {
		query = query.Where("post_id = ?", postID)
	} else if contentID > 0 {
		query = query.Where("content_id = ?", contentID)
	}

	err := query.Count(&count).Error
	return count, err
}
