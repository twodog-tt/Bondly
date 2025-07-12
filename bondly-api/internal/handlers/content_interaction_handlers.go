package handlers

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ContentInteractionHandlers struct {
	contentInteractionService *services.ContentInteractionService
}

func NewContentInteractionHandlers(contentInteractionService *services.ContentInteractionService) *ContentInteractionHandlers {
	return &ContentInteractionHandlers{
		contentInteractionService: contentInteractionService,
	}
}

// CreateInteraction 创建内容互动
// @Summary 创建内容互动
// @Description 创建用户对内容的互动（点赞、点踩、收藏、分享）
// @Tags 内容互动
// @Accept json
// @Produce json
// @Param interaction body dto.CreateInteractionRequest true "互动信息"
// @Success 200 {object} response.ResponseAny{data=dto.ContentInteraction}
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content-interactions [post]
// @Security BearerAuth
func (h *ContentInteractionHandlers) CreateInteraction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/content-interactions", nil, "", nil)

	var req dto.CreateInteractionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "用户未登录")
		return
	}

	req.UserID = userID.(int64)

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id":       req.ContentID,
		"interaction_type": req.InteractionType,
		"user_id":          req.UserID,
	})

	interaction, err := h.contentInteractionService.CreateInteraction(req)
	if err != nil {
		bizLog.ThirdPartyError("content_interaction_service", "create_interaction", map[string]interface{}{
			"content_id":       req.ContentID,
			"interaction_type": req.InteractionType,
			"user_id":          req.UserID,
		}, err)
		response.Fail(c, response.CodeInternalError, "创建互动失败: "+err.Error())
		return
	}

	bizLog.ContentInteractionCreated(req.ContentID, req.UserID, req.InteractionType)
	response.OK(c, interaction, "创建互动成功")
}

// DeleteInteraction 删除内容互动
// @Summary 删除内容互动
// @Description 删除用户对内容的互动
// @Tags 内容互动
// @Accept json
// @Produce json
// @Param content_id path int true "内容ID"
// @Param interaction_type path string true "互动类型"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content-interactions/{content_id}/{interaction_type} [delete]
// @Security BearerAuth
func (h *ContentInteractionHandlers) DeleteInteraction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/content-interactions/{content_id}/{interaction_type}", nil, "", nil)

	contentIDStr := c.Param("content_id")
	interactionType := c.Param("interaction_type")

	contentID, err := strconv.Atoi(contentIDStr)
	if err != nil {
		bizLog.ValidationFailed("content_id", "内容ID格式错误", contentIDStr)
		response.Fail(c, response.CodeInvalidParams, "内容ID格式错误")
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "用户未登录")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id":       contentID,
		"interaction_type": interactionType,
		"user_id":          userID,
	})

	err = h.contentInteractionService.DeleteInteraction(int64(contentID), userID.(int64), interactionType)
	if err != nil {
		bizLog.ThirdPartyError("content_interaction_service", "delete_interaction", map[string]interface{}{
			"content_id":       contentID,
			"interaction_type": interactionType,
			"user_id":          userID,
		}, err)
		response.Fail(c, response.CodeInternalError, "删除互动失败: "+err.Error())
		return
	}

	bizLog.ContentInteractionDeleted(int64(contentID), userID.(int64), interactionType)
	response.OK(c, gin.H{}, "删除互动成功")
}

// GetInteractionStats 获取内容互动统计
// @Summary 获取内容互动统计
// @Description 获取指定内容的互动统计数据
// @Tags 内容互动
// @Accept json
// @Produce json
// @Param content_id path int true "内容ID"
// @Success 200 {object} response.ResponseAny{data=dto.InteractionStats}
// @Failure 400 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content-interactions/{content_id}/stats [get]
func (h *ContentInteractionHandlers) GetInteractionStats(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/content-interactions/{content_id}/stats", nil, "", nil)

	contentIDStr := c.Param("content_id")

	contentID, err := strconv.Atoi(contentIDStr)
	if err != nil {
		bizLog.ValidationFailed("content_id", "内容ID格式错误", contentIDStr)
		response.Fail(c, response.CodeInvalidParams, "内容ID格式错误")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id": contentID,
	})

	stats, err := h.contentInteractionService.GetInteractionStats(int64(contentID))
	if err != nil {
		bizLog.ThirdPartyError("content_interaction_service", "get_interaction_stats", map[string]interface{}{
			"content_id": contentID,
		}, err)
		response.Fail(c, response.CodeInternalError, "获取互动统计失败: "+err.Error())
		return
	}

	bizLog.ContentInteractionStatsRetrieved(int64(contentID), map[string]interface{}{
		"likes":     stats.Likes,
		"dislikes":  stats.Dislikes,
		"bookmarks": stats.Bookmarks,
		"shares":    stats.Shares,
	})
	response.OK(c, stats, "获取互动统计成功")
}

// GetUserInteractionStatus 获取用户互动状态
// @Summary 获取用户互动状态
// @Description 获取当前用户对指定内容的互动状态
// @Tags 内容互动
// @Accept json
// @Produce json
// @Param content_id path int true "内容ID"
// @Success 200 {object} response.ResponseAny{data=dto.UserInteractionStatus}
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content-interactions/{content_id}/user-status [get]
// @Security BearerAuth
func (h *ContentInteractionHandlers) GetUserInteractionStatus(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/content-interactions/{content_id}/user-status", nil, "", nil)

	contentIDStr := c.Param("content_id")

	contentID, err := strconv.Atoi(contentIDStr)
	if err != nil {
		bizLog.ValidationFailed("content_id", "内容ID格式错误", contentIDStr)
		response.Fail(c, response.CodeInvalidParams, "内容ID格式错误")
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "用户未登录")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id": contentID,
		"user_id":    userID,
	})

	status, err := h.contentInteractionService.GetUserInteractionStatus(int64(contentID), userID.(int64))
	if err != nil {
		bizLog.ThirdPartyError("content_interaction_service", "get_user_interaction_status", map[string]interface{}{
			"content_id": contentID,
			"user_id":    userID,
		}, err)
		response.Fail(c, response.CodeInternalError, "获取用户互动状态失败: "+err.Error())
		return
	}

	bizLog.ContentInteractionStatusRetrieved(int64(contentID), userID.(int64), map[string]interface{}{
		"liked":      status.Liked,
		"disliked":   status.Disliked,
		"bookmarked": status.Bookmarked,
	})
	response.OK(c, status, "获取用户互动状态成功")
}
