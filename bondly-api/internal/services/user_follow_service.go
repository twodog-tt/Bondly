package services

import (
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"context"
	"errors"
)

type UserFollowService struct {
	userFollowRepo *repositories.UserFollowRepository
}

func NewUserFollowService(userFollowRepo *repositories.UserFollowRepository) *UserFollowService {
	return &UserFollowService{
		userFollowRepo: userFollowRepo,
	}
}

// FollowUser 关注用户
func (s *UserFollowService) FollowUser(ctx context.Context, followerID, followedID int64) error {
	// 不能关注自己
	if followerID == followedID {
		return errors.New("cannot follow yourself")
	}

	// 检查是否已经关注
	exists, err := s.userFollowRepo.ExistsFollow(followerID, followedID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("already following this user")
	}

	follow := &models.UserFollower{
		FollowerID: followerID,
		FollowedID: followedID,
	}

	return s.userFollowRepo.CreateFollow(follow)
}

// UnfollowUser 取消关注用户
func (s *UserFollowService) UnfollowUser(ctx context.Context, followerID, followedID int64) error {
	// 检查是否已经关注
	exists, err := s.userFollowRepo.ExistsFollow(followerID, followedID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("not following this user")
	}

	return s.userFollowRepo.DeleteFollow(followerID, followedID)
}

// IsFollowing 检查是否关注
func (s *UserFollowService) IsFollowing(ctx context.Context, followerID, followedID int64) (bool, error) {
	return s.userFollowRepo.ExistsFollow(followerID, followedID)
}

// GetFollowers 获取用户的粉丝列表
func (s *UserFollowService) GetFollowers(ctx context.Context, userID int64, page, limit int) ([]models.UserFollower, int64, error) {
	offset := (page - 1) * limit

	followers, err := s.userFollowRepo.GetFollowers(userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userFollowRepo.CountFollowers(userID)
	if err != nil {
		return nil, 0, err
	}

	return followers, total, nil
}

// GetFollowing 获取用户关注的人列表
func (s *UserFollowService) GetFollowing(ctx context.Context, userID int64, page, limit int) ([]models.UserFollower, int64, error) {
	offset := (page - 1) * limit

	following, err := s.userFollowRepo.GetFollowing(userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userFollowRepo.CountFollowing(userID)
	if err != nil {
		return nil, 0, err
	}

	return following, total, nil
}
