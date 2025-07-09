package dto

// CreateUserRequest 创建用户请求结构
type CreateUserRequest struct {
	WalletAddress   *string `json:"wallet_address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Email           *string `json:"email" example:"user@example.com"`
	Nickname        string  `json:"nickname" binding:"required" example:"John Doe"`
	AvatarURL       *string `json:"avatar_url" example:"https://example.com/avatar.jpg"`
	Bio             *string `json:"bio" example:"Hello, I'm a blockchain enthusiast"`
	Role            string  `json:"role" example:"user"`
	ReputationScore int     `json:"reputation_score" example:"0"`
}

// UpdateUserRequest 更新用户请求结构
type UpdateUserRequest struct {
	Nickname        *string `json:"nickname" example:"John Doe"`
	AvatarURL       *string `json:"avatar_url" example:"https://example.com/avatar.jpg"`
	Bio             *string `json:"bio" example:"Hello, I'm a blockchain enthusiast"`
	Role            *string `json:"role" example:"user"`
	ReputationScore *int    `json:"reputation_score" example:"100"`
}

// UserResponse 用户响应结构
type UserResponse struct {
	ID              int64   `json:"id" example:"1"`
	WalletAddress   *string `json:"wallet_address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Email           *string `json:"email" example:"user@example.com"`
	Nickname        string  `json:"nickname" example:"John Doe"`
	AvatarURL       *string `json:"avatar_url" example:"https://example.com/avatar.jpg"`
	Bio             *string `json:"bio" example:"Hello, I'm a blockchain enthusiast"`
	Role            string  `json:"role" example:"user"`
	ReputationScore int     `json:"reputation_score" example:"100"`
	LastLoginAt     *string `json:"last_login_at" example:"2023-12-01T10:00:00Z"`
	CreatedAt       string  `json:"created_at" example:"2023-12-01T10:00:00Z"`
	UpdatedAt       string  `json:"updated_at" example:"2023-12-01T10:00:00Z"`
}

// UserListResponse 用户列表响应结构
type UserListResponse struct {
	Users      []UserResponse `json:"users"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}
