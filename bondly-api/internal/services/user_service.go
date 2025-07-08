package services

import (
	"bondly-api/internal/cache"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"
	"fmt"
	"time"
)

type UserService struct {
	userRepo     *repositories.UserRepository
	cacheService cache.CacheService
	keyBuilder   *cache.CacheKeyBuilder
	cacheConfig  cache.CacheConfig
}

func NewUserService(userRepo *repositories.UserRepository, cacheService cache.CacheService) *UserService {
	return &UserService{
		userRepo:     userRepo,
		cacheService: cacheService,
		keyBuilder:   cache.NewCacheKeyBuilder("bondly"),
		cacheConfig:  cache.DefaultCacheConfig(),
	}
}

// GetUserByAddress 根据地址获取用户信息（带缓存）
func (s *UserService) GetUserByAddress(address string) (*models.User, error) {
	if address == "" {
		return nil, errors.New("address cannot be empty")
	}

	ctx := context.Background()
	cacheKey := s.keyBuilder.UserKey(address)

	// 尝试从缓存获取
	var user models.User
	if err := s.cacheService.Get(ctx, cacheKey, &user); err == nil {
		return &user, nil
	}

	// 缓存未命中，从数据库获取
	dbUser, err := s.userRepo.GetByAddress(address)
	if err != nil {
		return nil, err
	}

	// 存储到缓存
	if err := s.cacheService.Set(ctx, cacheKey, dbUser, s.cacheConfig.UserCacheTTL); err != nil {
		// 缓存失败不影响主要功能，只记录日志
		fmt.Printf("Failed to cache user %s: %v\n", address, err)
	}

	return dbUser, nil
}

// CreateUser 创建新用户
func (s *UserService) CreateUser(user *models.User) error {
	if user.Address == "" {
		return errors.New("user address cannot be empty")
	}

	// 检查用户是否已存在
	existingUser, _ := s.userRepo.GetByAddress(user.Address)
	if existingUser != nil {
		return errors.New("user already exists")
	}

	// 创建用户
	if err := s.userRepo.Create(user); err != nil {
		return err
	}

	// 存储到缓存
	ctx := context.Background()
	cacheKey := s.keyBuilder.UserKey(user.Address)
	if err := s.cacheService.Set(ctx, cacheKey, user, s.cacheConfig.UserCacheTTL); err != nil {
		fmt.Printf("Failed to cache new user %s: %v\n", user.Address, err)
	}

	return nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *models.User) error {
	if user.ID == 0 {
		return errors.New("user ID cannot be empty")
	}

	// 更新数据库
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// 清除缓存
	ctx := context.Background()
	cacheKey := s.keyBuilder.UserKey(user.Address)
	if err := s.cacheService.Del(ctx, cacheKey); err != nil {
		fmt.Printf("Failed to delete user cache %s: %v\n", user.Address, err)
	}

	// 重新缓存更新后的数据
	if err := s.cacheService.Set(ctx, cacheKey, user, s.cacheConfig.UserCacheTTL); err != nil {
		fmt.Printf("Failed to recache updated user %s: %v\n", user.Address, err)
	}

	return nil
}

// GetUserReputation 获取用户声誉（带缓存）
func (s *UserService) GetUserReputation(address string) (int64, error) {
	ctx := context.Background()
	cacheKey := s.keyBuilder.UserReputationKey(address)

	// 尝试从缓存获取声誉
	var reputation int64
	if err := s.cacheService.Get(ctx, cacheKey, &reputation); err == nil {
		return reputation, nil
	}

	// 缓存未命中，从数据库获取
	user, err := s.userRepo.GetByAddress(address)
	if err != nil {
		return 0, err
	}

	// 缓存声誉值
	if err := s.cacheService.Set(ctx, cacheKey, user.Reputation, s.cacheConfig.UserCacheTTL); err != nil {
		fmt.Printf("Failed to cache user reputation %s: %v\n", address, err)
	}

	return user.Reputation, nil
}

// UpdateUserReputation 更新用户声誉
func (s *UserService) UpdateUserReputation(address string, reputation int64) error {
	if address == "" {
		return errors.New("address cannot be empty")
	}

	// 获取用户
	user, err := s.userRepo.GetByAddress(address)
	if err != nil {
		return err
	}

	// 更新声誉
	user.Reputation = reputation
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// 更新缓存
	ctx := context.Background()
	userCacheKey := s.keyBuilder.UserKey(address)
	reputationCacheKey := s.keyBuilder.UserReputationKey(address)

	// 删除旧缓存
	if err := s.cacheService.Del(ctx, userCacheKey, reputationCacheKey); err != nil {
		fmt.Printf("Failed to delete user caches %s: %v\n", address, err)
	}

	// 设置新缓存
	if err := s.cacheService.Set(ctx, userCacheKey, user, s.cacheConfig.UserCacheTTL); err != nil {
		fmt.Printf("Failed to cache updated user %s: %v\n", address, err)
	}

	if err := s.cacheService.Set(ctx, reputationCacheKey, reputation, s.cacheConfig.UserCacheTTL); err != nil {
		fmt.Printf("Failed to cache updated reputation %s: %v\n", address, err)
	}

	return nil
}

// GetUserBalance 获取用户余额（带缓存）
func (s *UserService) GetUserBalance(address string) (string, error) {
	if address == "" {
		return "", errors.New("address cannot be empty")
	}

	ctx := context.Background()
	cacheKey := s.keyBuilder.UserBalanceKey(address)

	// 尝试从缓存获取余额
	var balance string
	if err := s.cacheService.Get(ctx, cacheKey, &balance); err == nil {
		return balance, nil
	}

	// 这里应该调用区块链服务获取真实余额
	// 暂时返回模拟数据
	balance = "0"

	// 缓存余额（较短的TTL，因为余额变化频繁）
	if err := s.cacheService.Set(ctx, cacheKey, balance, 5*time.Minute); err != nil {
		fmt.Printf("Failed to cache user balance %s: %v\n", address, err)
	}

	return balance, nil
}

// ClearUserCache 清除用户相关缓存
func (s *UserService) ClearUserCache(address string) error {
	if address == "" {
		return errors.New("address cannot be empty")
	}

	ctx := context.Background()
	userKey := s.keyBuilder.UserKey(address)
	reputationKey := s.keyBuilder.UserReputationKey(address)
	balanceKey := s.keyBuilder.UserBalanceKey(address)

	return s.cacheService.Del(ctx, userKey, reputationKey, balanceKey)
}
