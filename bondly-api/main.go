// Bondly API
// @title Bondly API
// @version 1.0
// @description 这是Bondly项目的API文档，提供用户认证、区块链交互、内容管理和治理功能。
// @termsOfService https://bondly.com/terms

// @contact.name Bondly API Support
// @contact.url https://bondly.com/support
// @contact.email support@bondly.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

package main

import (
	_ "bondly-api/docs" // This line is necessary for go-swagger to find your docs!

	"bondly-api/config"
	"bondly-api/internal/database"
	"bondly-api/internal/logger"
	"bondly-api/internal/server"
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// 初始化日志
	logger := logger.NewLogger()

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

	// 创建服务器（完整版本，包含数据库）
	srv := server.NewServer(cfg, db, logger)

	// 启动服务器
	go func() {
		if err := srv.Start(); err != nil {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// 等待中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// 优雅关闭
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Errorf("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exited")
}
