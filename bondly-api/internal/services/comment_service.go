package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"

	"gorm.io/gorm"
)

type CommentService struct {
	commentRepo *repositories.CommentRepository
}

func NewCommentService(commentRepo *repositories.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

// CreateComment 创建评论
func (s *CommentService) CreateComment(ctx context.Context, comment *models.Comment) error {
	return s.commentRepo.Create(comment)
}

// GetComment 获取评论
func (s *CommentService) GetComment(ctx context.Context, id int64) (*models.Comment, error) {
	comment, err := s.commentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comment not found")
		}
		return nil, err
	}

	return comment, nil
}

// UpdateComment 更新评论
func (s *CommentService) UpdateComment(ctx context.Context, id int64, updateData *models.Comment) (*models.Comment, error) {
	// 检查评论是否存在
	existingComment, err := s.commentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comment not found")
		}
		return nil, err
	}

	// 更新字段
	if updateData.Content != "" {
		existingComment.Content = updateData.Content
	}

	err = s.commentRepo.Update(existingComment)
	if err != nil {
		return nil, err
	}

	return existingComment, nil
}

// DeleteComment 删除评论
func (s *CommentService) DeleteComment(ctx context.Context, id int64) error {
	// 检查评论是否存在
	_, err := s.commentRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("comment not found")
		}
		return err
	}

	return s.commentRepo.Delete(id)
}

// ListComment 获取评论列表
func (s *CommentService) ListComment(ctx context.Context, page, limit int) ([]models.Comment, int64, error) {
	offset := (page - 1) * limit

	comments, err := s.commentRepo.List(offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.commentRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

// GetCommentByPost 根据文章获取评论列表
func (s *CommentService) GetCommentByPost(ctx context.Context, postID int64, page, limit int) ([]models.Comment, int64, error) {
	offset := (page - 1) * limit

	comments, err := s.commentRepo.GetByPostID(postID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.commentRepo.CountByPostID(postID)
	if err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

// GetCommentByAuthor 根据作者获取评论列表
func (s *CommentService) GetCommentByAuthor(ctx context.Context, authorID int64, page, limit int) ([]models.Comment, int64, error) {
	offset := (page - 1) * limit

	comments, err := s.commentRepo.GetByAuthorID(authorID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.commentRepo.CountByAuthorID(authorID)
	if err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

// GetCommentByParent 根据父评论获取子评论列表
func (s *CommentService) GetCommentByParent(ctx context.Context, parentCommentID int64, page, limit int) ([]models.Comment, int64, error) {
	offset := (page - 1) * limit

	comments, err := s.commentRepo.GetByParentCommentID(parentCommentID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.commentRepo.CountByParentCommentID(parentCommentID)
	if err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}
