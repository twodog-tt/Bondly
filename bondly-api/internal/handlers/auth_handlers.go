package handlers

import (
	"bondly-api/internal/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthHandlers struct {
	authService *services.AuthService
}

func NewAuthHandlers(authService *services.AuthService) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
	}
}

// SendCodeRequest 发送验证码请求结构
type SendCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com" format:"email"`
}

// VerifyCodeRequest 验证验证码请求结构
type VerifyCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com" format:"email"`
	Code  string `json:"code" binding:"required" example:"123456" minLength:"6" maxLength:"6"`
}

// SendVerificationCode 发送验证码接口
// @Summary 发送邮箱验证码
// @Description 向指定邮箱发送6位数字验证码，用于用户身份验证。验证码有效期为10分钟，60秒内最多只能发送一次。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param request body SendCodeRequest true "发送验证码请求体"
// @Success 200 {object} models.AuthSuccessResponse{data=models.SendCodeData} "验证码发送成功"
// @Failure 400 {object} models.AuthErrorResponse "请求参数错误或邮箱格式无效"
// @Failure 429 {object} models.AuthErrorResponse "请求过于频繁，请稍后再试"
// @Failure 500 {object} models.AuthErrorResponse "服务器内部错误"
// @Router /api/v1/auth/send-code [post]
func (h *AuthHandlers) SendVerificationCode(c *gin.Context) {
	var req SendCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数格式错误",
			"error":   err.Error(),
		})
		return
	}

	// 清理邮箱地址（去除空格）
	req.Email = strings.TrimSpace(req.Email)

	// 调用服务层发送验证码
	if err := h.authService.SendVerificationCode(req.Email); err != nil {
		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "邮箱格式") {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		if strings.Contains(err.Error(), "过于频繁") {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		// 其他服务器错误
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "验证码发送失败",
			"error":   err.Error(),
		})
		return
	}

	// 发送成功
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "验证码发送成功",
		"data": gin.H{
			"email":      req.Email,
			"expires_in": "10分钟",
		},
	})
}

// VerifyCode 验证验证码接口
// @Summary 验证邮箱验证码
// @Description 验证用户提交的6位数字验证码是否正确。验证成功后，验证码自动失效。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param request body VerifyCodeRequest true "验证码验证请求体"
// @Success 200 {object} models.AuthSuccessResponse{data=models.VerifyCodeData} "验证码验证成功"
// @Failure 400 {object} models.AuthErrorResponse "请求参数错误或邮箱格式无效"
// @Failure 401 {object} models.AuthErrorResponse "验证码不正确或已过期"
// @Failure 500 {object} models.AuthErrorResponse "服务器内部错误"
// @Router /api/v1/auth/verify-code [post]
func (h *AuthHandlers) VerifyCode(c *gin.Context) {
	var req VerifyCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数格式错误",
			"error":   err.Error(),
		})
		return
	}

	// 清理参数
	req.Email = strings.TrimSpace(req.Email)
	req.Code = strings.TrimSpace(req.Code)

	// 验证验证码
	if err := h.authService.VerifyCode(req.Email, req.Code); err != nil {
		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "邮箱格式") {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		if strings.Contains(err.Error(), "验证码") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}

		// 其他服务器错误
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "验证失败",
			"error":   err.Error(),
		})
		return
	}

	// 验证成功
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "验证码验证成功",
		"data": gin.H{
			"email":       req.Email,
			"verified_at": gin.H{},
		},
	})
}

// GetCodeStatus 获取验证码状态接口
// @Summary 查询验证码状态
// @Description 查询指定邮箱的验证码是否存在、剩余有效时间以及是否被限流。用于前端显示重发倒计时等功能。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param email query string true "邮箱地址" format(email) example(user@example.com)
// @Success 200 {object} models.AuthSuccessResponse{data=models.CodeStatusData} "查询成功"
// @Failure 400 {object} models.AuthErrorResponse "邮箱参数缺失或格式错误"
// @Failure 500 {object} models.AuthErrorResponse "服务器内部错误"
// @Router /api/v1/auth/code-status [get]
func (h *AuthHandlers) GetCodeStatus(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "邮箱参数不能为空",
		})
		return
	}

	email = strings.TrimSpace(email)

	// 获取验证码剩余时间
	codeTTL, err := h.authService.GetCodeTTL(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取验证码状态失败",
			"error":   err.Error(),
		})
		return
	}

	// 获取限流剩余时间
	lockTTL, err := h.authService.GetLockTTL(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取限流状态失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取状态成功",
		"data": gin.H{
			"email":            email,
			"code_exists":      codeTTL > 0,
			"code_ttl_seconds": int(codeTTL.Seconds()),
			"locked":           lockTTL > 0,
			"lock_ttl_seconds": int(lockTTL.Seconds()),
		},
	})
}
