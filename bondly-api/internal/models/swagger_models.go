package models

import "time"

// ==============================================
// 认证相关请求和响应结构体
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

// AuthSuccessResponse 认证成功响应
type AuthSuccessResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data"`
}

// AuthErrorResponse 认证错误响应
type AuthErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Message string `json:"message" example:"操作失败"`
	Error   string `json:"error,omitempty" example:"详细错误信息"`
}

// CodeStatusData 验证码状态数据
type CodeStatusData struct {
	Email          string `json:"email" example:"user@example.com"`
	CodeExists     bool   `json:"code_exists" example:"true"`
	CodeTTLSeconds int    `json:"code_ttl_seconds" example:"300"`
	Locked         bool   `json:"locked" example:"false"`
	LockTTLSeconds int    `json:"lock_ttl_seconds" example:"0"`
}

// SendCodeData 发送验证码响应数据
type SendCodeData struct {
	Email     string `json:"email" example:"user@example.com"`
	ExpiresIn string `json:"expires_in" example:"10分钟"`
}

// VerifyCodeData 验证码验证响应数据
type VerifyCodeData struct {
	Email      string                 `json:"email" example:"user@example.com"`
	VerifiedAt map[string]interface{} `json:"verified_at"`
}

// ==============================================
// 用户相关请求和响应结构体
// ==============================================

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Address  string `json:"address" binding:"required" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Username string `json:"username" example:"john_doe"`
	Avatar   string `json:"avatar" example:"https://example.com/avatar.jpg"`
	Bio      string `json:"bio" example:"区块链开发者，热爱去中心化技术"`
}

// UserResponse 用户信息响应
type UserResponse struct {
	ID         uint      `json:"id" example:"1"`
	Address    string    `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Username   string    `json:"username" example:"john_doe"`
	Avatar     string    `json:"avatar" example:"https://example.com/avatar.jpg"`
	Bio        string    `json:"bio" example:"区块链开发者，热爱去中心化技术"`
	Reputation int64     `json:"reputation" example:"1500"`
	CreatedAt  time.Time `json:"created_at" example:"2024-01-15T10:30:00Z"`
	UpdatedAt  time.Time `json:"updated_at" example:"2024-01-20T15:45:00Z"`
}

// UserBalanceResponse 用户余额响应
type UserBalanceResponse struct {
	Address  string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Balance  string `json:"balance" example:"1.25"`
	Currency string `json:"currency" example:"ETH"`
}

// UserReputationResponse 用户声誉响应
type UserReputationResponse struct {
	Address         string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Reputation      int64  `json:"reputation" example:"1500"`
	Rank            int    `json:"rank" example:"42"`
	TotalUsers      int    `json:"total_users" example:"10000"`
	ReputationLevel string `json:"reputation_level" example:"Expert"`
}

// ==============================================
// 区块链相关响应结构体
// ==============================================

// BlockchainStatusResponse 区块链状态响应
type BlockchainStatusResponse struct {
	Status  string `json:"status" example:"connected"`
	Network string `json:"network" example:"ethereum"`
	Message string `json:"message" example:"Blockchain connection status"`
}

// ContractInfoResponse 合约信息响应
type ContractInfoResponse struct {
	Address string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Status  string `json:"status" example:"active"`
	Message string `json:"message" example:"Contract information"`
}

// StakeRequest 质押请求
type StakeRequest struct {
	Amount   string `json:"amount" binding:"required" example:"100.5"`
	Duration int    `json:"duration" binding:"required" example:"30"`
}

// StakeResponse 质押响应
type StakeResponse struct {
	TxHash    string    `json:"tx_hash" example:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"`
	Amount    string    `json:"amount" example:"100.5"`
	Duration  int       `json:"duration" example:"30"`
	StartTime time.Time `json:"start_time" example:"2024-01-15T10:30:00Z"`
	EndTime   time.Time `json:"end_time" example:"2024-02-14T10:30:00Z"`
	Rewards   string    `json:"rewards" example:"5.25"`
	Status    string    `json:"status" example:"active"`
}

// ==============================================
// 内容相关请求和响应结构体
// ==============================================

// CreateContentRequest 创建内容请求
type CreateContentRequest struct {
	Title   string `json:"title" binding:"required" example:"区块链技术深度解析"`
	Content string `json:"content" binding:"required" example:"这是一篇关于区块链技术的详细文章..."`
	Type    string `json:"type" binding:"required" example:"article"`
}

// ContentResponse 内容响应
type ContentResponse struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Content detail"`
}

// ContentListResponse 内容列表响应
type ContentListResponse struct {
	Content []interface{} `json:"content"`
	Message string        `json:"message" example:"Content list"`
}

// ==============================================
// 治理相关请求和响应结构体
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

// VoteResponse 投票响应
type VoteResponse struct {
	ID         uint      `json:"id" example:"1"`
	ProposalID uint      `json:"proposal_id" example:"1"`
	VoterID    uint      `json:"voter_id" example:"1"`
	Vote       bool      `json:"vote" example:"true"`
	Weight     int64     `json:"weight" example:"100"`
	CreatedAt  time.Time `json:"created_at" example:"2024-01-15T10:30:00Z"`
}

// ProposalResponse 提案响应
type ProposalResponse struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Proposal detail"`
}

// ProposalListResponse 提案列表响应
type ProposalListResponse struct {
	Proposals []interface{} `json:"proposals"`
	Message   string        `json:"message" example:"Proposals list"`
}

// ==============================================
// 系统监控响应结构体
// ==============================================

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status  string `json:"status" example:"ok"`
	Message string `json:"message" example:"Bondly API is running"`
	Version string `json:"version" example:"1.0.0"`
}

// StatsResponse 统计信息响应
type StatsResponse struct {
	TotalUsers       int    `json:"total_users" example:"10000"`
	TotalContent     int    `json:"total_content" example:"25600"`
	TotalProposals   int    `json:"total_proposals" example:"125"`
	ActiveStakers    int    `json:"active_stakers" example:"3500"`
	TotalValueLocked string `json:"total_value_locked" example:"1250000.50"`
}

// ==============================================
// 通用响应结构体
// ==============================================

// StandardResponse 标准响应
type StandardResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Message string `json:"message" example:"操作失败"`
	Error   string `json:"error,omitempty" example:"详细错误信息"`
}
