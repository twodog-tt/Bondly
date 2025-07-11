package models

import (
	"time"
)

// User 用户模型
type User struct {
	ID                   int64      `json:"id" gorm:"primaryKey;autoIncrement" comment:"主键，自增用户 ID（全系统唯一标识，内部使用）"`
	WalletAddress        *string    `json:"wallet_address" gorm:"uniqueIndex:idx_users_wallet_address;size:42;check:char_length(wallet_address) = 42" comment:"用户绑定的钱包地址（如：0xabc...），用于 Web3 登录，允许为空"`
	Email                *string    `json:"email" gorm:"uniqueIndex:idx_users_email;size:255;check:position('@' in email) > 1" comment:"用户邮箱，用于 Web2 登录（验证码登录），允许为空"`
	Nickname             string     `json:"nickname" gorm:"size:64;default:Anonymous;not null;check:char_length(nickname) > 0" comment:"昵称，默认值为 Anonymous，可在个人中心自定义"`
	AvatarURL            *string    `json:"avatar_url" gorm:"type:text" comment:"用户头像链接（支持外链、IPFS、本地等），可为空"`
	Bio                  *string    `json:"bio" gorm:"type:text" comment:"用户个人简介（如：自我介绍、个性签名），可为空"`
	Role                 string     `json:"role" gorm:"size:32;default:user;not null;check:role IN ('user', 'admin', 'moderator')" comment:"用户角色，默认 user，可扩展为 admin、moderator 等"`
	ReputationScore      int        `json:"reputation_score" gorm:"default:0;not null;check:reputation_score >= 0" comment:"声誉积分，默认 0，用于表示用户活跃度、贡献度、治理投票权等"`
	CustodyWalletAddress *string    `json:"custody_wallet_address" gorm:"size:42;check:char_length(custody_wallet_address) = 42" comment:"托管钱包地址，用于平台托管用户资产，允许为空"`
	EncryptedPrivateKey  *string    `json:"encrypted_private_key" gorm:"type:text" comment:"加密的私钥，用于托管钱包操作，允许为空"`
	LastLoginAt          *time.Time `json:"last_login_at" gorm:"comment:用户最后一次登录时间，用于后台管理和活跃度分析"`
	CreatedAt            time.Time  `json:"created_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"注册时间，自动填充为当前时间"`
	UpdatedAt            time.Time  `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"更新时间，建议配合触发器实现自动更新时间戳"`
}

// Content 内容模型
type Content struct {
	ID        int64     `json:"id" gorm:"primaryKey"`
	AuthorID  int64     `json:"author_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Type      string    `json:"type"`                        // article, post, comment
	Status    string    `json:"status" gorm:"default:draft"` // draft, published, archived
	Likes     int64     `json:"likes" gorm:"default:0"`
	Dislikes  int64     `json:"dislikes" gorm:"default:0"`
	Views     int64     `json:"views" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Author    User      `json:"author" gorm:"foreignKey:AuthorID"`
}

// Proposal 提案模型
type Proposal struct {
	ID           int64     `json:"id" gorm:"primaryKey"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	ProposerID   int64     `json:"proposer_id"`
	Status       string    `json:"status" gorm:"default:active"` // active, passed, rejected, executed
	VotesFor     int64     `json:"votes_for" gorm:"default:0"`
	VotesAgainst int64     `json:"votes_against" gorm:"default:0"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Proposer     User      `json:"proposer" gorm:"foreignKey:ProposerID"`
}

// Vote 投票模型
type Vote struct {
	ID         int64     `json:"id" gorm:"primaryKey"`
	ProposalID int64     `json:"proposal_id"`
	VoterID    int64     `json:"voter_id"`
	Vote       bool      `json:"vote"` // true for yes, false for no
	Weight     int64     `json:"weight"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Proposal   Proposal  `json:"proposal" gorm:"foreignKey:ProposalID"`
	Voter      User      `json:"voter" gorm:"foreignKey:VoterID"`
}

// Transaction 交易模型
type Transaction struct {
	ID          int64     `json:"id" gorm:"primaryKey"`
	Hash        string    `json:"hash" gorm:"uniqueIndex"`
	FromAddress string    `json:"from_address"`
	ToAddress   string    `json:"to_address"`
	Value       string    `json:"value"`
	GasUsed     uint64    `json:"gas_used"`
	GasPrice    string    `json:"gas_price"`
	Status      string    `json:"status"` // pending, confirmed, failed
	BlockNumber uint64    `json:"block_number"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Comment 评论模型
type Comment struct {
	ID              int64     `json:"id" gorm:"primaryKey"`
	PostID          int64     `json:"post_id"`
	AuthorID        int64     `json:"author_id"`
	Content         string    `json:"content"`
	ParentCommentID *int64    `json:"parent_comment_id"`
	Likes           int       `json:"likes" gorm:"default:0"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Author          User      `json:"author" gorm:"foreignKey:AuthorID"`
	Post            Content   `json:"post" gorm:"foreignKey:PostID"`
	ParentComment   *Comment  `json:"parent_comment,omitempty" gorm:"foreignKey:ParentCommentID"`
	ChildComments   []Comment `json:"child_comments,omitempty" gorm:"foreignKey:ParentCommentID"`
}

// UserFollower 用户关注关系模型
type UserFollower struct {
	FollowerID int64     `json:"follower_id" gorm:"primaryKey"`
	FollowedID int64     `json:"followed_id" gorm:"primaryKey"`
	CreatedAt  time.Time `json:"created_at"`
	Follower   User      `json:"follower" gorm:"foreignKey:FollowerID"`
	Followed   User      `json:"followed" gorm:"foreignKey:FollowedID"`
}

// WalletBinding 钱包绑定模型
type WalletBinding struct {
	ID            int64     `json:"id" gorm:"primaryKey"`
	UserID        int64     `json:"user_id"`
	WalletAddress string    `json:"wallet_address"`
	Network       string    `json:"network" gorm:"default:ethereum"`
	CreatedAt     time.Time `json:"created_at"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
}
