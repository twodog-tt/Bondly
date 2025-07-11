package services

import (
	"bondly-api/internal/cache"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/errors"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/repositories"
	"context"
	stderrors "errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type UserService struct {
	userRepo      *repositories.UserRepository
	cacheService  cache.CacheService
	walletService *WalletService
}

func NewUserService(userRepo *repositories.UserRepository, cacheService cache.CacheService, walletService *WalletService) *UserService {
	return &UserService{
		userRepo:      userRepo,
		cacheService:  cacheService,
		walletService: walletService,
	}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("创建用户开始", map[string]interface{}{
		"email":          user.Email,
		"wallet_address": user.WalletAddress,
		"nickname":       user.Nickname,
	})

	// 检查邮箱是否已存在
	if user.Email != nil {
		exists, err := s.userRepo.ExistsByEmail(*user.Email)
		if err != nil {
			bizLog.DatabaseError("select", "users", "SELECT EXISTS", err)
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgEmailCheckFailed, err))
		}
		if exists {
			bizLog.ValidationFailed("email", "邮箱已存在", *user.Email)
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 检查钱包地址是否已存在
	if user.WalletAddress != nil {
		exists, err := s.userRepo.ExistsByWalletAddress(*user.WalletAddress)
		if err != nil {
			bizLog.DatabaseError("select", "users", "SELECT EXISTS", err)
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgWalletCheckFailed, err))
		}
		if exists {
			bizLog.ValidationFailed("wallet_address", "钱包地址已存在", *user.WalletAddress)
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
		bizLog.DatabaseError("insert", "users", "INSERT", err)
		return errors.NewUserCreateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(ctx, user.ID)

	bizLog.UserCreated(user.ID, *user.Email, *user.WalletAddress)
	return nil
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(ctx context.Context, id int64) (*models.User, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("根据ID查询用户开始", map[string]interface{}{
		"user_id": id,
	})

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:%d", id)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		bizLog.CacheHit(cacheKey, "user")
		return &user, nil
	}

	bizLog.CacheMiss(cacheKey, "user")

	// 从数据库获取
	dbUser, err := s.userRepo.GetByID(id)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			bizLog.UserNotFound("user_id", id)
			return nil, errors.NewUserNotFoundError()
		}
		bizLog.DatabaseError("select", "users", "SELECT BY ID", err)
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)
	bizLog.CacheSet(cacheKey, "user", "30m")

	return dbUser, nil
}

// GetUserByWalletAddress 根据钱包地址获取用户
func (s *UserService) GetUserByWalletAddress(ctx context.Context, walletAddress string) (*models.User, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("根据钱包地址查询用户开始", map[string]interface{}{
		"wallet_address": walletAddress,
	})

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:wallet:%s", walletAddress)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		bizLog.CacheHit(cacheKey, "user")
		return &user, nil
	}

	bizLog.CacheMiss(cacheKey, "user")

	// 从数据库获取
	dbUser, err := s.userRepo.GetByWalletAddress(walletAddress)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			bizLog.UserNotFound("wallet_address", walletAddress)
			return nil, errors.NewUserNotFoundError()
		}
		bizLog.DatabaseError("select", "users", "SELECT BY WALLET", err)
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)
	bizLog.CacheSet(cacheKey, "user", "30m")

	return dbUser, nil
}

