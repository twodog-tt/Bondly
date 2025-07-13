package services

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"time"
)

type CommentService struct {
	repo *repositories.CommentRepository
}

func NewCommentService(repo *repositories.CommentRepository) *CommentService {
	return &CommentService{repo: repo}
}

func (s *CommentService) CreateComment(req *dto.CreateCommentRequest, authorID int64) (*models.Comment, error) {
	comment := &models.Comment{
		PostID:          req.PostID,
		AuthorID:        authorID,
		Content:         req.Content,
		ParentCommentID: req.ParentCommentID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	if err := s.repo.Create(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *CommentService) GetComment(id int64) (*models.Comment, error) {
	return s.repo.GetByID(id)
}

func (s *CommentService) ListComments(postID int64, parentCommentID *int64, page, limit int) ([]models.Comment, int64, error) {
	offset := (page - 1) * limit
	return s.repo.List(postID, parentCommentID, offset, limit)
}

func (s *CommentService) DeleteComment(id int64, authorID int64) error {
	return s.repo.Delete(id, authorID)
}

func (s *CommentService) LikeComment(id int64) error {
	return s.repo.Like(id)
}

func (s *CommentService) UnlikeComment(id int64) error {
	return s.repo.Unlike(id)
}

// GetCommentCount 获取指定内容的评论数量
func (s *CommentService) GetCommentCount(postID int64) (int64, error) {
	return s.repo.GetCommentCount(postID)
}
