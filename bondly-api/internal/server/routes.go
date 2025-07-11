package server

import (
	"bondly-api/internal/handlers"
	"bondly-api/internal/middleware"
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
			auth.POST("/wallet-login", s.authHandlers.WalletLogin)
		}

		// 区块链相关路由
		blockchain := v1.Group("/blockchain")
		{
			blockchain.GET("/status", handlers.GetBlockchainStatus)
			blockchain.GET("/contract/:address", handlers.GetContractInfo)
			blockchain.POST("/stake", handlers.StakeTokens)
		}

		// 内容相关路由 - 完整的CRUD
		content := v1.Group("/content")
		{
			content.GET("/", s.contentHandlers.ListContent)                                                                       // 获取内容列表
			content.POST("/", middleware.AuthMiddleware(), s.contentHandlers.CreateContent)                                       // 创建内容
			content.GET("/:id", s.contentHandlers.GetContent)                                                                     // 获取内容详情
			content.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("content"), s.contentHandlers.UpdateContent) // 更新内容
			content.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), s.contentHandlers.DeleteContent)          // 删除内容
		}

		// 提案相关路由 - 完整的CRUD
		proposals := v1.Group("/proposals")
		{
			proposals.GET("/", s.proposalHandlers.ListProposals)                                                                       // 获取提案列表
			proposals.POST("/", middleware.AuthMiddleware(), s.proposalHandlers.CreateProposal)                                        // 创建提案
			proposals.GET("/:id", s.proposalHandlers.GetProposal)                                                                      // 获取提案详情
			proposals.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("proposal"), s.proposalHandlers.UpdateProposal) // 更新提案
			proposals.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), s.proposalHandlers.DeleteProposal)           // 删除提案
		}

		// 交易相关路由 - 完整的CRUD
		transactions := v1.Group("/transactions")
		{
			transactions.GET("/", s.transactionHandlers.ListTransactions)                                                             // 获取交易列表
			transactions.POST("/", middleware.AuthMiddleware(), s.transactionHandlers.CreateTransaction)                              // 创建交易
			transactions.GET("/:id", s.transactionHandlers.GetTransaction)                                                            // 获取交易详情
			transactions.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), s.transactionHandlers.UpdateTransaction)    // 更新交易
			transactions.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), s.transactionHandlers.DeleteTransaction) // 删除交易
			transactions.GET("/hash/:hash", s.transactionHandlers.GetTransactionByHash)                                               // 根据哈希获取交易
			transactions.GET("/stats", s.transactionHandlers.GetTransactionStats)                                                     // 获取交易统计
		}

		// 评论相关路由 - 完整的CRUD
		comments := v1.Group("/comments")
		{
			comments.GET("/", s.commentHandlers.ListComments)                                                                         // 获取评论列表
			comments.POST("/", middleware.AuthMiddleware(), s.commentHandlers.CreateComment)                                          // 创建评论
			comments.GET("/:id", s.commentHandlers.GetComment)                                                                        // 获取评论详情
			comments.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("comment"), s.commentHandlers.UpdateComment)    // 更新评论
			comments.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("comment"), s.commentHandlers.DeleteComment) // 删除评论
		}

		// 用户关注相关路由
		follows := v1.Group("/follows")
		{
			follows.POST("/:followed_id", middleware.AuthMiddleware(), s.userFollowHandlers.FollowUser)     // 关注用户
			follows.DELETE("/:followed_id", middleware.AuthMiddleware(), s.userFollowHandlers.UnfollowUser) // 取消关注
		}

		// 用户相关路由 - 扩展关注功能
		users := v1.Group("/users")
		{
			users.POST("/", s.userHandlers.CreateUser)                            // 创建用户
			users.GET("/", s.userHandlers.ListUsers)                              // 获取用户列表
			users.GET("/top", s.userHandlers.GetTopUsersByReputation)             // 获取声誉排行榜
			users.GET("/wallet/:address", s.userHandlers.GetUserByWalletAddress)  // 根据钱包地址获取用户
			users.GET("/email/:email", s.userHandlers.GetUserByEmail)             // 根据邮箱获取用户
			users.GET("/:id/followers", s.userFollowHandlers.GetFollowers)        // 获取用户粉丝列表
			users.GET("/:id/following", s.userFollowHandlers.GetFollowing)        // 获取用户关注列表
			users.GET("/:id/custody-wallet", s.userHandlers.GetUserCustodyWallet) // 获取用户托管钱包信息
			users.GET("/:id", s.userHandlers.GetUserByID)                         // 根据ID获取用户
			users.POST("/:id", s.userHandlers.UpdateUser)                         // 更新用户
		}

		// 钱包绑定相关路由 - 完整的CRUD
		walletBindings := v1.Group("/wallet-bindings")
		{
			walletBindings.GET("/", s.walletBindingHandlers.ListWalletBindings)                                                                                // 获取钱包绑定列表
			walletBindings.POST("/", middleware.AuthMiddleware(), s.walletBindingHandlers.CreateWalletBinding)                                                 // 创建钱包绑定
			walletBindings.GET("/:id", s.walletBindingHandlers.GetWalletBinding)                                                                               // 获取钱包绑定详情
			walletBindings.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("wallet_binding"), s.walletBindingHandlers.UpdateWalletBinding)    // 更新钱包绑定
			walletBindings.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminOrOwner("wallet_binding"), s.walletBindingHandlers.DeleteWalletBinding) // 删除钱包绑定
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
			wallets.POST("/bind", s.walletHandlers.BindUserWallet)                 // 绑定用户钱包
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
