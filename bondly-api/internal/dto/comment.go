package dto

type CreateCommentRequest struct {
	PostID          *int64 `json:"post_id,omitempty" example:"1"`    // 关联posts表，可为空
	ContentID       *int64 `json:"content_id,omitempty" example:"1"` // 关联contents表，可为空
	Content         string `json:"content" binding:"required" example:"这是一条评论内容"`
	ParentCommentID *int64 `json:"parent_comment_id,omitempty" example:"2"`
}

type CommentResponse struct {
	ID              int64             `json:"id" example:"1"`
	PostID          *int64            `json:"post_id,omitempty" example:"1"`
	ContentID       *int64            `json:"content_id,omitempty" example:"1"`
	AuthorID        int64             `json:"author_id" example:"1"`
	Content         string            `json:"content" example:"这是一条评论内容"`
	ParentCommentID *int64            `json:"parent_comment_id,omitempty" example:"2"`
	Likes           int               `json:"likes" example:"5"`
	CreatedAt       string            `json:"created_at" example:"2023-12-01T10:00:00Z"`
	UpdatedAt       string            `json:"updated_at" example:"2023-12-01T10:00:00Z"`
	Author          *UserResponse     `json:"author"`
	ChildComments   []CommentResponse `json:"child_comments,omitempty"`
}

type CommentListResponse struct {
	Comments   []CommentResponse `json:"comments"`
	Pagination PaginationData    `json:"pagination"`
}

type LikeCommentRequest struct {
	CommentID int64 `json:"comment_id" binding:"required" example:"1"`
}

type UnlikeCommentRequest struct {
	CommentID int64 `json:"comment_id" binding:"required" example:"1"`
}
