package handlers

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CommentHandlers 评论处理器
type CommentHandlers struct {
	commentService *services.CommentService
}

func NewCommentHandlers(commentService *services.CommentService) *CommentHandlers {
	return &CommentHandlers{
		commentService: commentService,
	}
}

// CreateComment 创建评论
// @Summary 创建评论
// @Description 创建新的评论
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param comment body models.Comment true "评论信息"
// @Success 201 {object} response.ResponseComment
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/comments [post]
// @Security BearerAuth
func (h *CommentHandlers) CreateComment(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/comments", nil, "", nil)

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}
	comment.AuthorID = userID.(int64)

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"author_id": comment.AuthorID,
		"post_id":   comment.PostID,
	})

	if err := h.commentService.CreateComment(c.Request.Context(), &comment); err != nil {
		bizLog.ThirdPartyError("comment_service", "create_comment", map[string]interface{}{"author_id": comment.AuthorID}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("评论创建成功", map[string]interface{}{"comment_id": comment.ID, "author_id": comment.AuthorID})
	response.OK(c, comment, "Comment created successfully")
}

// GetComment 获取单个评论
// @Summary 获取评论详情
// @Description 根据ID获取评论详情
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseComment
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/comments/{id} [get]
func (h *CommentHandlers) GetComment(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/comments/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("comment_id", "无效的评论ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid comment ID")
		return
	}

	comment, err := h.commentService.GetComment(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "comment not found" {
			bizLog.ValidationFailed("comment_id", "评论不存在", id)
			response.Fail(c, response.CodeNotFound, "Comment not found")
			return
		}
		bizLog.ThirdPartyError("comment_service", "get_comment", map[string]interface{}{"comment_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取评论成功", map[string]interface{}{"comment_id": id})
	response.OK(c, comment, "Comment retrieved successfully")
}

// UpdateComment 更新评论
// @Summary 更新评论
// @Description 更新指定评论的信息
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Param comment body models.Comment true "更新的评论信息"
// @Success 200 {object} response.ResponseComment
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/comments/{id} [put]
// @Security BearerAuth
func (h *CommentHandlers) UpdateComment(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("PUT", "/api/v1/comments/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("comment_id", "无效的评论ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid comment ID")
		return
	}

	var updateData models.Comment
	if err := c.ShouldBindJSON(&updateData); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"comment_id": id,
	})

	comment, err := h.commentService.UpdateComment(c.Request.Context(), id, &updateData)
	if err != nil {
		if err.Error() == "comment not found" {
			bizLog.ValidationFailed("comment_id", "评论不存在", id)
			response.Fail(c, response.CodeNotFound, "Comment not found")
			return
		}
		bizLog.ThirdPartyError("comment_service", "update_comment", map[string]interface{}{"comment_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("评论更新成功", map[string]interface{}{"comment_id": id})
	response.OK(c, comment, "Comment updated successfully")
}

// DeleteComment 删除评论
// @Summary 删除评论
// @Description 删除指定的评论
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param id path int true "评论ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/comments/{id} [delete]
// @Security BearerAuth
func (h *CommentHandlers) DeleteComment(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/comments/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("comment_id", "无效的评论ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid comment ID")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"comment_id": id,
	})

	if err := h.commentService.DeleteComment(c.Request.Context(), id); err != nil {
		if err.Error() == "comment not found" {
			bizLog.ValidationFailed("comment_id", "评论不存在", id)
			response.Fail(c, response.CodeNotFound, "Comment not found")
			return
		}
		bizLog.ThirdPartyError("comment_service", "delete_comment", map[string]interface{}{"comment_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("评论删除成功", map[string]interface{}{"comment_id": id})
	response.OK(c, gin.H{}, "Comment deleted successfully")
}

// ListComments 获取评论列表
// @Summary 获取评论列表
// @Description 分页获取评论列表
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseComment
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/comments [get]
func (h *CommentHandlers) ListComments(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/comments", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	comments, total, err := h.commentService.ListComment(c.Request.Context(), page, limit)
	if err != nil {
		bizLog.ThirdPartyError("comment_service", "list_comments", map[string]interface{}{"page": page, "limit": limit}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取评论列表成功", map[string]interface{}{"total": total, "page": page, "limit": limit})
	result := gin.H{
		"comments": comments,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Comment list retrieved successfully")
}
