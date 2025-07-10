package server

import (
	"bondly-api/internal/handlers"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// setupRoutes 配置所有路由
func (s *Server) setupRoutes() {
	// 静态文件服务 - 用于访问上传的图片
	s.router.Static("/uploads", "./uploads")

	// 健康检查
	s.router.GET("/health", handlers.HealthCheck)

	// Redis 状态检查
	s.router.GET("/health/redis", s.redisHealthCheck)

	// Swagger文档路由 - 配置支持curl示例
	url := ginSwagger.URL("http://localhost:8080/swagger/doc.json")
	s.router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	// API 版本
	v1 := s.router.Group("/api/v1")
	{
		// 认证相关路由
		auth := v1.Group("/auth")
		{
			auth.POST("/send-code", s.authHandlers.SendVerificationCode)
			auth.POST("/verify-code", s.authHandlers.VerifyCode)
			auth.GET("/code-status", s.authHandlers.GetCodeStatus)
			auth.POST("/login", s.authHandlers.Login)
		}

		// 区块链相关路由
		blockchain := v1.Group("/blockchain")
		{
			blockchain.GET("/status", handlers.GetBlockchainStatus)
			blockchain.GET("/contract/:address", handlers.GetContractInfo)
			blockchain.POST("/stake", handlers.StakeTokens)
		}

		// 用户相关路由
		users := v1.Group("/users")
		{
			users.POST("/", s.userHandlers.CreateUser)                            // 创建用户
			users.GET("/", s.userHandlers.ListUsers)                              // 获取用户列表
			users.GET("/top", s.userHandlers.GetTopUsersByReputation)             // 获取声誉排行榜
			users.GET("/:id", s.userHandlers.GetUserByID)                         // 根据ID获取用户
			users.POST("/:id", s.userHandlers.UpdateUser)                         // 更新用户
			users.GET("/wallet/:address", s.userHandlers.GetUserByWalletAddress)  // 根据钱包地址获取用户
			users.GET("/email/:email", s.userHandlers.GetUserByEmail)             // 根据邮箱获取用户
			users.GET("/:id/custody-wallet", s.userHandlers.GetUserCustodyWallet) // 获取用户托管钱包信息
		}

		// 内容相关路由
		content := v1.Group("/content")
		{
			content.GET("/", handlers.GetContentList)
			content.GET("/:id", handlers.GetContentDetail)
			content.POST("/", handlers.CreateContent)
		}

		// 治理相关路由
		governance := v1.Group("/governance")
		{
			governance.GET("/proposals", handlers.GetProposals)
			governance.GET("/proposals/:id", handlers.GetProposalDetail)
			governance.POST("/proposals", handlers.CreateProposal)
			governance.POST("/proposals/vote", handlers.VoteProposal)
		}

		// 文件上传路由
		upload := v1.Group("/upload")
		{
			upload.POST("/image", s.uploadHandlers.UploadImage)
		}

		// 钱包管理路由
		wallets := v1.Group("/wallets")
		{
			wallets.POST("/generate", s.walletHandlers.GenerateCustodyWallet)      // 生成托管钱包
			wallets.GET("/:user_id", s.walletHandlers.GetWalletInfo)               // 获取钱包信息
			wallets.POST("/batch-generate", s.walletHandlers.BatchGenerateWallets) // 批量生成钱包
		}

		// 统计信息路由
		v1.GET("/stats", handlers.GetStats)

		// 缓存管理路由（开发环境）
		if s.config.Logging.Level == "debug" {
			cacheGroup := v1.Group("/cache")
			{
				cacheGroup.DELETE("/clear", s.clearCache)
				cacheGroup.GET("/stats", s.getCacheStats)
			}
		}
	}
}

// redisHealthCheck Redis 健康检查
func (s *Server) redisHealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := s.redisClient.Ping(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "error",
			"message": "Redis connection failed",
			"error":   err.Error(),
		})
		return
	}

	stats := s.redisClient.GetStats()
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Redis is connected",
		"stats": gin.H{
			"hits":        stats.Hits,
			"misses":      stats.Misses,
			"timeouts":    stats.Timeouts,
			"total_conns": stats.TotalConns,
			"idle_conns":  stats.IdleConns,
			"stale_conns": stats.StaleConns,
		},
	})
}

// clearCache 清空缓存（仅开发环境）
func (s *Server) clearCache(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.redisClient.FlushDB(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to clear cache",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Cache cleared successfully",
	})
}

// getCacheStats 获取缓存统计
func (s *Server) getCacheStats(c *gin.Context) {
	stats := s.redisClient.GetStats()
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"stats": gin.H{
			"hits":        stats.Hits,
			"misses":      stats.Misses,
			"timeouts":    stats.Timeouts,
			"total_conns": stats.TotalConns,
			"idle_conns":  stats.IdleConns,
			"stale_conns": stats.StaleConns,
		},
	})
}
