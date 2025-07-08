package models

// ==============================================
// 认证相关请求结构体
// ==============================================

// SendCodeRequest 发送验证码请求
type SendCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com"`
}

// VerifyCodeRequest 验证验证码请求
type VerifyCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com"`
	Code  string `json:"code" binding:"required" example:"123456"`
}

// ==============================================
// 用户相关请求结构体
// ==============================================

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Address  string `json:"address" binding:"required" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Username string `json:"username" example:"john_doe"`
	Avatar   string `json:"avatar" example:"https://example.com/avatar.jpg"`
	Bio      string `json:"bio" example:"区块链开发者，热爱去中心化技术"`
}

// ==============================================
// 区块链相关请求结构体
// ==============================================

// StakeRequest 质押请求
type StakeRequest struct {
	Amount   string `json:"amount" binding:"required" example:"100.5"`
	Duration int    `json:"duration" binding:"required" example:"30"`
}

// ==============================================
// 内容相关请求结构体
// ==============================================

// CreateContentRequest 创建内容请求
type CreateContentRequest struct {
	Title   string `json:"title" binding:"required" example:"区块链技术深度解析"`
	Content string `json:"content" binding:"required" example:"这是一篇关于区块链技术的详细文章..."`
	Type    string `json:"type" binding:"required" example:"article"`
}

// ==============================================
// 治理相关请求结构体
// ==============================================

// CreateProposalRequest 创建提案请求
type CreateProposalRequest struct {
	Title       string `json:"title" binding:"required" example:"提升平台奖励机制"`
	Description string `json:"description" binding:"required" example:"提案详细描述..."`
	EndTime     string `json:"end_time" binding:"required" example:"2024-02-15T23:59:59Z"`
}

// VoteRequest 投票请求
type VoteRequest struct {
	ProposalID uint `json:"proposal_id" binding:"required" example:"1"`
	Vote       bool `json:"vote" binding:"required" example:"true"`
}
