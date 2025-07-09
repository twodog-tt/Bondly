package handlers

import (
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"errors"

	"github.com/gin-gonic/gin"
)

type UserHandlers struct {
	userService *services.UserService
}

func NewUserHandlers(userService *services.UserService) *UserHandlers {
	return &UserHandlers{
		userService: userService,
	}
}

// handleUserError 统一处理用户相关错误
func (h *UserHandlers) handleUserError(c *gin.Context, err error) {
	var authErr *services.AuthError
	if errors.As(err, &authErr) {
		// 根据错误码返回不同的业务状态码
		switch authErr.Code {
		case services.ErrorCodeUserAddressEmpty, services.ErrorCodeUserIDEmpty:
			response.Fail(c, response.CodeInvalidParams, authErr.Error())
		case services.ErrorCodeUserAlreadyExists:
			response.Fail(c, response.CodeInvalidParams, authErr.Error())
		case services.ErrorCodeUserNotFound:
			response.Fail(c, response.CodeNotFound, authErr.Error())
		case services.ErrorCodeUserUpdateFailed, services.ErrorCodeUserCreateFailed, services.ErrorCodeCacheFailed:
			response.Fail(c, response.CodeInternalError, "服务器内部错误")
		default:
			response.Fail(c, response.CodeInternalError, "未知错误")
		}
		return
	}

	// 处理非AuthError类型的错误
	response.Fail(c, response.CodeInternalError, "服务器内部错误")
}

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Address  string `json:"address" binding:"required" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Username string `json:"username" example:"john_doe"`
	Avatar   string `json:"avatar" example:"https://example.com/avatar.jpg"`
	Bio      string `json:"bio" example:"Blockchain enthusiast"`
}

// GetUserInfo 获取用户信息
// @Summary 获取用户详细信息
// @Description 根据用户钱包地址获取用户的详细信息，包括用户名、头像、简介、声誉值、注册时间等。
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址" example(0x1234567890abcdef1234567890abcdef12345678) minLength(42) maxLength(42)
// @Success 200 {object} response.Response[UserInfoData] "用户详细信息"
// @Failure 200 {object} response.Response[any] "地址参数缺失或用户不存在"
// @Router /api/v1/users/{address} [get]
func (h *UserHandlers) GetUserInfo(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		response.Fail(c, response.CodeInvalidParams, "address parameter is required")
		return
	}

	user, err := h.userService.GetUserByAddress(address)
	if err != nil {
		h.handleUserError(c, err)
		return
	}

	data := UserInfoData{
		Address: user.Address,
		Message: "User information",
	}
	response.OK(c, data, "获取用户信息成功")
}

// GetUserBalance 获取用户余额
// @Summary 获取用户代币余额
// @Description 获取指定用户的各种代币余额信息，包括ETH余额、BONDLY代币余额等，以及对应的USD价值。
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址" example(0x1234567890abcdef1234567890abcdef12345678) minLength(42) maxLength(42)
// @Success 200 {object} response.Response[UserBalanceData] "用户余额信息"
// @Failure 200 {object} response.Response[any] "地址参数缺失或格式错误"
// @Router /api/v1/users/{address}/balance [get]
func (h *UserHandlers) GetUserBalance(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		response.Fail(c, response.CodeInvalidParams, "address parameter is required")
		return
	}

	balance, err := h.userService.GetUserBalance(address)
	if err != nil {
		h.handleUserError(c, err)
		return
	}

	data := UserBalanceData{
		Address: address,
		Balance: balance,
		Message: "User balance",
	}
	response.OK(c, data, "获取用户余额成功")
}

// GetUserReputation 获取用户声誉
// @Summary 获取用户声誉值
// @Description 获取用户在平台上的声誉分数、排名以及相关统计信息。声誉值反映用户的贡献和活跃度。
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址" example(0x1234567890abcdef1234567890abcdef12345678) minLength(42) maxLength(42)
// @Success 200 {object} response.Response[UserReputationData] "用户声誉信息"
// @Failure 200 {object} response.Response[any] "地址参数缺失或用户不存在"
// @Router /api/v1/users/{address}/reputation [get]
func (h *UserHandlers) GetUserReputation(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		response.Fail(c, response.CodeInvalidParams, "address parameter is required")
		return
	}

	reputation, err := h.userService.GetUserReputation(address)
	if err != nil {
		h.handleUserError(c, err)
		return
	}

	data := UserReputationData{
		Address:    address,
		Reputation: int(reputation), // 转换int64到int
	}
	response.OK(c, data, "获取用户声誉成功")
}

// CreateUser 创建用户
// @Summary 创建新用户
// @Description 创建新的用户账户，需要提供钱包地址和基本信息。钱包地址必须是有效的以太坊地址且未被注册。
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param request body CreateUserRequest true "用户信息"
// @Success 200 {object} response.Response[CreateUserData] "用户创建成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或用户已存在"
// @Router /api/v1/users [post]
func (h *UserHandlers) CreateUser(c *gin.Context) {
	var userReq CreateUserRequest

	if err := c.ShouldBindJSON(&userReq); err != nil {
		response.Fail(c, response.CodeInvalidParams, "请求参数格式错误")
		return
	}

	newUser := &models.User{
		Address:  userReq.Address,
		Username: userReq.Username,
		Avatar:   userReq.Avatar,
		Bio:      userReq.Bio,
	}

	if err := h.userService.CreateUser(newUser); err != nil {
		h.handleUserError(c, err)
		return
	}

	data := CreateUserData{
		ID:      "1",
		Message: "User created successfully",
	}
	response.OK(c, data, "创建用户成功")
}
