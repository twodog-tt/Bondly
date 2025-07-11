package dto

// HealthData 健康检查响应数据
type HealthData struct {
	Status  string `json:"status" example:"ok"`
	Message string `json:"message" example:"Bondly API is running"`
	Version string `json:"version" example:"1.0.0"`
}

// BlockchainStatusData 区块链状态响应数据
type BlockchainStatusData struct {
	Network     string `json:"network" example:"ethereum"`
	BlockNumber uint64 `json:"block_number" example:"12345678"`
	GasPrice    string `json:"gas_price" example:"20000000000"`
	Status      string `json:"status" example:"connected"`
}

// ContractInfoData 合约信息响应数据
type ContractInfoData struct {
	Address     string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Name        string `json:"name" example:"BondlyToken"`
	Symbol      string `json:"symbol" example:"BONDLY"`
	TotalSupply string `json:"total_supply" example:"1000000000000000000000000"`
}

// ContentListData 内容列表响应数据
type ContentListData struct {
	Contents []ContentData `json:"contents"`
	Total    int64         `json:"total"`
	Page     int           `json:"page"`
	Limit    int           `json:"limit"`
}

// ContentData 内容数据
type ContentData struct {
	ID            uint    `json:"id" example:"1"`
	Title         string  `json:"title" example:"My First Article"`
	Content       string  `json:"content" example:"This is the content..."`
	Type          string  `json:"type" example:"article"`
	Status        string  `json:"status" example:"published"`
	CoverImageURL *string `json:"cover_image_url" example:"https://example.com/cover.jpg"`
	Likes         int64   `json:"likes" example:"10"`
	Dislikes      int64   `json:"dislikes" example:"2"`
	Views         int64   `json:"views" example:"100"`
	CreatedAt     string  `json:"created_at" example:"2023-12-01T10:00:00Z"`
}

// ContentDetailData 内容详情响应数据
type ContentDetailData struct {
	Content ContentData `json:"content"`
	Author  UserData    `json:"author"`
}

// UserData 用户数据（简化版）
type UserData struct {
	ID              uint    `json:"id" example:"1"`
	Nickname        string  `json:"nickname" example:"John Doe"`
	AvatarURL       *string `json:"avatar_url" example:"https://example.com/avatar.jpg"`
	ReputationScore int     `json:"reputation_score" example:"100"`
}

// ProposalListData 提案列表响应数据
type ProposalListData struct {
	Proposals []ProposalData `json:"proposals"`
	Total     int64          `json:"total"`
	Page      int            `json:"page"`
	Limit     int            `json:"limit"`
}

// ProposalData 提案数据
type ProposalData struct {
	ID           uint   `json:"id" example:"1"`
	Title        string `json:"title" example:"Add New Feature"`
	Description  string `json:"description" example:"This proposal suggests..."`
	Status       string `json:"status" example:"active"`
	VotesFor     int64  `json:"votes_for" example:"50"`
	VotesAgainst int64  `json:"votes_against" example:"10"`
	StartTime    string `json:"start_time" example:"2023-12-01T10:00:00Z"`
	EndTime      string `json:"end_time" example:"2023-12-08T10:00:00Z"`
	CreatedAt    string `json:"created_at" example:"2023-12-01T10:00:00Z"`
}

// ProposalDetailData 提案详情响应数据
type ProposalDetailData struct {
	Proposal ProposalData `json:"proposal"`
	Proposer UserData     `json:"proposer"`
}

// CreateContentData 创建内容响应数据
type CreateContentData struct {
	ID      uint   `json:"id" example:"1"`
	Message string `json:"message" example:"Content created successfully"`
}

// CreateProposalData 创建提案响应数据
type CreateProposalData struct {
	ID      uint   `json:"id" example:"1"`
	Message string `json:"message" example:"Proposal created successfully"`
}

// VoteData 投票响应数据
type VoteData struct {
	ProposalID uint   `json:"proposal_id" example:"1"`
	Vote       bool   `json:"vote" example:"true"`
	Message    string `json:"message" example:"Vote recorded successfully"`
}

// StakeData 质押响应数据
type StakeData struct {
	Amount  string `json:"amount" example:"1000000000000000000"`
	Message string `json:"message" example:"Stake successful"`
}

// StatsData 统计响应数据
type StatsData struct {
	TotalUsers     int64 `json:"total_users" example:"1000"`
	TotalContent   int64 `json:"total_content" example:"500"`
	TotalProposals int64 `json:"total_proposals" example:"50"`
	ActiveVotes    int64 `json:"active_votes" example:"10"`
}
