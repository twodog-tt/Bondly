package server

import (
	"bondly-api/config"
	"bondly-api/internal/cache"
	"bondly-api/internal/handlers"
	"bondly-api/internal/logger"
	"bondly-api/internal/middleware"
	"bondly-api/internal/redis"
	"bondly-api/internal/repositories"
	"bondly-api/internal/services"
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	config       *config.Config
	db           *gorm.DB
	redisClient  *redis.RedisClient
	cacheService cache.CacheService
	logger       *logger.Logger
	router       *gin.Engine
	server       *http.Server

	// 依赖注入
	userHandlers   *handlers.UserHandlers
	authHandlers   *handlers.AuthHandlers
	uploadHandlers *handlers.UploadHandlers
	walletHandlers *handlers.WalletHandlers
}

func NewServer(cfg *config.Config, db *gorm.DB, logger *logger.Logger) *Server {
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

	// 初始化 Redis 客户端
	redisClient, err := redis.NewRedisClient(cfg.Redis)
	if err != nil {
		logger.Fatalf("Failed to connect to Redis: %v", err)
	}
	logger.Info("Redis connected successfully")

	// 初始化缓存服务
	cacheService := cache.NewRedisCacheService(redisClient)

	// 初始化依赖
	userRepo := repositories.NewUserRepository(db)
	walletService := services.NewWalletService()
	userService := services.NewUserService(userRepo, cacheService, walletService)
	userHandlers := handlers.NewUserHandlers(userService)
	walletHandlers := handlers.NewWalletHandlers(walletService, userService)

	// 初始化认证服务
	authService := services.NewAuthService(redisClient, userRepo, cfg.JWT.Secret)
	authHandlers := handlers.NewAuthHandlers(authService)

	// 初始化上传服务
	uploadService := services.NewUploadService()
	uploadHandlers := handlers.NewUploadHandlers(uploadService)

	server := &Server{
		config:         cfg,
		db:             db,
		redisClient:    redisClient,
		cacheService:   cacheService,
		logger:         logger,
		router:         router,
		userHandlers:   userHandlers,
		authHandlers:   authHandlers,
		uploadHandlers: uploadHandlers,
		walletHandlers: walletHandlers,
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

func (s *Server) Start() error {
	s.logger.Infof("Server starting on %s:%s", s.config.Server.Host, s.config.Server.Port)
	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	s.logger.Info("Server shutting down...")

	// 关闭 Redis 连接
	if s.redisClient != nil {
		if err := s.redisClient.Close(); err != nil {
			s.logger.Errorf("Failed to close Redis connection: %v", err)
		} else {
			s.logger.Info("Redis connection closed successfully")
		}
	}

	return s.server.Shutdown(ctx)
}

func (s *Server) GetRouter() *gin.Engine {
	return s.router
}

func (s *Server) GetCacheService() cache.CacheService {
	return s.cacheService
}

func (s *Server) GetRedisClient() *redis.RedisClient {
	return s.redisClient
}
