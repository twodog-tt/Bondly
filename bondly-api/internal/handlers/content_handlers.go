package handlers

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ContentHandlers 内容处理器
type ContentHandlers struct {
	contentService *services.ContentService
}

// NewContentHandlers 创建内容处理器
func NewContentHandlers(contentService *services.ContentService) *ContentHandlers {
	return &ContentHandlers{
		contentService: contentService,
	}
}

// CreateContent 创建内容
// @Summary 创建内容
// @Description 创建新的内容（文章、帖子、评论等）
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param content body dto.CreateContentRequest true "内容信息"
// @Success 201 {object} response.ResponseContent
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content [post]
// @Security BearerAuth
func (h *ContentHandlers) CreateContent(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/content", nil, "", nil)

	var req dto.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}

	// 构建Content模型
	content := models.Content{
		AuthorID:      userID.(int64),
		Title:         req.Title,
		Content:       req.Content,
		Type:          req.Type,
		Status:        req.Status,
		CoverImageURL: req.CoverImageURL,
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"author_id": content.AuthorID,
		"type":      content.Type,
		"status":    content.Status,
		"has_cover": content.CoverImageURL != nil,
	})

	if err := h.contentService.CreateContent(c.Request.Context(), &content); err != nil {
		bizLog.ThirdPartyError("content_service", "create_content", map[string]interface{}{
			"author_id": content.AuthorID,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.ContentCreated(content.ID, content.AuthorID, content.Type)
	response.OK(c, content, "Content created successfully")
}

// GetContent 获取单个内容
// @Summary 获取内容详情
// @Description 根据ID获取内容详情
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} response.ResponseContent
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content/{id} [get]
func (h *ContentHandlers) GetContent(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/content/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("content_id", "无效的内容ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid content ID")
		return
	}

	content, err := h.contentService.GetContent(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "content not found" {
			bizLog.ValidationFailed("content_id", "内容不存在", id)
			response.Fail(c, response.CodeNotFound, "Content not found")
			return
		}
		bizLog.ThirdPartyError("content_service", "get_content", map[string]interface{}{"content_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.ContentRetrieved(id, content.Views)
	response.OK(c, content, "Content retrieved successfully")
}

// ListContent 获取内容列表
// @Summary 获取内容列表
// @Description 分页获取内容列表，支持筛选
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Param type query string false "内容类型"
// @Param status query string false "内容状态"
// @Param author_id query int false "作者ID"
// @Success 200 {object} response.ResponseContent
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content [get]
func (h *ContentHandlers) ListContent(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/content", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	authorID := c.Query("author_id")
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	var contents []models.Content
	var total int64
	var err error

	if authorID != "" {
		if authorIDInt, err := strconv.ParseInt(authorID, 10, 64); err == nil {
			contents, total, err = h.contentService.GetContentByAuthor(c.Request.Context(), authorIDInt, page, limit)
		} else {
			bizLog.ValidationFailed("author_id", "无效的作者ID", authorID)
			response.Fail(c, response.CodeInvalidParams, "Invalid author ID")
			return
		}
	} else {
		contents, total, err = h.contentService.ListContent(c.Request.Context(), page, limit, status)
	}

	if err != nil {
		bizLog.ThirdPartyError("content_service", "list_content", map[string]interface{}{"page": page, "limit": limit}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.ContentListRetrieved(total, page, limit, map[string]interface{}{
		"author_id": authorID,
		"type":      c.Query("type"),
		"status":    c.Query("status"),
	})
	result := gin.H{
		"contents": contents,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Content list retrieved successfully")
}

// UpdateContent 更新内容
// @Summary 更新内容
// @Description 更新指定内容的信息
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param id path int true "内容ID"
// @Param content body dto.UpdateContentRequest true "更新的内容信息"
// @Success 200 {object} response.ResponseContent
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content/{id} [put]
// @Security BearerAuth
func (h *ContentHandlers) UpdateContent(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("PUT", "/api/v1/content/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("content_id", "无效的内容ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid content ID")
		return
	}

	var req dto.UpdateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}

	// 构建更新数据
	updateData := models.Content{}
	if req.Title != nil {
		updateData.Title = *req.Title
	}
	if req.Content != nil {
		updateData.Content = *req.Content
	}
	if req.Type != nil {
		updateData.Type = *req.Type
	}
	if req.Status != nil {
		updateData.Status = *req.Status
	}
	if req.CoverImageURL != nil {
		updateData.CoverImageURL = req.CoverImageURL
	}
	// 添加NFT相关字段处理
	if req.NFTTokenID != nil {
		updateData.NFTTokenID = req.NFTTokenID
	}
	if req.NFTContractAddress != nil {
		updateData.NFTContractAddress = req.NFTContractAddress
	}
	if req.IPFSHash != nil {
		updateData.IPFSHash = req.IPFSHash
	}
	if req.MetadataHash != nil {
		updateData.MetadataHash = req.MetadataHash
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id": id,
		"user_id":    userID,
		"has_cover":  req.CoverImageURL != nil,
		"has_nft":    req.NFTTokenID != nil || req.NFTContractAddress != nil,
	})

	content, err := h.contentService.UpdateContent(c.Request.Context(), id, &updateData)
	if err != nil {
		if err.Error() == "content not found" {
			bizLog.ValidationFailed("content_id", "内容不存在", id)
			response.Fail(c, response.CodeNotFound, "Content not found")
			return
		}
		bizLog.ThirdPartyError("content_service", "update_content", map[string]interface{}{"content_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 记录更新的字段
	var updatedFields []string
	if req.Title != nil {
		updatedFields = append(updatedFields, "title")
	}
	if req.Content != nil {
		updatedFields = append(updatedFields, "content")
	}
	if req.Type != nil {
		updatedFields = append(updatedFields, "type")
	}
	if req.Status != nil {
		updatedFields = append(updatedFields, "status")
	}
	if req.CoverImageURL != nil {
		updatedFields = append(updatedFields, "cover_image_url")
	}
	if req.NFTTokenID != nil {
		updatedFields = append(updatedFields, "nft_token_id")
	}
	if req.NFTContractAddress != nil {
		updatedFields = append(updatedFields, "nft_contract_address")
	}
	if req.IPFSHash != nil {
		updatedFields = append(updatedFields, "ip_fs_hash")
	}
	if req.MetadataHash != nil {
		updatedFields = append(updatedFields, "metadata_hash")
	}

	bizLog.ContentUpdated(id, userID.(int64), updatedFields)
	response.OK(c, content, "Content updated successfully")
}

// DeleteContent 删除内容
// @Summary 删除内容
// @Description 删除指定的内容
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/content/{id} [delete]
// @Security BearerAuth
func (h *ContentHandlers) DeleteContent(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/content/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("content_id", "无效的内容ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid content ID")
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id": id,
		"user_id":    userID,
	})

	if err := h.contentService.DeleteContent(c.Request.Context(), id); err != nil {
		if err.Error() == "content not found" {
			bizLog.ValidationFailed("content_id", "内容不存在", id)
			response.Fail(c, response.CodeNotFound, "Content not found")
			return
		}
		bizLog.ThirdPartyError("content_service", "delete_content", map[string]interface{}{"content_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.ContentDeleted(id, userID.(int64))
	response.OK(c, gin.H{}, "Content deleted successfully")
}
