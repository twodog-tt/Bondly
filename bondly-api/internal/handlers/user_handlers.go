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
// @Description 创建新用户，支持Web2和Web3用户信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param request body dto.CreateUserRequest true "创建用户请求体"
// @Success 200 {object} response.Response[dto.UserResponse] "用户创建成功"
// @Failure 200 {object} response.Response[any] "创建失败"
// @Router /api/v1/users [post]
func (h *UserHandlers) CreateUser(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/users", nil, "", nil)

	var req dto.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email":          req.Email,
		"nickname":       req.Nickname,
		"wallet_address": req.WalletAddress,
		"has_avatar":     req.AvatarURL != nil,
		"has_bio":        req.Bio != nil,
		"role":           req.Role,
	})

	// 构建用户模型
	user := &models.User{
		WalletAddress:        req.WalletAddress,
		Email:                req.Email,
		Nickname:             req.Nickname,
		AvatarURL:            req.AvatarURL,
		Bio:                  req.Bio,
		Role:                 req.Role,
		ReputationScore:      req.ReputationScore,
		CustodyWalletAddress: req.CustodyWalletAddress,
		EncryptedPrivateKey:  req.EncryptedPrivateKey,
	}

	// 创建用户
	if err := h.userService.CreateUser(c.Request.Context(), user); err != nil {
		bizLog.DatabaseError("create", "users", "INSERT", err)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 用户创建成功
	walletAddr := ""
	if user.WalletAddress != nil {
		walletAddr = *user.WalletAddress
	}
	bizLog.UserCreated(user.ID, *user.Email, walletAddr)

	// 构建响应数据
	data := h.buildUserResponse(user)
	response.OK(c, data, response.MsgUserCreated)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/users/{id}", nil, "", nil)

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id": id,
	})

	user, err := h.userService.GetUserByID(c.Request.Context(), int64(id))
	if err != nil {
		bizLog.UserNotFound("user_id", id)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 获取用户成功
	bizLog.Success("get_user_by_id", map[string]interface{}{
		"user_id":  user.ID,
		"email":    user.Email,
		"nickname": user.Nickname,
	})

	data := h.buildUserResponse(user)
	response.OK(c, data, response.MsgUserRetrieved)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/users/wallet/{address}", nil, "", nil)

	address := c.Param("address")
	if address == "" {
		bizLog.ValidationFailed("wallet_address", "钱包地址为空", "")
		response.Fail(c, response.CodeWalletAddressEmpty, response.MsgWalletAddressEmpty)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"wallet_address": address,
	})

	user, err := h.userService.GetUserByWalletAddress(c.Request.Context(), address)
	if err != nil {
		bizLog.UserNotFound("wallet_address", address)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 获取用户成功
	bizLog.Success("get_user_by_wallet", map[string]interface{}{
		"user_id":        user.ID,
		"wallet_address": address,
		"nickname":       user.Nickname,
	})

	data := h.buildUserResponse(user)
	response.OK(c, data, response.MsgUserRetrieved)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/users/email/{email}", nil, "", nil)

	email := c.Param("email")
	if email == "" {
		bizLog.ValidationFailed("email", "邮箱地址为空", "")
		response.Fail(c, response.CodeEmailAddressEmpty, response.MsgEmailAddressEmpty)
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email": email,
	})

	user, err := h.userService.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		bizLog.UserNotFound("email", email)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 获取用户成功
	bizLog.Success("get_user_by_email", map[string]interface{}{
		"user_id":  user.ID,
		"email":    email,
		"nickname": user.Nickname,
	})

	data := h.buildUserResponse(user)
	response.OK(c, data, response.MsgUserRetrieved)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/users/{id}", nil, "", nil)

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"user_id":              id,
		"has_nickname":         req.Nickname != nil,
		"has_avatar":           req.AvatarURL != nil,
		"has_bio":              req.Bio != nil,
		"has_role":             req.Role != nil,
		"has_reputation_score": req.ReputationScore != nil,
	})

	// 获取现有用户
	user, err := h.userService.GetUserByID(c.Request.Context(), int64(id))
	if err != nil {
		bizLog.UserNotFound("user_id", id)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 记录更新的字段
	var updatedFields []string

	// 更新字段
	if req.Nickname != nil {
		user.Nickname = *req.Nickname
		updatedFields = append(updatedFields, "nickname")
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
		updatedFields = append(updatedFields, "avatar_url")
	}
	if req.Bio != nil {
		user.Bio = req.Bio
		updatedFields = append(updatedFields, "bio")
	}
	if req.Role != nil {
		user.Role = *req.Role
		updatedFields = append(updatedFields, "role")
	}
	if req.ReputationScore != nil {
		user.ReputationScore = *req.ReputationScore
		updatedFields = append(updatedFields, "reputation_score")
	}
	if req.CustodyWalletAddress != nil {
		user.CustodyWalletAddress = req.CustodyWalletAddress
		updatedFields = append(updatedFields, "custody_wallet_address")
	}
	if req.EncryptedPrivateKey != nil {
		user.EncryptedPrivateKey = req.EncryptedPrivateKey
		updatedFields = append(updatedFields, "encrypted_private_key")
	}

	// 更新用户
	if err := h.userService.UpdateUser(c.Request.Context(), user); err != nil {
		bizLog.DatabaseError("update", "users", "UPDATE", err)
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 用户更新成功
	bizLog.UserUpdated(user.ID, updatedFields)

	data := h.buildUserResponse(user)
	response.OK(c, data, response.MsgUserUpdated)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/users", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"page":  page,
		"limit": limit,
	})

	offset := (page - 1) * limit
	users, err := h.userService.ListUsers(c.Request.Context(), offset, limit)
	if err != nil {
		bizLog.DatabaseError("select", "users", "SELECT", err)
		response.Fail(c, response.CodeGetUserListFailed, response.MsgGetUserListFailed)
		return
	}

	// 获取用户列表成功
	bizLog.Success("list_users", map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"total_count": len(users),
	})

	// 构建响应数据
	var data []*dto.UserResponse
	for _, user := range users {
		data = append(data, h.buildUserResponse(&user))
	}

	response.OK(c, data, response.MsgUserListRetrieved)
}

