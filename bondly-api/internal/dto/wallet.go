package dto

// GenerateWalletRequest 生成托管钱包请求结构
type GenerateWalletRequest struct {
	UserID int64 `json:"user_id" binding:"required" example:"1"`
}

// GenerateWalletResponse 生成托管钱包响应结构
type GenerateWalletResponse struct {
	UserID               int64  `json:"user_id" example:"1"`
	Nickname             string `json:"nickname" example:"John Doe"`
	CustodyWalletAddress string `json:"custody_wallet_address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Message              string `json:"message" example:"托管钱包生成成功"`
}

// WalletInfoResponse 钱包信息响应结构
type WalletInfoResponse struct {
	UserID               int64   `json:"user_id" example:"1"`
	Nickname             string  `json:"nickname" example:"John Doe"`
	CustodyWalletAddress *string `json:"custody_wallet_address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	HasWallet            bool    `json:"has_wallet" example:"true"`
}
