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
	HasReceivedAirdrop   bool       `json:"has_received_airdrop" gorm:"default:false;not null" comment:"是否已获得新用户空投"`
	LastLoginAt          *time.Time `json:"last_login_at" gorm:"comment:用户最后一次登录时间，用于后台管理和活跃度分析"`
	CreatedAt            time.Time  `json:"created_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"注册时间，自动填充为当前时间"`
	UpdatedAt            time.Time  `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"更新时间，建议配合触发器实现自动更新时间戳"`
}

// Post 文章模型（新版）
type Post struct {
	ID            int64     `json:"id" gorm:"primaryKey;autoIncrement" comment:"文章唯一标识，自增主键"`
	AuthorID      int64     `json:"author_id" gorm:"not null" comment:"文章作者的用户 ID，外键关联 users 表"`
	Title         string    `json:"title" gorm:"type:text;not null;check:char_length(title) > 0" comment:"文章标题，不能为空"`
	Content       string    `json:"content" gorm:"type:text;not null;check:char_length(content) > 0" comment:"文章正文内容，支持富文本格式"`
	CoverImageURL *string   `json:"cover_image_url" gorm:"type:text" comment:"文章封面图片的 URL，可选"`
	Tags          []string  `json:"tags" gorm:"type:text[];default:'{}'" comment:"文章标签列表，使用 TEXT 数组存储"`
	Likes         int       `json:"likes" gorm:"default:0;not null;check:likes >= 0" comment:"文章点赞数量，默认值为 0"`
	Views         int       `json:"views" gorm:"default:0;not null;check:views >= 0" comment:"文章浏览次数，默认值为 0"`
	IsPublished   bool      `json:"is_published" gorm:"default:true;not null" comment:"文章是否公开发布，true 为已发布，false 为草稿或隐藏"`
	CreatedAt     time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"文章创建时间，默认为当前时间"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP;not null" comment:"文章最后修改时间，默认为当前时间"`
	Author        User      `json:"author" gorm:"foreignKey:AuthorID"`
}

// Content 内容模型（兼容旧版）
type Content struct {
	ID                 int64     `json:"id" gorm:"primaryKey"`
	AuthorID           int64     `json:"author_id"`
	Title              string    `json:"title"`
	Content            string    `json:"content"`
	Type               string    `json:"type"`                        // article, post, comment
	Status             string    `json:"status" gorm:"default:draft"` // draft, published, archived
	CoverImageURL      *string   `json:"cover_image_url" gorm:"type:text" comment:"封面图片URL"`
	NFTTokenID         *int64    `json:"nft_token_id" gorm:"column:nft_token_id;comment:NFT Token ID，如果内容已铸造为NFT"`
	NFTContractAddress *string   `json:"nft_contract_address" gorm:"column:nft_contract_address;comment:NFT合约地址"`
	IPFSHash           *string   `json:"ip_fs_hash" gorm:"column:ip_fs_hash;comment:IPFS内容哈希"`
	MetadataHash       *string   `json:"metadata_hash" gorm:"column:metadata_hash;comment:IPFS元数据哈希"`
	Likes              int64     `json:"likes" gorm:"default:0"`
	Dislikes           int64     `json:"dislikes" gorm:"default:0"`
	Views              int64     `json:"views" gorm:"default:0"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	Author             User      `json:"author" gorm:"foreignKey:AuthorID"`
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
	PostID          *int64    `json:"post_id"`    // 关联posts表，可为空
	ContentID       *int64    `json:"content_id"` // 关联contents表，可为空
	AuthorID        int64     `json:"author_id"`
	Content         string    `json:"content"`
	ParentCommentID *int64    `json:"parent_comment_id"`
	Likes           int       `json:"likes" gorm:"default:0"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Author          User      `json:"author" gorm:"foreignKey:AuthorID"`
	Post            *Post     `json:"post,omitempty" gorm:"foreignKey:PostID"`
	ContentRef      *Content  `json:"content_ref,omitempty" gorm:"foreignKey:ContentID"`
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

// ContentInteraction 内容互动模型
type ContentInteraction struct {
	ID              int64     `json:"id" gorm:"primaryKey"`
	ContentID       int64     `json:"content_id"`
	UserID          int64     `json:"user_id"`
	InteractionType string    `json:"interaction_type"` // like, dislike, bookmark, share
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Content         Content   `json:"content" gorm:"foreignKey:ContentID"`
	User            User      `json:"user" gorm:"foreignKey:UserID"`
}

// AirdropRecord 空投记录模型
type AirdropRecord struct {
	ID            int64     `json:"id" gorm:"primaryKey"`
	UserID        int64     `json:"user_id" gorm:"not null"`
	WalletAddress string    `json:"wallet_address" gorm:"not null"`
	Amount        string    `json:"amount" gorm:"not null"`
	TxHash        string    `json:"tx_hash" gorm:"not null"`
	Status        string    `json:"status" gorm:"default:pending"` // pending, success, failed
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
}
