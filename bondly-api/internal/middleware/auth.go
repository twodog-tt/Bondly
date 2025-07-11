package middleware

import (
	"bondly-api/internal/database"
	"bondly-api/internal/models"
	"bondly-api/internal/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Authorization header required",
			})
			c.Abort()
			return
		}

		// 检查Bearer token格式
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]
		claims, err := utils.ValidateJWT(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// 将用户信息存储到context中
		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)
		c.Set("wallet_address", claims.WalletAddress)
		c.Next()
	}
}

// AdminOnly 仅管理员访问中间件
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Authentication required",
			})
			c.Abort()
			return
		}

		if userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Admin access required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminOrOwner 管理员或资源所有者访问中间件
func AdminOrOwner(resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Authentication required",
			})
			c.Abort()
			return
		}

		userRole, _ := c.Get("user_role")

		// 管理员可以访问所有资源
		if userRole == "admin" {
			c.Next()
			return
		}

		// 普通用户只能访问自己的资源
		resourceID := c.Param("id")
		if resourceID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Resource ID required",
			})
			c.Abort()
			return
		}

		// 验证资源所有权
		if !isResourceOwner(c, resourceType, resourceID, userID.(int64)) {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Access denied: you can only access your own resources",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// isResourceOwner 检查用户是否为资源所有者
func isResourceOwner(c *gin.Context, resourceType, resourceID string, userID int64) bool {
	id, err := strconv.ParseInt(resourceID, 10, 64)
	if err != nil {
		return false
	}

	db := database.GetDB()

	switch resourceType {
	case "user":
		var user models.User
		if err := db.First(&user, id).Error; err != nil {
			return false
		}
		return user.ID == userID

	case "content":
		var content models.Content
		if err := db.First(&content, id).Error; err != nil {
			return false
		}
		return content.AuthorID == userID

	case "comment":
		var comment models.Comment
		if err := db.First(&comment, id).Error; err != nil {
			return false
		}
		return comment.AuthorID == userID

	case "proposal":
		var proposal models.Proposal
		if err := db.First(&proposal, id).Error; err != nil {
			return false
		}
		return proposal.ProposerID == userID

	case "vote":
		var vote models.Vote
		if err := db.First(&vote, id).Error; err != nil {
			return false
		}
		return vote.VoterID == userID

	case "wallet_binding":
		var binding models.WalletBinding
		if err := db.First(&binding, id).Error; err != nil {
			return false
		}
		return binding.UserID == userID

	default:
		return false
	}
}

// OptionalAuth 可选认证中间件（不强制要求登录）
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		token := tokenParts[1]
		claims, err := utils.ValidateJWT(token)
		if err != nil {
			c.Next()
			return
		}

		// 将用户信息存储到context中
		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)
		c.Set("wallet_address", claims.WalletAddress)
		c.Next()
	}
}
