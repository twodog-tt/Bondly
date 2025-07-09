package services

import (
	"bondly-api/internal/cache"
	"bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/errors"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/repositories"
	"context"
	stderrors "errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type UserService struct {
	userRepo     *repositories.UserRepository
	cacheService cache.CacheService
	logger       *logger.Logger
}

func NewUserService(userRepo *repositories.UserRepository, cacheService cache.CacheService) *UserService {
	return &UserService{
		userRepo:     userRepo,
		cacheService: cacheService,
		logger:       logger.NewLogger(),
	}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(user *models.User) error {
	// 检查邮箱是否已存在
	if user.Email != nil {
		exists, err := s.userRepo.ExistsByEmail(*user.Email)
		if err != nil {
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgEmailCheckFailed, err))
		}
		if exists {
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 检查钱包地址是否已存在
	if user.WalletAddress != nil {
		exists, err := s.userRepo.ExistsByWalletAddress(*user.WalletAddress)
		if err != nil {
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgWalletCheckFailed, err))
		}
		if exists {
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 设置默认值
	if user.Nickname == "" {
		user.Nickname = "Anonymous"
	}
	if user.Role == "" {
		user.Role = "user"
	}
	if user.ReputationScore == 0 {
		user.ReputationScore = 0
	}

	// 创建用户
	if err := s.userRepo.Create(user); err != nil {
		return errors.NewUserCreateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(user.ID)

	return nil
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(id int64) (*models.User, error) {
	ctx := context.Background()

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:%d", id)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		return &user, nil
	}

	// 从数据库获取
	dbUser, err := s.userRepo.GetByID(id)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewUserNotFoundError()
		}
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)

	return dbUser, nil
}

// GetUserByWalletAddress 根据钱包地址获取用户
func (s *UserService) GetUserByWalletAddress(walletAddress string) (*models.User, error) {
	ctx := context.Background()

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:wallet:%s", walletAddress)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		return &user, nil
	}

	// 从数据库获取
	dbUser, err := s.userRepo.GetByWalletAddress(walletAddress)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewUserNotFoundError()
		}
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)

	return dbUser, nil
}

// GetUserByEmail 根据邮箱获取用户
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	ctx := context.Background()

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:email:%s", email)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		return &user, nil
	}

	// 从数据库获取
	dbUser, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.NewUserNotFoundError()
		}
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)

	return dbUser, nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *models.User) error {
	// 检查用户是否存在
	existingUser, err := s.userRepo.GetByID(user.ID)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return errors.NewUserNotFoundError()
		}
		return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 检查邮箱唯一性
	if user.Email != nil && *user.Email != *existingUser.Email {
		exists, err := s.userRepo.ExistsByEmail(*user.Email)
		if err != nil {
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgEmailCheckFailed, err))
		}
		if exists {
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 检查钱包地址唯一性
	if user.WalletAddress != nil && *user.WalletAddress != *existingUser.WalletAddress {
		exists, err := s.userRepo.ExistsByWalletAddress(*user.WalletAddress)
		if err != nil {
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgWalletCheckFailed, err))
		}
		if exists {
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 更新用户
	if err := s.userRepo.Update(user); err != nil {
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(user.ID)

	return nil
}

// UpdateLastLogin 更新最后登录时间
func (s *UserService) UpdateLastLogin(id int64) error {
	if err := s.userRepo.UpdateLastLogin(id); err != nil {
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(id)

	return nil
}

// UpdateReputationScore 更新声誉积分
func (s *UserService) UpdateReputationScore(id int64, score int) error {
	if err := s.userRepo.UpdateReputationScore(id, score); err != nil {
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(id)

	return nil
}

// ListUsers 获取用户列表
func (s *UserService) ListUsers(offset, limit int) ([]models.User, error) {
	return s.userRepo.List(offset, limit)
}

// ListUsersByRole 根据角色获取用户列表
func (s *UserService) ListUsersByRole(role string, offset, limit int) ([]models.User, error) {
	return s.userRepo.ListByRole(role, offset, limit)
}

// GetTopUsersByReputation 获取声誉积分最高的用户
func (s *UserService) GetTopUsersByReputation(limit int) ([]models.User, error) {
	return s.userRepo.GetTopUsersByReputation(limit)
}

// GetUserCount 获取用户总数
func (s *UserService) GetUserCount() (int64, error) {
	return s.userRepo.Count()
}

// GetUserCountByRole 根据角色获取用户数量
func (s *UserService) GetUserCountByRole(role string) (int64, error) {
	return s.userRepo.CountByRole(role)
}

// clearUserCache 清除用户相关缓存
func (s *UserService) clearUserCache(userID int64) {
	ctx := context.Background()

	// 清除用户ID缓存
	s.cacheService.Del(ctx, fmt.Sprintf("user:%d", userID))

	// 清除用户列表缓存
	s.cacheService.Del(ctx, "users:list", "users:top")
}
