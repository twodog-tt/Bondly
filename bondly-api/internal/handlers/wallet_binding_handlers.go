package handlers

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// WalletBindingHandlers 钱包绑定处理器
type WalletBindingHandlers struct {
	walletBindingService *services.WalletBindingService
}

func NewWalletBindingHandlers(walletBindingService *services.WalletBindingService) *WalletBindingHandlers {
	return &WalletBindingHandlers{
		walletBindingService: walletBindingService,
	}
}

// CreateWalletBinding 创建钱包绑定
// @Summary 创建钱包绑定
// @Description 创建新的钱包绑定
// @Tags 钱包绑定管理
// @Accept json
// @Produce json
// @Param binding body models.WalletBinding true "钱包绑定信息"
// @Success 201 {object} response.ResponseWalletBinding
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/wallet-bindings [post]
// @Security BearerAuth
func (h *WalletBindingHandlers) CreateWalletBinding(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/wallet-bindings", nil, "", nil)

	var binding models.WalletBinding
	if err := c.ShouldBindJSON(&binding); err != nil {
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
	binding.UserID = userID.(int64)

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id":        binding.UserID,
		"wallet_address": binding.WalletAddress,
		"network":        binding.Network,
	})

	if err := h.walletBindingService.CreateWalletBinding(c.Request.Context(), &binding); err != nil {
		bizLog.ThirdPartyError("wallet_binding_service", "create_wallet_binding", map[string]interface{}{
			"user_id":        binding.UserID,
			"wallet_address": binding.WalletAddress,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("钱包绑定创建成功", map[string]interface{}{
		"binding_id": binding.ID,
		"user_id":    binding.UserID,
	})
	response.OK(c, binding, "Wallet binding created successfully")
}

// GetWalletBinding 获取单个钱包绑定
// @Summary 获取钱包绑定详情
// @Description 根据ID获取钱包绑定详情
// @Tags 钱包绑定管理
// @Accept json
// @Produce json
// @Param id path int true "钱包绑定ID"
// @Success 200 {object} response.ResponseWalletBinding
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/wallet-bindings/{id} [get]
func (h *WalletBindingHandlers) GetWalletBinding(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/wallet-bindings/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("binding_id", "无效的钱包绑定ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid wallet binding ID")
		return
	}

	binding, err := h.walletBindingService.GetWalletBinding(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "wallet binding not found" {
			bizLog.ValidationFailed("binding_id", "钱包绑定不存在", id)
			response.Fail(c, response.CodeNotFound, "Wallet binding not found")
			return
		}
		bizLog.ThirdPartyError("wallet_binding_service", "get_wallet_binding", map[string]interface{}{"binding_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取钱包绑定成功", map[string]interface{}{"binding_id": id})
	response.OK(c, binding, "Wallet binding retrieved successfully")
}

// UpdateWalletBinding 更新钱包绑定
// @Summary 更新钱包绑定
// @Description 更新指定钱包绑定的信息
// @Tags 钱包绑定管理
// @Accept json
// @Produce json
// @Param id path int true "钱包绑定ID"
// @Param binding body models.WalletBinding true "更新的钱包绑定信息"
// @Success 200 {object} response.ResponseWalletBinding
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/wallet-bindings/{id} [put]
// @Security BearerAuth
func (h *WalletBindingHandlers) UpdateWalletBinding(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("PUT", "/api/v1/wallet-bindings/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("binding_id", "无效的钱包绑定ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid wallet binding ID")
		return
	}

	var updateData models.WalletBinding
	if err := c.ShouldBindJSON(&updateData); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"binding_id": id,
	})

	binding, err := h.walletBindingService.UpdateWalletBinding(c.Request.Context(), id, &updateData)
	if err != nil {
		if err.Error() == "wallet binding not found" {
			bizLog.ValidationFailed("binding_id", "钱包绑定不存在", id)
			response.Fail(c, response.CodeNotFound, "Wallet binding not found")
			return
		}
		bizLog.ThirdPartyError("wallet_binding_service", "update_wallet_binding", map[string]interface{}{"binding_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("钱包绑定更新成功", map[string]interface{}{"binding_id": id})
	response.OK(c, binding, "Wallet binding updated successfully")
}

// DeleteWalletBinding 删除钱包绑定
// @Summary 删除钱包绑定
// @Description 删除指定的钱包绑定
// @Tags 钱包绑定管理
// @Accept json
// @Produce json
// @Param id path int true "钱包绑定ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/wallet-bindings/{id} [delete]
// @Security BearerAuth
func (h *WalletBindingHandlers) DeleteWalletBinding(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/wallet-bindings/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("binding_id", "无效的钱包绑定ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid wallet binding ID")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"binding_id": id,
	})

	if err := h.walletBindingService.DeleteWalletBinding(c.Request.Context(), id); err != nil {
		if err.Error() == "wallet binding not found" {
			bizLog.ValidationFailed("binding_id", "钱包绑定不存在", id)
			response.Fail(c, response.CodeNotFound, "Wallet binding not found")
			return
		}
		bizLog.ThirdPartyError("wallet_binding_service", "delete_wallet_binding", map[string]interface{}{"binding_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("钱包绑定删除成功", map[string]interface{}{"binding_id": id})
	response.OK(c, gin.H{}, "Wallet binding deleted successfully")
}

// ListWalletBindings 获取钱包绑定列表
// @Summary 获取钱包绑定列表
// @Description 分页获取钱包绑定列表
// @Tags 钱包绑定管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseWalletBinding
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/wallet-bindings [get]
func (h *WalletBindingHandlers) ListWalletBindings(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/wallet-bindings", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	bindings, total, err := h.walletBindingService.ListWalletBinding(c.Request.Context(), page, limit)
	if err != nil {
		bizLog.ThirdPartyError("wallet_binding_service", "list_wallet_bindings", map[string]interface{}{"page": page, "limit": limit}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取钱包绑定列表成功", map[string]interface{}{"total": total, "page": page, "limit": limit})
	result := gin.H{
		"bindings": bindings,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Wallet binding list retrieved successfully")
}
