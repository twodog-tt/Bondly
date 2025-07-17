package dto

// ReputationResponse 声誉分数响应结构
type ReputationResponse struct {
	UserID        int64   `json:"user_id,omitempty" example:"1"`
	WalletAddress *string `json:"wallet_address,omitempty" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Reputation    int     `json:"reputation" example:"1250"`
	Source        string  `json:"source,omitempty" example:"chain"` // chain/database
}

// AddReputationRequest 增加声誉分数请求结构
type AddReputationRequest struct {
	UserID int64  `json:"user_id" binding:"required" example:"1"`
	Amount int    `json:"amount" binding:"required" example:"100"`
	Reason string `json:"reason" example:"优质内容创作"`
}

// SubtractReputationRequest 减少声誉分数请求结构
type SubtractReputationRequest struct {
	UserID int64  `json:"user_id" binding:"required" example:"1"`
	Amount int    `json:"amount" binding:"required" example:"50"`
	Reason string `json:"reason" example:"违规行为处罚"`
}

// GovernanceEligibilityResponse 治理资格检查响应结构
type GovernanceEligibilityResponse struct {
	UserID     int64 `json:"user_id" example:"1"`
	Eligible   bool  `json:"eligible" example:"true"`
	Reputation int   `json:"reputation,omitempty" example:"1250"`
	Threshold  int   `json:"threshold,omitempty" example:"100"`
}

// ReputationRankingItem 声誉排行榜项目结构
type ReputationRankingItem struct {
	Rank          int     `json:"rank" example:"1"`
	UserID        int64   `json:"user_id" example:"1"`
	Nickname      string  `json:"nickname" example:"Alice Crypto"`
	WalletAddress *string `json:"wallet_address,omitempty" example:"0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"`
	AvatarURL     *string `json:"avatar_url,omitempty" example:"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"`
	Reputation    int     `json:"reputation" example:"1250"`
}

// ReputationRankingResponse 声誉排行榜响应结构
type ReputationRankingResponse struct {
	Rankings []ReputationRankingItem `json:"rankings"`
	Total    int                     `json:"total" example:"10"`
}

// ReputationHistoryItem 声誉历史记录项目
type ReputationHistoryItem struct {
	ID        int64  `json:"id" example:"1"`
	UserID    int64  `json:"user_id" example:"1"`
	Change    int    `json:"change" example:"100"` // 正数为增加，负数为减少
	Reason    string `json:"reason" example:"优质内容创作"`
	TxHash    string `json:"tx_hash,omitempty" example:"0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890"`
	CreatedAt string `json:"created_at" example:"2023-12-01T10:00:00Z"`
}

// ReputationHistoryResponse 声誉历史记录响应结构
type ReputationHistoryResponse struct {
	History    []ReputationHistoryItem `json:"history"`
	Total      int                     `json:"total" example:"50"`
	Page       int                     `json:"page" example:"1"`
	Limit      int                     `json:"limit" example:"20"`
	TotalPages int                     `json:"total_pages" example:"3"`
}

// ReputationStatsResponse 声誉统计响应结构
type ReputationStatsResponse struct {
	TotalUsers        int     `json:"total_users" example:"10000"`
	AverageReputation float64 `json:"average_reputation" example:"125.5"`
	TopReputation     int     `json:"top_reputation" example:"3200"`
	ActiveUsers       int     `json:"active_users" example:"2500"`   // 声誉 > 0 的用户
	EligibleUsers     int     `json:"eligible_users" example:"1200"` // 符合治理条件的用户
}
