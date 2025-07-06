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

	err = database.AutoMigrate(db,
		&models.User{},
		&models.Content{},
		&models.Proposal{},
		&models.Vote{},
		&models.Transaction{},
	)

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully!")
}
