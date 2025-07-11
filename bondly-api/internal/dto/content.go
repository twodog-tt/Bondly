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
