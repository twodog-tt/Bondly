package server

import (
	"bondly-api/config"
	"bondly-api/internal/cache"
	"bondly-api/internal/email"
	"bondly-api/internal/handlers"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/middleware"
	"bondly-api/internal/redis"
	"bondly-api/internal/repositories"
	"bondly-api/internal/services"
	"bondly-api/internal/utils"
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
	router       *gin.Engine
	server       *http.Server

	// 依赖注入
	userHandlers               *handlers.UserHandlers
	authHandlers               *handlers.AuthHandlers
	uploadHandlers             *handlers.UploadHandlers
	walletHandlers             *handlers.WalletHandlers
	contentHandlers            *handlers.ContentHandlers
	contentInteractionHandlers *handlers.ContentInteractionHandlers
	proposalHandlers           *handlers.ProposalHandlers
	transactionHandlers        *handlers.TransactionHandlers
	commentHandlers            *handlers.CommentHandlers
	userFollowHandlers         *handlers.UserFollowHandlers
	walletBindingHandlers      *handlers.WalletBindingHandlers
}

func NewServer(cfg *config.Config, db *gorm.DB) *Server {
	// 设置 Gin 模式
	if cfg.Logging.Level == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// 使用中间件
	router.Use(gin.Recovery())
	router.Use(middleware.TraceIDMiddleware()) // 添加TraceID中间件
	router.Use(middleware.Logger(loggerpkg.Log))
	router.Use(middleware.CORS(cfg.CORS))

	// 初始化 Redis 客户端
	redisClient, err := redis.NewRedisClient(cfg.Redis)
	if err != nil {
		loggerpkg.Log.Fatalf("Failed to connect to Redis: %v", err)
	}
	loggerpkg.Log.Info("Redis connected successfully")

	// 初始化缓存服务
	cacheService := cache.NewRedisCacheService(redisClient)

	// 初始化邮件服务
	emailConfig := email.EmailConfig{
		Provider:  cfg.Email.Provider,
		ResendKey: cfg.Email.ResendKey,
		FromEmail: cfg.Email.FromEmail,
	}
	emailSender, err := email.NewEmailSender(emailConfig)
	if err != nil {
		loggerpkg.Log.Warnf("Failed to initialize email sender: %v, using mock sender", err)
		emailSender = email.NewMockEmailSender()
	}
	emailService := services.NewEmailService(emailSender)
	loggerpkg.Log.Info("Email service initialized successfully")

	// 初始化依赖
	userRepo := repositories.NewUserRepository(db)
	walletService := services.NewWalletService(cfg)
	userService := services.NewUserService(userRepo, cacheService, walletService)
	userHandlers := handlers.NewUserHandlers(userService)
	walletHandlers := handlers.NewWalletHandlers(walletService, userService)

	// 初始化JWT工具
	utils.InitJWTUtil(cfg.JWT.Secret, cfg.JWT.ExpiresIn)

	// 初始化认证服务
	authService := services.NewAuthService(redisClient, userRepo, cfg.JWT.Secret, emailService)
	authHandlers := handlers.NewAuthHandlers(authService)

	// 初始化上传服务
	uploadService := services.NewUploadService()
	uploadHandlers := handlers.NewUploadHandlers(uploadService)

	// 初始化新的repositories
	contentRepo := repositories.NewContentRepository(db)
	proposalRepo := repositories.NewProposalRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)
	commentRepo := repositories.NewCommentRepository(db)
	userFollowRepo := repositories.NewUserFollowRepository(db)
	walletBindingRepo := repositories.NewWalletBindingRepository(db)

	// 初始化新的services
	contentService := services.NewContentService(contentRepo)
	contentInteractionService := services.NewContentInteractionService(db)
	proposalService := services.NewProposalService(proposalRepo)
	transactionService := services.NewTransactionService(transactionRepo)
	commentService := services.NewCommentService(commentRepo)
	userFollowService := services.NewUserFollowService(userFollowRepo)
	walletBindingService := services.NewWalletBindingService(walletBindingRepo)

	// 初始化新的handlers
	contentHandlers := handlers.NewContentHandlers(contentService)
	contentInteractionHandlers := handlers.NewContentInteractionHandlers(contentInteractionService)
	proposalHandlers := handlers.NewProposalHandlers(proposalService)
	transactionHandlers := handlers.NewTransactionHandlers(transactionService)
	commentHandlers := handlers.NewCommentHandlers(commentService)
	userFollowHandlers := handlers.NewUserFollowHandlers(userFollowService)
	walletBindingHandlers := handlers.NewWalletBindingHandlers(walletBindingService)

	server := &Server{
		config:                     cfg,
		db:                         db,
		redisClient:                redisClient,
		cacheService:               cacheService,
		router:                     router,
		userHandlers:               userHandlers,
		authHandlers:               authHandlers,
		uploadHandlers:             uploadHandlers,
		walletHandlers:             walletHandlers,
		contentHandlers:            contentHandlers,
		contentInteractionHandlers: contentInteractionHandlers,
		proposalHandlers:           proposalHandlers,
		transactionHandlers:        transactionHandlers,
		commentHandlers:            commentHandlers,
		userFollowHandlers:         userFollowHandlers,
		walletBindingHandlers:      walletBindingHandlers,
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
	loggerpkg.Log.Infof("Server starting on %s:%s", s.config.Server.Host, s.config.Server.Port)
	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	loggerpkg.Log.Info("Server shutting down...")

	// 关闭 Redis 连接
	if s.redisClient != nil {
		if err := s.redisClient.Close(); err != nil {
			loggerpkg.Log.Errorf("Failed to close Redis connection: %v", err)
		} else {
			loggerpkg.Log.Info("Redis connection closed successfully")
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
