package dto

// CreateContentRequest 创建内容请求
type CreateContentRequest struct {
	Title         string  `json:"title" binding:"required" example:"My Article Title"`
	Content       string  `json:"content" binding:"required" example:"This is the article content..."`
	Type          string  `json:"type" example:"article"`
	Status        string  `json:"status" example:"draft"`
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/cover.jpg"`
}

// UpdateContentRequest 更新内容请求
type UpdateContentRequest struct {
	Title         *string `json:"title" example:"Updated Article Title"`
	Content       *string `json:"content" example:"Updated article content..."`
	Type          *string `json:"type" example:"article"`
	Status        *string `json:"status" example:"published"`
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/new-cover.jpg"`
}

// ContentResponse 内容响应数据
type ContentResponse struct {
	ID            int64   `json:"id" example:"1"`
	AuthorID      int64   `json:"author_id" example:"1"`
	Title         string  `json:"title" example:"My Article Title"`
	Content       string  `json:"content" example:"This is the article content..."`
	Type          string  `json:"type" example:"article"`
	Status        string  `json:"status" example:"published"`
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/cover.jpg"`
	Likes         int64   `json:"likes" example:"10"`
	Dislikes      int64   `json:"dislikes" example:"2"`
	Views         int64   `json:"views" example:"100"`
	CreatedAt     string  `json:"created_at" example:"2023-12-01T10:00:00Z"`
	UpdatedAt     string  `json:"updated_at" example:"2023-12-01T10:00:00Z"`
}

// ContentListResponse 内容列表响应数据
type ContentListResponse struct {
	Contents   []ContentResponse `json:"contents"`
	Pagination PaginationData    `json:"pagination"`
}

// PaginationData 分页数据
type PaginationData struct {
	Total      int64 `json:"total" example:"100"`
	Page       int   `json:"page" example:"1"`
	Limit      int   `json:"limit" example:"10"`
	TotalPages int   `json:"total_pages" example:"10"`
}

// ContentLikeRequest 内容点赞请求
type ContentLikeRequest struct {
	ContentID int64 `json:"content_id" binding:"required" example:"1"`
	IsLike    bool  `json:"is_like" example:"true"` // true for like, false for dislike
}

// ContentLikeResponse 内容点赞响应
type ContentLikeResponse struct {
	ContentID int64 `json:"content_id" example:"1"`
	UserID    int64 `json:"user_id" example:"1"`
	IsLike    bool  `json:"is_like" example:"true"`
	Likes     int64 `json:"likes" example:"10"`
	Dislikes  int64 `json:"dislikes" example:"2"`
}

// ContentBookmarkRequest 内容收藏请求
type ContentBookmarkRequest struct {
	ContentID int64 `json:"content_id" binding:"required" example:"1"`
}

// ContentBookmarkResponse 内容收藏响应
type ContentBookmarkResponse struct {
	ContentID    int64 `json:"content_id" example:"1"`
	UserID       int64 `json:"user_id" example:"1"`
	IsBookmarked bool  `json:"is_bookmarked" example:"true"`
}

// ContentShareRequest 内容分享请求
type ContentShareRequest struct {
	ContentID int64  `json:"content_id" binding:"required" example:"1"`
	Platform  string `json:"platform" binding:"required" example:"twitter"`
}

// ContentShareResponse 内容分享响应
type ContentShareResponse struct {
	ContentID int64  `json:"content_id" example:"1"`
	Platform  string `json:"platform" example:"twitter"`
	ShareURL  string `json:"share_url" example:"https://twitter.com/intent/tweet?text=..."`
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
