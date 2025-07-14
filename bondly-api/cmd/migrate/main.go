package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"bondly-api/internal/models"
	"log"
)

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 连接数据库
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.CloseConnection(db)

	// 自动迁移数据库表
	log.Println("Starting database migration...")

	// 按依赖关系顺序迁移表
	err = database.AutoMigrate(db,
		&models.User{},               // 用户表（基础表）
		&models.Post{},               // 文章表（新版）
		&models.Content{},            // 内容表（兼容旧版）
		&models.Proposal{},           // 提案表
		&models.Vote{},               // 投票表
		&models.Transaction{},        // 交易表
		&models.Comment{},            // 评论表（依赖Post表）
		&models.UserFollower{},       // 用户关注关系表
		&models.WalletBinding{},      // 钱包绑定表
		&models.ContentInteraction{}, // 内容互动表
	)

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully!")
	log.Println("✅ All tables have been created/updated:")
	log.Println("   - users (用户表)")
	log.Println("   - posts (文章表 - 新版)")
	log.Println("   - contents (内容表 - 兼容旧版)")
	log.Println("   - proposals (提案表)")
	log.Println("   - votes (投票表)")
	log.Println("   - transactions (交易表)")
	log.Println("   - comments (评论表)")
	log.Println("   - user_followers (用户关注关系表)")
	log.Println("   - wallet_bindings (钱包绑定表)")
	log.Println("   - content_interactions (内容互动表)")
}
