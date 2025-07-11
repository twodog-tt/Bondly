package repositories

import (
	"bondly-api/internal/models"

	"gorm.io/gorm"
)

type UserFollowRepository struct {
	db *gorm.DB
}

func NewUserFollowRepository(db *gorm.DB) *UserFollowRepository {
	return &UserFollowRepository{
		db: db,
	}
}

// CreateFollow 创建关注关系
func (r *UserFollowRepository) CreateFollow(follow *models.UserFollower) error {
	return r.db.Create(follow).Error
}

// DeleteFollow 删除关注关系
func (r *UserFollowRepository) DeleteFollow(followerID, followedID int64) error {
	return r.db.Where("follower_id = ? AND followed_id = ?", followerID, followedID).Delete(&models.UserFollower{}).Error
}

// GetFollow 获取关注关系
func (r *UserFollowRepository) GetFollow(followerID, followedID int64) (*models.UserFollower, error) {
	var follow models.UserFollower
	err := r.db.Where("follower_id = ? AND followed_id = ?", followerID, followedID).First(&follow).Error
	if err != nil {
		return nil, err
	}
	return &follow, nil
}

// ExistsFollow 检查关注关系是否存在
func (r *UserFollowRepository) ExistsFollow(followerID, followedID int64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserFollower{}).Where("follower_id = ? AND followed_id = ?", followerID, followedID).Count(&count).Error
	return count > 0, err
}

// GetFollowers 获取用户的粉丝列表
func (r *UserFollowRepository) GetFollowers(userID int64, offset, limit int) ([]models.UserFollower, error) {
	var follows []models.UserFollower
	err := r.db.Preload("Follower").Where("followed_id = ?", userID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&follows).Error
	return follows, err
}

// CountFollowers 获取用户的粉丝数量
func (r *UserFollowRepository) CountFollowers(userID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserFollower{}).Where("followed_id = ?", userID).Count(&count).Error
	return count, err
}

// GetFollowing 获取用户关注的人列表
func (r *UserFollowRepository) GetFollowing(userID int64, offset, limit int) ([]models.UserFollower, error) {
	var follows []models.UserFollower
	err := r.db.Preload("Followed").Where("follower_id = ?", userID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&follows).Error
	return follows, err
}

// CountFollowing 获取用户关注的人数量
func (r *UserFollowRepository) CountFollowing(userID int64) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserFollower{}).Where("follower_id = ?", userID).Count(&count).Error
	return count, err
}
