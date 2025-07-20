package handlers

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CommentHandlers struct {
	service *services.CommentService
}

func NewCommentHandlers(service *services.CommentService) *CommentHandlers {
	return &CommentHandlers{service: service}
}

// ListComments 获取评论列表
// @Summary 获取评论列表
// @Description 获取指定内容下的评论列表，支持分页和父评论过滤
// @Tags 评论
// @Accept json
// @Produce json
// @Param post_id query int true "内容ID"
// @Param parent_comment_id query int false "父评论ID"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Success 200 {object} response.ResponseAny{data=dto.CommentListResponse}
// @Router /api/v1/comments [get]
func (h *CommentHandlers) ListComments(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/comments", nil, "", nil)

	// 支持post_id或content_id参数
	postIDStr := c.Query("post_id")
	contentIDStr := c.Query("content_id")

	var postID, contentID int64
	var err error

	if postIDStr != "" {
		postID, err = strconv.ParseInt(postIDStr, 10, 64)
		if err != nil {
			response.Fail(c, 400, "post_id参数格式错误")
			return
		}
	} else if contentIDStr != "" {
		contentID, err = strconv.ParseInt(contentIDStr, 10, 64)
		if err != nil {
			response.Fail(c, 400, "content_id参数格式错误")
			return
		}
	} else {
		response.Fail(c, 400, "post_id或content_id参数必填")
		return
	}

	parentCommentIDStr := c.Query("parent_comment_id")
	var parentCommentID *int64
	if parentCommentIDStr != "" {
		id, err := strconv.ParseInt(parentCommentIDStr, 10, 64)
		if err != nil {
			response.Fail(c, 400, "parent_comment_id参数格式错误")
			return
		}
		parentCommentID = &id
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	comments, total, err := h.service.ListComments(postID, contentID, parentCommentID, page, limit)
	if err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "获取评论列表失败")
		return
	}

	var commentResponses []dto.CommentResponse
	for _, comment := range comments {
		commentResponses = append(commentResponses, toCommentResponse(&comment))
	}

	resp := dto.CommentListResponse{
		Comments:   commentResponses, // 确保返回空数组而不是null
		Pagination: dto.PaginationData{Total: total, Page: page, Limit: limit, TotalPages: int((total + int64(limit) - 1) / int64(limit))},
	}
	response.OK(c, resp, "获取评论列表成功")
}

// GetComment 获取评论详情
// @Summary 获取评论详情
// @Description 获取单条评论详情
// @Tags 评论
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseAny{data=dto.CommentResponse}
// @Router /api/v1/comments/{id} [get]
func (h *CommentHandlers) GetComment(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/comments/{id}", nil, "", nil)
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, 400, "评论ID格式错误")
		return
	}
	comment, err := h.service.GetComment(id)
	if err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 404, "评论不存在")
		return
	}
	response.OK(c, toCommentResponse(comment), "获取评论详情成功")
}

// CreateComment 创建评论
// @Summary 创建评论
// @Description 用户创建评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param request body dto.CreateCommentRequest true "评论内容"
// @Success 200 {object} response.ResponseAny{data=dto.CommentResponse}
// @Failure 400 {object} response.ResponseAny
// @Router /api/v1/comments [post]
// @Security BearerAuth
func (h *CommentHandlers) CreateComment(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/comments", nil, "", nil)
	var req dto.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, "参数格式错误")
		return
	}
	// 假设已通过中间件获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, 401, "未认证")
		return
	}
	comment, err := h.service.CreateComment(&req, userID.(int64))
	if err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "创建评论失败")
		return
	}
	response.OK(c, toCommentResponse(comment), "创建评论成功")
}

// DeleteComment 删除评论
// @Summary 删除评论
// @Description 用户删除自己的评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Router /api/v1/comments/{id} [delete]
// @Security BearerAuth
func (h *CommentHandlers) DeleteComment(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/comments/{id}", nil, "", nil)
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, 400, "评论ID格式错误")
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, 401, "未认证")
		return
	}
	if err := h.service.DeleteComment(id, userID.(int64)); err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "删除评论失败")
		return
	}
	response.OKMsg(c, "删除评论成功")
}

// LikeComment 点赞评论
// @Summary 点赞评论
// @Description 用户点赞评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Router /api/v1/comments/{id}/like [post]
// @Security BearerAuth
func (h *CommentHandlers) LikeComment(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/comments/{id}/like", nil, "", nil)
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, 400, "评论ID格式错误")
		return
	}
	// 假设已通过中间件获取用户ID
	_, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, 401, "未认证")
		return
	}
	if err := h.service.LikeComment(id); err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "点赞评论失败")
		return
	}
	response.OKMsg(c, "点赞成功")
}

// UnlikeComment 取消点赞
// @Summary 取消点赞
// @Description 用户取消点赞评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Router /api/v1/comments/{id}/unlike [post]
// @Security BearerAuth
func (h *CommentHandlers) UnlikeComment(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/comments/{id}/unlike", nil, "", nil)
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, 400, "评论ID格式错误")
		return
	}
	// 假设已通过中间件获取用户ID
	_, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, 401, "未认证")
		return
	}
	if err := h.service.UnlikeComment(id); err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "取消点赞失败")
		return
	}
	response.OKMsg(c, "取消点赞成功")
}

// GetCommentCount 获取评论数量
// @Summary 获取评论数量
// @Description 获取指定内容的评论数量
// @Tags 评论
// @Accept json
// @Produce json
// @Param post_id query int false "文章ID"
// @Param content_id query int false "内容ID"
// @Success 200 {object} response.ResponseAny{data=int64}
// @Router /api/v1/comments/count [get]
func (h *CommentHandlers) GetCommentCount(c *gin.Context) {
	bizLog := logger.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/comments/count", nil, "", nil)

	// 支持post_id或content_id参数
	postIDStr := c.Query("post_id")
	contentIDStr := c.Query("content_id")

	var postID, contentID int64
	var err error

	if postIDStr != "" {
		postID, err = strconv.ParseInt(postIDStr, 10, 64)
		if err != nil {
			response.Fail(c, 400, "post_id参数格式错误")
			return
		}
	} else if contentIDStr != "" {
		contentID, err = strconv.ParseInt(contentIDStr, 10, 64)
		if err != nil {
			response.Fail(c, 400, "content_id参数格式错误")
			return
		}
	} else {
		response.Fail(c, 400, "post_id或content_id参数必填")
		return
	}

	count, err := h.service.GetCommentCount(postID, contentID)
	if err != nil {
		bizLog.BusinessLogic("error", map[string]interface{}{"err": err})
		response.Fail(c, 500, "获取评论数量失败")
		return
	}

	response.OK(c, count, "获取评论数量成功")
}

// toCommentResponse 工具函数
func toCommentResponse(comment *models.Comment) dto.CommentResponse {
	var childComments []dto.CommentResponse
	for _, child := range comment.ChildComments {
		childComments = append(childComments, toCommentResponse(&child))
	}

	return dto.CommentResponse{
		ID:              comment.ID,
		PostID:          comment.PostID,
		ContentID:       comment.ContentID,
		AuthorID:        comment.AuthorID,
		Content:         comment.Content,
		ParentCommentID: comment.ParentCommentID,
		Likes:           comment.Likes,
		CreatedAt:       comment.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       comment.UpdatedAt.Format(time.RFC3339),
		Author: &dto.UserResponse{
			ID:              comment.Author.ID,
			Nickname:        comment.Author.Nickname,
			AvatarURL:       comment.Author.AvatarURL,
			ReputationScore: comment.Author.ReputationScore,
		},
		ChildComments: childComments,
	}
}
