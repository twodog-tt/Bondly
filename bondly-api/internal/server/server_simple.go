package server

import (
	"bondly-api/config"
	"bondly-api/internal/handlers"
	"bondly-api/internal/logger"
	"bondly-api/internal/middleware"
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ServerSimple struct {
	config *config.Config
	logger *logger.Logger
	router *gin.Engine
	server *http.Server
}

func NewServerSimple(cfg *config.Config, logger *logger.Logger) *ServerSimple {
	// 设置 Gin 模式
	if cfg.Logging.Level == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// 使用中间件
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.CORS(cfg.CORS))

	server := &ServerSimple{
		config: cfg,
		logger: logger,
		router: router,
	}

	// 设置路由
	server.setupRoutes()

	// 创建 HTTP 服务器
	server.server = &http.Server{
		Addr:    fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	return server
}

func (s *ServerSimple) setupRoutes() {
	// 健康检查
	s.router.GET("/health", handlers.HealthCheck)

	// API 版本
	v1 := s.router.Group("/api/v1")
	{
		// 区块链相关路由
		blockchain := v1.Group("/blockchain")
		{
			blockchain.GET("/status", handlers.GetBlockchainStatus)
			blockchain.GET("/contract/:address", handlers.GetContractInfo)
		}

		// 用户相关路由
		users := v1.Group("/users")
		{
			users.GET("/:address", handlers.GetUserInfo)
			users.GET("/:address/balance", handlers.GetUserBalance)
		}

		// 内容相关路由
		content := v1.Group("/content")
		{
			content.GET("/", handlers.GetContentList)
			content.GET("/:id", handlers.GetContentDetail)
		}

		// 治理相关路由
		governance := v1.Group("/governance")
		{
			governance.GET("/proposals", handlers.GetProposals)
			governance.GET("/proposals/:id", handlers.GetProposalDetail)
		}
	}
}

func (s *ServerSimple) Start() error {
	s.logger.Infof("Server starting on %s:%s", s.config.Server.Host, s.config.Server.Port)
	return s.server.ListenAndServe()
}

func (s *ServerSimple) Shutdown(ctx context.Context) error {
	s.logger.Info("Server shutting down...")
	return s.server.Shutdown(ctx)
}

func (s *ServerSimple) GetRouter() *gin.Engine {
	return s.router
}
