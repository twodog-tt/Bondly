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
