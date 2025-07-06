package models

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Address    string         `json:"address" gorm:"uniqueIndex;not null"`
	Username   string         `json:"username"`
	Avatar     string         `json:"avatar"`
	Bio        string         `json:"bio"`
	Reputation int64          `json:"reputation" gorm:"default:0"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// Content 内容模型
type Content struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	AuthorID  uint           `json:"author_id"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Type      string         `json:"type"`                        // article, post, comment
	Status    string         `json:"status" gorm:"default:draft"` // draft, published, archived
	Likes     int64          `json:"likes" gorm:"default:0"`
	Dislikes  int64          `json:"dislikes" gorm:"default:0"`
	Views     int64          `json:"views" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Author    User           `json:"author" gorm:"foreignKey:AuthorID"`
}

// Proposal 提案模型
type Proposal struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Title        string         `json:"title"`
	Description  string         `json:"description"`
	ProposerID   uint           `json:"proposer_id"`
	Status       string         `json:"status" gorm:"default:active"` // active, passed, rejected, executed
	VotesFor     int64          `json:"votes_for" gorm:"default:0"`
	VotesAgainst int64          `json:"votes_against" gorm:"default:0"`
	StartTime    time.Time      `json:"start_time"`
	EndTime      time.Time      `json:"end_time"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Proposer     User           `json:"proposer" gorm:"foreignKey:ProposerID"`
}

// Vote 投票模型
type Vote struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	ProposalID uint           `json:"proposal_id"`
	VoterID    uint           `json:"voter_id"`
	Vote       bool           `json:"vote"` // true for yes, false for no
	Weight     int64          `json:"weight"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Proposal   Proposal       `json:"proposal" gorm:"foreignKey:ProposalID"`
	Voter      User           `json:"voter" gorm:"foreignKey:VoterID"`
}

// Transaction 交易模型
type Transaction struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Hash        string         `json:"hash" gorm:"uniqueIndex"`
	FromAddress string         `json:"from_address"`
	ToAddress   string         `json:"to_address"`
	Value       string         `json:"value"`
	GasUsed     uint64         `json:"gas_used"`
	GasPrice    string         `json:"gas_price"`
	Status      string         `json:"status"` // pending, confirmed, failed
	BlockNumber uint64         `json:"block_number"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
