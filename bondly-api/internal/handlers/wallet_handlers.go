package handlers

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WalletHandlers struct {
	walletService *services.WalletService
	userService   *services.UserService
}

func NewWalletHandlers(walletService *services.WalletService, userService *services.UserService) *WalletHandlers {
	return &WalletHandlers{
		walletService: walletService,
		userService:   userService,
	}
}

// GenerateCustodyWallet 生成托管钱包接口
// @Summary 生成托管钱包
// @Description 为指定用户生成托管钱包
// @Tags 钱包管理
// @Accept json
// @Produce json
// @Param request body dto.GenerateWalletRequest true "生成钱包请求体"
// @Success 200 {object} response.Response[dto.GenerateWalletResponse] "托管钱包生成成功"
// @Failure 200 {object} response.Response[any] "用户不存在或已存在托管钱包"
// @Router /api/v1/wallets/generate [post]
func (h *WalletHandlers) GenerateCustodyWallet(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/wallets/generate", nil, "", nil)

	var req dto.GenerateWalletRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id": req.UserID,
	})

	// 检查用户是否存在
	user, err := h.userService.GetUserByID(c.Request.Context(), req.UserID)
	if err != nil {
		bizLog.UserNotFound("user_id", req.UserID)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 检查用户是否已有托管钱包
	if user.CustodyWalletAddress != nil {
		bizLog.ValidationFailed("custody_wallet", "用户已存在托管钱包", map[string]interface{}{
			"user_id":         req.UserID,
			"existing_wallet": *user.CustodyWalletAddress,
		})
		response.Fail(c, response.CodeUserAlreadyExists, "用户已存在托管钱包")
		return
	}

	// 生成托管钱包
	walletInfo, err := h.walletService.GenerateCustodyWallet(c.Request.Context())
	if err != nil {
		bizLog.ThirdPartyError("wallet_service", "generate_custody_wallet", map[string]interface{}{
			"user_id": req.UserID,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 更新用户的托管钱包信息
	user.CustodyWalletAddress = &walletInfo.Address
	user.EncryptedPrivateKey = &walletInfo.EncryptedKey

	// 保存到数据库
	if err := h.userService.UpdateUser(c.Request.Context(), user); err != nil {
		bizLog.DatabaseError("update", "users", "UPDATE", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 钱包生成成功
	bizLog.WalletGenerated(user.ID, walletInfo.Address)

	// 构建响应数据
	data := &dto.GenerateWalletResponse{
		UserID:               user.ID,
		Nickname:             user.Nickname,
		CustodyWalletAddress: walletInfo.Address,
		Message:              "托管钱包生成成功",
	}

	response.OK(c, data, "托管钱包生成成功")
}

// GetWalletInfo 获取钱包信息接口
// @Summary 获取用户钱包信息
// @Description 获取指定用户的托管钱包信息（不返回私钥）
// @Tags 钱包管理
// @Accept json
// @Produce json
// @Param user_id path int true "用户ID"
// @Success 200 {object} response.Response[dto.WalletInfoResponse] "获取钱包信息成功"
// @Failure 200 {object} response.Response[any] "用户不存在"
// @Router /api/v1/wallets/{user_id} [get]
func (h *WalletHandlers) GetWalletInfo(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/wallets/{user_id}", nil, "", nil)

	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", userIDStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id": userID,
	})

	// 获取用户信息
	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		bizLog.UserNotFound("user_id", userID)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 获取钱包信息成功
	bizLog.Success("get_wallet_info", map[string]interface{}{
		"user_id":        userID,
		"has_wallet":     user.CustodyWalletAddress != nil,
		"wallet_address": user.CustodyWalletAddress,
	})

	// 构建响应数据
	data := &dto.WalletInfoResponse{
		UserID:               user.ID,
		Nickname:             user.Nickname,
		CustodyWalletAddress: user.CustodyWalletAddress,
		HasWallet:            user.CustodyWalletAddress != nil,
	}

	response.OK(c, data, "获取钱包信息成功")
}

// BatchGenerateWallets 批量生成托管钱包接口
// @Summary 批量生成托管钱包
// @Description 为多个用户批量生成托管钱包
// @Tags 钱包管理
// @Accept json
// @Produce json
// @Param user_ids body []int64 true "用户ID列表"
// @Success 200 {object} response.Response[[]dto.GenerateWalletResponse] "批量生成成功"
// @Failure 200 {object} response.Response[any] "部分用户生成失败"
// @Router /api/v1/wallets/batch-generate [post]
func (h *WalletHandlers) BatchGenerateWallets(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/wallets/batch-generate", nil, "", nil)

	var userIDs []int64

	// 绑定请求参数
	if err := c.ShouldBindJSON(&userIDs); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	if len(userIDs) == 0 {
		bizLog.ValidationFailed("user_ids", "用户ID列表不能为空", userIDs)
		response.Fail(c, response.CodeInvalidParams, "用户ID列表不能为空")
		return
	}

	if len(userIDs) > 100 {
		bizLog.ValidationFailed("user_ids", "批量生成数量不能超过100个", len(userIDs))
		response.Fail(c, response.CodeInvalidParams, "批量生成数量不能超过100个")
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_count": len(userIDs),
		"user_ids":   userIDs,
	})

	var results []dto.GenerateWalletResponse
	var errors []string

	// 为每个用户生成钱包
	for _, userID := range userIDs {
		// 检查用户是否存在
		user, err := h.userService.GetUserByID(c.Request.Context(), userID)
		if err != nil {
			bizLog.UserNotFound("user_id", userID)
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 检查用户是否已有托管钱包
		if user.CustodyWalletAddress != nil {
			bizLog.ValidationFailed("custody_wallet", "用户已存在托管钱包", map[string]interface{}{
				"user_id": userID,
			})
			errors = append(errors, fmt.Sprintf("用户ID %d: 已存在托管钱包", userID))
			continue
		}

		// 生成托管钱包
		walletInfo, err := h.walletService.GenerateCustodyWallet(c.Request.Context())
		if err != nil {
			bizLog.ThirdPartyError("wallet_service", "generate_custody_wallet", map[string]interface{}{
				"user_id": userID,
			}, err)
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 更新用户的托管钱包信息
		user.CustodyWalletAddress = &walletInfo.Address
		user.EncryptedPrivateKey = &walletInfo.EncryptedKey

		// 保存到数据库
		if err := h.userService.UpdateUser(c.Request.Context(), user); err != nil {
			bizLog.DatabaseError("update", "users", "UPDATE", err)
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 钱包生成成功
		bizLog.WalletGenerated(user.ID, walletInfo.Address)

		// 添加到结果列表
		results = append(results, dto.GenerateWalletResponse{
			UserID:               user.ID,
			Nickname:             user.Nickname,
			CustodyWalletAddress: walletInfo.Address,
			Message:              "托管钱包生成成功",
		})
	}

	// 批量生成完成
	bizLog.Success("batch_generate_wallets", map[string]interface{}{
		"total_count":   len(userIDs),
		"success_count": len(results),
		"error_count":   len(errors),
	})

	// 返回结果
	if len(errors) > 0 {
		// 部分失败
		response.OK(c, results, fmt.Sprintf("批量生成完成，成功 %d 个，失败 %d 个", len(results), len(errors)))
	} else {
		// 全部成功
		response.OK(c, results, "批量生成成功")
	}
}

// BindUserWallet 绑定用户钱包接口
// @Summary 绑定用户钱包地址
// @Description 为指定用户绑定外部钱包地址（如MetaMask等）
// @Tags 钱包管理
// @Accept json
// @Produce json
// @Param request body dto.BindWalletRequest true "绑定钱包请求体"
// @Success 200 {object} response.Response[dto.BindWalletResponse] "钱包绑定成功"
// @Failure 200 {object} response.Response[any] "用户不存在或钱包已绑定"
// @Router /api/v1/wallets/bind [post]
func (h *WalletHandlers) BindUserWallet(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/wallets/bind", nil, "", nil)

	var req dto.BindWalletRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id":        req.UserID,
		"wallet_address": req.WalletAddress,
	})

	// 检查用户是否存在
	user, err := h.userService.GetUserByID(c.Request.Context(), req.UserID)
	if err != nil {
		bizLog.UserNotFound("user_id", req.UserID)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 更新用户的钱包地址
	if err := h.userService.UpdateWalletAddress(c.Request.Context(), req.UserID, req.WalletAddress); err != nil {
		bizLog.DatabaseError("update", "users", "UPDATE", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 钱包绑定成功
	bizLog.WalletBound(req.UserID, req.WalletAddress)

	// 异步进行钱包绑定空投
	go func() {
		defer func() {
			if r := recover(); r != nil {
				bizLog.BusinessLogic("钱包绑定空投goroutine发生panic", map[string]interface{}{
					"user_id":        req.UserID,
					"wallet_address": req.WalletAddress,
					"panic":          r,
				})
			}
		}()

		if err := h.userService.ProcessWalletBindingAirdrop(c.Request.Context(), req.UserID, req.WalletAddress); err != nil {
			bizLog.BusinessLogic("钱包绑定空投失败", map[string]interface{}{
				"user_id":        req.UserID,
				"wallet_address": req.WalletAddress,
				"error":          err.Error(),
			})
		} else {
			bizLog.BusinessLogic("钱包绑定空投成功", map[string]interface{}{
				"user_id":        req.UserID,
				"wallet_address": req.WalletAddress,
			})
		}
	}()

	// 构建响应数据
	data := &dto.BindWalletResponse{
		UserID:        req.UserID,
		Nickname:      user.Nickname,
		WalletAddress: req.WalletAddress,
		Message:       "钱包绑定成功",
	}

	response.OK(c, data, "钱包绑定成功")
}
