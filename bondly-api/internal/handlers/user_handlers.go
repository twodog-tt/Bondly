package handlers

import (
	"bondly-api/internal/models"
	"bondly-api/internal/services"
	"bondly-api/internal/utils"

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

// GetUserInfo 获取用户信息
// @Summary 获取用户详细信息
// @Description 根据用户钱包地址获取用户的详细信息，包括用户名、头像、简介等
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} map[string]interface{} "用户详细信息"
// @Failure 400 {object} map[string]interface{} "地址参数缺失"
// @Failure 404 {object} map[string]interface{} "用户不存在"
// @Router /users/{address} [get]
func (h *UserHandlers) GetUserInfo(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		utils.BadRequest(c, "address parameter is required")
		return
	}

	user, err := h.userService.GetUserByAddress(address)
	if err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	utils.Success(c, user)
}

// GetUserBalance 获取用户余额
// @Summary 获取用户代币余额
// @Description 获取指定用户的各种代币余额信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} map[string]interface{} "用户余额信息"
// @Failure 400 {object} map[string]interface{} "地址参数缺失"
// @Router /users/{address}/balance [get]
func (h *UserHandlers) GetUserBalance(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		utils.BadRequest(c, "address parameter is required")
		return
	}

	// 这里可以集成区块链服务获取真实余额
	// 暂时返回模拟数据
	utils.Success(c, gin.H{
		"address":  address,
		"balance":  "0",
		"currency": "ETH",
	})
}

// GetUserReputation 获取用户声誉
// @Summary 获取用户声誉值
// @Description 获取用户在平台上的声誉分数和相关统计信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} map[string]interface{} "用户声誉信息"
// @Failure 400 {object} map[string]interface{} "地址参数缺失"
// @Failure 404 {object} map[string]interface{} "用户不存在"
// @Router /users/{address}/reputation [get]
func (h *UserHandlers) GetUserReputation(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		utils.BadRequest(c, "address parameter is required")
		return
	}

	reputation, err := h.userService.GetUserReputation(address)
	if err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	utils.Success(c, gin.H{
		"address":    address,
		"reputation": reputation,
	})
}

// CreateUser 创建用户
// @Summary 创建新用户
// @Description 创建新的用户账户，需要提供钱包地址和基本信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param request body object{address=string,username=string,avatar=string,bio=string} true "用户信息"
// @Success 200 {object} map[string]interface{} "用户创建成功"
// @Failure 400 {object} map[string]interface{} "请求参数错误或用户已存在"
// @Router /users [post]
func (h *UserHandlers) CreateUser(c *gin.Context) {
	var user struct {
		Address  string `json:"address" binding:"required"`
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Bio      string `json:"bio"`
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	newUser := &models.User{
		Address:  user.Address,
		Username: user.Username,
		Avatar:   user.Avatar,
		Bio:      user.Bio,
	}

	if err := h.userService.CreateUser(newUser); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, newUser)
}
