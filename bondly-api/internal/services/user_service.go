package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"errors"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// GetUserByAddress 根据地址获取用户信息
func (s *UserService) GetUserByAddress(address string) (*models.User, error) {
	if address == "" {
		return nil, errors.New("address cannot be empty")
	}

	return s.userRepo.GetByAddress(address)
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

	return s.userRepo.Create(user)
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *models.User) error {
	if user.ID == 0 {
		return errors.New("user ID cannot be empty")
	}

	return s.userRepo.Update(user)
}

// GetUserReputation 获取用户声誉
func (s *UserService) GetUserReputation(address string) (int64, error) {
	user, err := s.GetUserByAddress(address)
	if err != nil {
		return 0, err
	}

	return user.Reputation, nil
}
