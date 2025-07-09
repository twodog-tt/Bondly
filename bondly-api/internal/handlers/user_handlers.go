package handlers

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

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

// CreateUser 创建用户接口
// @Summary 创建新用户
// @Description 创建新的用户账户，支持Web2邮箱和Web3钱包地址
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param request body dto.CreateUserRequest true "创建用户请求体"
// @Success 200 {object} response.Response[dto.UserResponse] "用户创建成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或用户已存在"
// @Router /api/v1/users [post]
func (h *UserHandlers) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeInvalidParams, "请求参数格式错误")
		return
	}

	// 构建用户模型
	user := &models.User{
		WalletAddress:   req.WalletAddress,
		Email:           req.Email,
		Nickname:        req.Nickname,
		AvatarURL:       req.AvatarURL,
		Bio:             req.Bio,
		Role:            req.Role,
		ReputationScore: req.ReputationScore,
	}

	// 创建用户
	if err := h.userService.CreateUser(user); err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 构建响应数据
	data := h.buildUserResponse(user)
	response.OK(c, data, "用户创建成功")
}

// GetUserByID 根据ID获取用户接口
// @Summary 根据ID获取用户信息
// @Description 根据用户ID获取详细的用户信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response[dto.UserResponse] "获取用户成功"
// @Failure 200 {object} response.Response[any] "用户不存在"
// @Router /api/v1/users/{id} [get]
func (h *UserHandlers) GetUserByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, "用户ID格式错误")
		return
	}

	user, err := h.userService.GetUserByID(int64(id))
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	data := h.buildUserResponse(user)
	response.OK(c, data, "获取用户成功")
}

// GetUserByWalletAddress 根据钱包地址获取用户接口
// @Summary 根据钱包地址获取用户信息
// @Description 根据钱包地址获取用户信息，用于Web3登录
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "钱包地址"
// @Success 200 {object} response.Response[dto.UserResponse] "获取用户成功"
// @Failure 200 {object} response.Response[any] "用户不存在"
// @Router /api/v1/users/wallet/{address} [get]
func (h *UserHandlers) GetUserByWalletAddress(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		response.Fail(c, response.CodeInvalidParams, "钱包地址不能为空")
		return
	}

	user, err := h.userService.GetUserByWalletAddress(address)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	data := h.buildUserResponse(user)
	response.OK(c, data, "获取用户成功")
}

// GetUserByEmail 根据邮箱获取用户接口
// @Summary 根据邮箱获取用户信息
// @Description 根据邮箱地址获取用户信息，用于Web2登录
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param email path string true "邮箱地址"
// @Success 200 {object} response.Response[dto.UserResponse] "获取用户成功"
// @Failure 200 {object} response.Response[any] "用户不存在"
// @Router /api/v1/users/email/{email} [get]
func (h *UserHandlers) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		response.Fail(c, response.CodeInvalidParams, "邮箱地址不能为空")
		return
	}

	user, err := h.userService.GetUserByEmail(email)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	data := h.buildUserResponse(user)
	response.OK(c, data, "获取用户成功")
}

// UpdateUser 更新用户接口
// @Summary 更新用户信息
// @Description 更新指定用户的个人信息（部分更新）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Param request body dto.UpdateUserRequest true "更新用户请求体"
// @Success 200 {object} response.Response[dto.UserResponse] "用户更新成功"
// @Failure 200 {object} response.Response[any] "用户不存在或更新失败"
// @Router /api/v1/users/{id} [post]
func (h *UserHandlers) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, "用户ID格式错误")
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeInvalidParams, "请求参数格式错误")
		return
	}

	// 获取现有用户
	user, err := h.userService.GetUserByID(int64(id))
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 更新字段
	if req.Nickname != nil {
		user.Nickname = *req.Nickname
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}
	if req.Bio != nil {
		user.Bio = req.Bio
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.ReputationScore != nil {
		user.ReputationScore = *req.ReputationScore
	}

	// 更新用户
	if err := h.userService.UpdateUser(user); err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	data := h.buildUserResponse(user)
	response.OK(c, data, "用户更新成功")
}

// ListUsers 获取用户列表接口
// @Summary 获取用户列表
// @Description 分页获取用户列表
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.Response[[]dto.UserResponse] "获取用户列表成功"
// @Router /api/v1/users [get]
func (h *UserHandlers) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit
	users, err := h.userService.ListUsers(offset, limit)
	if err != nil {
		response.Fail(c, response.CodeInternalError, "获取用户列表失败")
		return
	}

	var data []dto.UserResponse
	for _, user := range users {
		data = append(data, *h.buildUserResponse(&user))
	}

	response.OK(c, data, "获取用户列表成功")
}

// GetTopUsersByReputation 获取声誉积分最高的用户接口
// @Summary 获取声誉积分排行榜
// @Description 获取声誉积分最高的用户列表
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param limit query int false "返回数量" default(10)
// @Success 200 {object} response.Response[[]dto.UserResponse] "获取排行榜成功"
// @Router /api/v1/users/top [get]
func (h *UserHandlers) GetTopUsersByReputation(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	users, err := h.userService.GetTopUsersByReputation(limit)
	if err != nil {
		response.Fail(c, response.CodeInternalError, "获取排行榜失败")
		return
	}

	var data []dto.UserResponse
	for _, user := range users {
		data = append(data, *h.buildUserResponse(&user))
	}

	response.OK(c, data, "获取排行榜成功")
}

// buildUserResponse 构建用户响应数据
func (h *UserHandlers) buildUserResponse(user *models.User) *dto.UserResponse {
	response := &dto.UserResponse{
		ID:              user.ID,
		WalletAddress:   user.WalletAddress,
		Email:           user.Email,
		Nickname:        user.Nickname,
		AvatarURL:       user.AvatarURL,
		Bio:             user.Bio,
		Role:            user.Role,
		ReputationScore: user.ReputationScore,
		CreatedAt:       user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:       user.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}

	if user.LastLoginAt != nil {
		lastLoginStr := user.LastLoginAt.Format("2006-01-02T15:04:05Z")
		response.LastLoginAt = &lastLoginStr
	}

	return response
}