// GetTopUsersByReputation 获取声誉积分最高的用户接口
// @Summary 获取声誉积分最高的用户
// @Description 获取声誉积分最高的用户列表
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param limit query int false "获取数量" default(10)
// @Success 200 {object} response.Response[[]dto.UserResponse] "获取成功"
// @Router /api/v1/users/top [get]
func (h *UserHandlers) GetTopUsersByReputation(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	users, err := h.userService.GetTopUsersByReputation(c.Request.Context(), limit)
	if err != nil {
		response.Fail(c, response.CodeGetUserListFailed, response.MsgGetUserListFailed)
		return
	}

	// 构建响应数据
	var data []*dto.UserResponse
	for _, user := range users {
		data = append(data, h.buildUserResponse(&user))
	}

	response.OK(c, data, response.MsgUserListRetrieved)
}

// GetUserCustodyWallet 获取用户托管钱包接口
// @Summary 获取用户托管钱包信息
// @Description 获取指定用户的托管钱包地址和加密私钥
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response[dto.CustodyWalletResponse] "获取成功"
// @Failure 200 {object} response.Response[any] "用户不存在"
// @Router /api/v1/users/{id}/custody-wallet [get]
func (h *UserHandlers) GetUserCustodyWallet(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	user, err := h.userService.GetUserByID(c.Request.Context(), int64(id))
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	data := &dto.CustodyWalletResponse{
		UserID:               user.ID,
		Nickname:             user.Nickname,
		CustodyWalletAddress: user.CustodyWalletAddress,
	}

	response.OK(c, data, "获取托管钱包信息成功")
}

// buildUserResponse 构建用户响应数据
func (h *UserHandlers) buildUserResponse(user *models.User) *dto.UserResponse {
	response := &dto.UserResponse{
		ID:                   user.ID,
		WalletAddress:        user.WalletAddress,
		Email:                user.Email,
		Nickname:             user.Nickname,
		AvatarURL:            user.AvatarURL,
		Bio:                  user.Bio,
		Role:                 user.Role,
		ReputationScore:      user.ReputationScore,
		CustodyWalletAddress: user.CustodyWalletAddress,
		CreatedAt:            user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:            user.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}

	if user.LastLoginAt != nil {
		lastLoginStr := user.LastLoginAt.Format("2006-01-02T15:04:05Z")
		response.LastLoginAt = &lastLoginStr
	}

	return response
}
