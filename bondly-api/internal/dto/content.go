package dto

import "time"

// CreateContentRequest 创建内容请求结构
type CreateContentRequest struct {
	Title         string  `json:"title" binding:"required" example:"文章标题"`
	Content       string  `json:"content" binding:"required" example:"文章内容"`
	Type          string  `json:"type" binding:"required" example:"article"` // article, post, comment
	Status        string  `json:"status" example:"draft"`                    // draft, published, archived
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/image.jpg"`
}

// UpdateContentRequest 更新内容请求结构
type UpdateContentRequest struct {
	Title         *string `json:"title" example:"更新后的标题"`
	Content       *string `json:"content" example:"更新后的内容"`
	Type          *string `json:"type" example:"article"`
	Status        *string `json:"status" example:"published"`
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/new-image.jpg"`
}

// ContentResponse 内容响应结构
type ContentResponse struct {
	ID            int64        `json:"id" example:"1"`
	AuthorID      int64        `json:"author_id" example:"1"`
	Title         string       `json:"title" example:"文章标题"`
	Content       string       `json:"content" example:"文章内容"`
	Type          string       `json:"type" example:"article"`
	Status        string       `json:"status" example:"published"`
	CoverImageURL *string      `json:"cover_image_url" example:"https://example.com/image.jpg"`
	Likes         int64        `json:"likes" example:"10"`
	Dislikes      int64        `json:"dislikes" example:"2"`
	Views         int64        `json:"views" example:"100"`
	CreatedAt     time.Time    `json:"created_at" example:"2023-12-01T10:00:00Z"`
	UpdatedAt     time.Time    `json:"updated_at" example:"2023-12-01T10:00:00Z"`
	Author        UserResponse `json:"author"`
}

// ListContentRequest 获取内容列表请求结构
type ListContentRequest struct {
	Page     int    `form:"page" binding:"min=1" example:"1"`
	Limit    int    `form:"limit" binding:"min=1,max=100" example:"10"`
	Type     string `form:"type" example:"article"`
	Status   string `form:"status" example:"published"`
	AuthorID int64  `form:"author_id" example:"1"`
}

// ListContentResponse 获取内容列表响应结构
type ListContentResponse struct {
	Data       []ContentResponse `json:"data"`
	Pagination PaginationData    `json:"pagination"`
}

// PaginationData 分页数据结构
type PaginationData struct {
	Total      int64 `json:"total" example:"100"`
	Page       int   `json:"page" example:"1"`
	Limit      int   `json:"limit" example:"10"`
	TotalPages int   `json:"total_pages" example:"10"`
}

// UserInteractionStats 用户互动统计
type UserInteractionStats struct {
	UserID         int64 `json:"user_id" example:"1"`
	TotalLikes     int64 `json:"total_likes" example:"100"`
	TotalDislikes  int64 `json:"total_dislikes" example:"10"`
	TotalBookmarks int64 `json:"total_bookmarks" example:"50"`
	TotalShares    int64 `json:"total_shares" example:"25"`
}

// CreateInteractionRequest 创建内容互动请求
type CreateInteractionRequest struct {
	ContentID       int64  `json:"content_id" binding:"required" example:"1"`
	InteractionType string `json:"interaction_type" binding:"required" example:"like"` // like, dislike, bookmark, share
	UserID          int64  `json:"-"`                                                  // 从JWT中获取，不在请求体中
}

// ContentInteraction 内容互动响应
type ContentInteraction struct {
	ID              int64         `json:"id" example:"1"`
	ContentID       int64         `json:"content_id" example:"1"`
	UserID          int64         `json:"user_id" example:"1"`
	InteractionType string        `json:"interaction_type" example:"like"`
	CreatedAt       string        `json:"created_at" example:"2023-12-01T10:00:00Z"`
	User            *UserResponse `json:"user,omitempty"`
}

// InteractionStats 内容互动统计
type InteractionStats struct {
	ContentID        int64                 `json:"content_id" example:"1"`
	Likes            int64                 `json:"likes" example:"10"`
	Dislikes         int64                 `json:"dislikes" example:"2"`
	Bookmarks        int64                 `json:"bookmarks" example:"5"`
	Shares           int64                 `json:"shares" example:"3"`
	UserInteractions UserInteractionStatus `json:"user_interactions"`
}

// UserInteractionStatus 用户互动状态
type UserInteractionStatus struct {
	Liked      bool `json:"liked" example:"true"`
	Disliked   bool `json:"disliked" example:"false"`
	Bookmarked bool `json:"bookmarked" example:"true"`
}
