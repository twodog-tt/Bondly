package handlers

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UserFollowHandlers 用户关注处理器
type UserFollowHandlers struct {
	userFollowService *services.UserFollowService
}

func NewUserFollowHandlers(userFollowService *services.UserFollowService) *UserFollowHandlers {
	return &UserFollowHandlers{
		userFollowService: userFollowService,
	}
}

// FollowUser 关注用户
// @Summary 关注用户
// @Description 关注指定用户
// @Tags 粉丝管理
// @Accept json
// @Produce json
// @Param user_id path int true "要关注的用户ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/users/{user_id}/follow [post]
// @Security BearerAuth
func (h *UserFollowHandlers) FollowUser(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/users/{user_id}/follow", nil, "", nil)

	followedID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "无效的用户ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid user ID")
		return
	}

	followerID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"follower_id": followerID,
		"followed_id": followedID,
	})

	if err := h.userFollowService.FollowUser(c.Request.Context(), followerID.(int64), followedID); err != nil {
		bizLog.ThirdPartyError("user_follow_service", "follow_user", map[string]interface{}{
			"follower_id": followerID,
			"followed_id": followedID,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("关注用户成功", map[string]interface{}{
		"follower_id": followerID,
		"followed_id": followedID,
	})
	response.OK(c, gin.H{}, "User followed successfully")
}

// UnfollowUser 取消关注用户
// @Summary 取消关注用户
// @Description 取消关注指定用户
// @Tags 粉丝管理
// @Accept json
// @Produce json
// @Param user_id path int true "要取消关注的用户ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/users/{user_id}/unfollow [delete]
// @Security BearerAuth
func (h *UserFollowHandlers) UnfollowUser(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/users/{user_id}/unfollow", nil, "", nil)

	followedID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "无效的用户ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid user ID")
		return
	}

	followerID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"follower_id": followerID,
		"followed_id": followedID,
	})

	if err := h.userFollowService.UnfollowUser(c.Request.Context(), followerID.(int64), followedID); err != nil {
		bizLog.ThirdPartyError("user_follow_service", "unfollow_user", map[string]interface{}{
			"follower_id": followerID,
			"followed_id": followedID,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("取消关注用户成功", map[string]interface{}{
		"follower_id": followerID,
		"followed_id": followedID,
	})
	response.OK(c, gin.H{}, "User unfollowed successfully")
}

// GetFollowers 获取用户的粉丝列表
// @Summary 获取用户的粉丝列表
// @Description 分页获取指定用户的粉丝列表
// @Tags 粉丝管理
// @Accept json
// @Produce json
// @Param user_id path int true "用户ID"
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseUserFollow
// @Failure 400 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/users/{user_id}/followers [get]
func (h *UserFollowHandlers) GetFollowers(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/users/{user_id}/followers", nil, "", nil)

	userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "无效的用户ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid user ID")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id": userID,
		"page":    page,
		"limit":   limit,
	})

	followers, total, err := h.userFollowService.GetFollowers(c.Request.Context(), userID, page, limit)
	if err != nil {
		bizLog.ThirdPartyError("user_follow_service", "get_followers", map[string]interface{}{
			"user_id": userID,
			"page":    page,
			"limit":   limit,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取粉丝列表成功", map[string]interface{}{
		"user_id": userID,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
	result := gin.H{
		"followers": followers,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Followers list retrieved successfully")
}

// GetFollowing 获取用户关注的人列表
// @Summary 获取用户关注的人列表
// @Description 分页获取指定用户关注的人列表
// @Tags 粉丝管理
// @Accept json
// @Produce json
// @Param user_id path int true "用户ID"
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseUserFollow
// @Failure 400 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/users/{user_id}/following [get]
func (h *UserFollowHandlers) GetFollowing(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/users/{user_id}/following", nil, "", nil)

	userID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "无效的用户ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid user ID")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id": userID,
		"page":    page,
		"limit":   limit,
	})

	following, total, err := h.userFollowService.GetFollowing(c.Request.Context(), userID, page, limit)
	if err != nil {
		bizLog.ThirdPartyError("user_follow_service", "get_following", map[string]interface{}{
			"user_id": userID,
			"page":    page,
			"limit":   limit,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取关注列表成功", map[string]interface{}{
		"user_id": userID,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
	result := gin.H{
		"following": following,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Following list retrieved successfully")
}
