package handlers

import (
	"bondly-api/internal/dto"
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
// @Summary 为用户生成托管钱包
// @Description 为指定用户生成托管钱包，包括钱包地址和加密私钥
// @Tags 钱包管理
// @Accept json
// @Produce json
// @Param request body dto.GenerateWalletRequest true "生成钱包请求体"
// @Success 200 {object} response.Response[dto.GenerateWalletResponse] "托管钱包生成成功"
// @Failure 200 {object} response.Response[any] "用户不存在或钱包已存在"
// @Router /api/v1/wallets/generate [post]
func (h *WalletHandlers) GenerateCustodyWallet(c *gin.Context) {
	var req dto.GenerateWalletRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 检查用户是否存在
	user, err := h.userService.GetUserByID(req.UserID)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 检查用户是否已有托管钱包
	if user.CustodyWalletAddress != nil {
		response.Fail(c, response.CodeUserAlreadyExists, "用户已存在托管钱包")
		return
	}

	// 生成托管钱包
	walletInfo, err := h.walletService.GenerateCustodyWallet()
	if err != nil {
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 更新用户的托管钱包信息
	user.CustodyWalletAddress = &walletInfo.Address
	user.EncryptedPrivateKey = &walletInfo.EncryptedKey

	// 保存到数据库
	if err := h.userService.UpdateUser(user); err != nil {
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

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
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	// 获取用户信息
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

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
	var userIDs []int64

	// 绑定请求参数
	if err := c.ShouldBindJSON(&userIDs); err != nil {
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	if len(userIDs) == 0 {
		response.Fail(c, response.CodeInvalidParams, "用户ID列表不能为空")
		return
	}

	if len(userIDs) > 100 {
		response.Fail(c, response.CodeInvalidParams, "批量生成数量不能超过100个")
		return
	}

	var results []dto.GenerateWalletResponse
	var errors []string

	// 为每个用户生成钱包
	for _, userID := range userIDs {
		// 检查用户是否存在
		user, err := h.userService.GetUserByID(userID)
		if err != nil {
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 检查用户是否已有托管钱包
		if user.CustodyWalletAddress != nil {
			errors = append(errors, fmt.Sprintf("用户ID %d: 已存在托管钱包", userID))
			continue
		}

		// 生成托管钱包
		walletInfo, err := h.walletService.GenerateCustodyWallet()
		if err != nil {
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 更新用户的托管钱包信息
		user.CustodyWalletAddress = &walletInfo.Address
		user.EncryptedPrivateKey = &walletInfo.EncryptedKey

		// 保存到数据库
		if err := h.userService.UpdateUser(user); err != nil {
			errors = append(errors, fmt.Sprintf("用户ID %d: %s", userID, err.Error()))
			continue
		}

		// 添加到结果列表
		results = append(results, dto.GenerateWalletResponse{
			UserID:               user.ID,
			Nickname:             user.Nickname,
			CustodyWalletAddress: walletInfo.Address,
			Message:              "托管钱包生成成功",
		})
	}

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
	var req dto.BindWalletRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 检查用户是否存在
	user, err := h.userService.GetUserByID(req.UserID)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 检查用户是否已绑定钱包
	if user.WalletAddress != nil {
		response.Fail(c, response.CodeUserAlreadyExists, "用户已绑定钱包地址")
		return
	}

	// 检查钱包地址是否已被其他用户绑定
	existingUser, err := h.userService.GetUserByWalletAddress(req.WalletAddress)
	if err == nil && existingUser != nil {
		response.Fail(c, response.CodeUserAlreadyExists, "该钱包地址已被其他用户绑定")
		return
	}

	// 更新用户的钱包地址
	user.WalletAddress = &req.WalletAddress

	// 保存到数据库
	if err := h.userService.UpdateUser(user); err != nil {
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	// 构建响应数据
	data := &dto.BindWalletResponse{
		UserID:        user.ID,
		Nickname:      user.Nickname,
		WalletAddress: req.WalletAddress,
		Message:       "钱包绑定成功",
	}

	response.OK(c, data, "钱包绑定成功")
}