// GetUserByEmail 根据邮箱获取用户
func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("根据邮箱查询用户开始", map[string]interface{}{
		"email": email,
	})

	// 尝试从缓存获取
	cacheKey := fmt.Sprintf("user:email:%s", email)
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		bizLog.CacheHit(cacheKey, "user")
		return &user, nil
	}

	bizLog.CacheMiss(cacheKey, "user")

	// 从数据库获取
	dbUser, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			bizLog.UserNotFound("email", email)
			return nil, errors.NewUserNotFoundError()
		}
		bizLog.DatabaseError("select", "users", "SELECT BY EMAIL", err)
		return nil, errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 缓存用户信息
	s.cacheService.Set(ctx, cacheKey, dbUser, 30*time.Minute)
	bizLog.CacheSet(cacheKey, "user", "30m")

	return dbUser, nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(ctx context.Context, user *models.User) error {
	bizLog := loggerpkg.NewBusinessLogger(ctx)

	bizLog.BusinessLogic("更新用户开始", map[string]interface{}{
		"user_id": user.ID,
	})

	// 检查用户是否存在
	existingUser, err := s.userRepo.GetByID(user.ID)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			bizLog.UserNotFound("user_id", user.ID)
			return errors.NewUserNotFoundError()
		}
		bizLog.DatabaseError("select", "users", "SELECT BY ID", err)
		return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 检查邮箱唯一性
	if user.Email != nil && existingUser.Email != nil && *user.Email != *existingUser.Email {
		exists, err := s.userRepo.ExistsByEmail(*user.Email)
		if err != nil {
			bizLog.DatabaseError("select", "users", "SELECT EXISTS", err)
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgEmailCheckFailed, err))
		}
		if exists {
			bizLog.ValidationFailed("email", "邮箱已存在", *user.Email)
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 检查钱包地址唯一性
	if user.WalletAddress != nil && existingUser.WalletAddress != nil && *user.WalletAddress != *existingUser.WalletAddress {
		exists, err := s.userRepo.ExistsByWalletAddress(*user.WalletAddress)
		if err != nil {
			bizLog.DatabaseError("select", "users", "SELECT EXISTS", err)
			return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgWalletCheckFailed, err))
		}
		if exists {
			bizLog.ValidationFailed("wallet_address", "钱包地址已存在", *user.WalletAddress)
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 更新用户
	if err := s.userRepo.Update(user); err != nil {
		bizLog.DatabaseError("update", "users", "UPDATE", err)
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCacheByUser(ctx, user)

	bizLog.Success("update_user", map[string]interface{}{
		"user_id": user.ID,
	})
	return nil
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(ctx context.Context, id int64) error {
	// 检查用户是否存在
	_, err := s.userRepo.GetByID(id)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return errors.NewUserNotFoundError()
		}
		return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 删除用户 - 暂时注释掉，因为 User 模型没有 DeletedAt 字段
	// if err := s.userRepo.Update(&models.User{ID: id, DeletedAt: gorm.DeletedAt{Time: time.Now(), Valid: true}}); err != nil {
	// 	return errors.NewUserUpdateFailedError(err)
	// }

	// 清除缓存
	s.clearUserCache(ctx, id)

	return nil
}

// UpdateLastLogin 更新最后登录时间
func (s *UserService) UpdateLastLogin(ctx context.Context, id int64) error {
	if err := s.userRepo.UpdateLastLogin(id); err != nil {
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(ctx, id)

	return nil
}

// UpdateReputationScore 更新用户声誉分数
func (s *UserService) UpdateReputationScore(ctx context.Context, id int64, score int) error {
	if err := s.userRepo.UpdateReputationScore(id, score); err != nil {
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除缓存
	s.clearUserCache(ctx, id)

	return nil
}

// ListUsers 获取用户列表
func (s *UserService) ListUsers(ctx context.Context, offset, limit int) ([]models.User, error) {
	return s.userRepo.List(offset, limit)
}

// ListUsersByRole 根据角色获取用户列表
func (s *UserService) ListUsersByRole(ctx context.Context, role string, offset, limit int) ([]models.User, error) {
	return s.userRepo.ListByRole(role, offset, limit)
}

// GetTopUsersByReputation 获取声誉分数最高的用户
func (s *UserService) GetTopUsersByReputation(ctx context.Context, limit int) ([]models.User, error) {
	return s.userRepo.GetTopUsersByReputation(limit)
}

// GetUserCount 获取用户总数
func (s *UserService) GetUserCount(ctx context.Context) (int64, error) {
	return s.userRepo.Count()
}

// GetUserCountByRole 根据角色获取用户数量
func (s *UserService) GetUserCountByRole(ctx context.Context, role string) (int64, error) {
	return s.userRepo.CountByRole(role)
}

// UpdateWalletAddress 更新用户钱包地址
func (s *UserService) UpdateWalletAddress(ctx context.Context, userID int64, walletAddress string) error {
	log := loggerpkg.FromContext(ctx)

	// 先获取用户信息
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			return errors.NewUserNotFoundError()
		}
		return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgGetUserFailed, err))
	}

	// 检查钱包地址是否已被其他用户绑定
	if walletAddress != "" {
		existingUser, err := s.userRepo.GetByWalletAddress(walletAddress)
		if err == nil && existingUser.ID != userID {
			log.WithFields(logrus.Fields{
				"用户ID":    userID,
				"钱包地址":    walletAddress,
				"已绑定用户ID": existingUser.ID,
			}).Warn("钱包绑定 - 钱包地址已被其他用户绑定")
			return errors.NewUserAlreadyExistsError()
		}
	}

	// 更新钱包地址
	user.WalletAddress = &walletAddress

	// 更新用户信息
	if err := s.userRepo.Update(user); err != nil {
		log.WithFields(logrus.Fields{
			"用户ID": userID,
			"错误":   err.Error(),
		}).Error("钱包绑定 - 更新用户信息失败")
		return errors.NewUserUpdateFailedError(err)
	}

	// 清除所有相关缓存
	s.clearUserCacheByUser(ctx, user)

	log.WithFields(logrus.Fields{
		"用户ID": userID,
		"钱包地址": walletAddress,
	}).Info("钱包绑定 - 更新钱包地址成功")

	return nil
}

// clearUserCache 清除用户缓存
func (s *UserService) clearUserCache(ctx context.Context, userID int64) {
	// 清除用户ID缓存
	s.cacheService.Del(ctx, fmt.Sprintf("user:%d", userID))
}

// clearUserCacheByUser 根据用户对象清除所有相关缓存
func (s *UserService) clearUserCacheByUser(ctx context.Context, user *models.User) {
	// 清除用户ID缓存
	s.cacheService.Del(ctx, fmt.Sprintf("user:%d", user.ID))

	// 清除钱包地址缓存
	if user.WalletAddress != nil {
		s.cacheService.Del(ctx, fmt.Sprintf("user:wallet:%s", *user.WalletAddress))
	}

	// 清除邮箱缓存
	if user.Email != nil {
		s.cacheService.Del(ctx, fmt.Sprintf("user:email:%s", *user.Email))
	}
}
