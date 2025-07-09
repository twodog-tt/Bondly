package handlers

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"errors"
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

// handleAuthError 统一处理认证错误
func (h *AuthHandlers) handleAuthError(c *gin.Context, err error) {
	var authErr *services.AuthError
	if errors.As(err, &authErr) {
		// 根据错误码返回不同的业务状态码
		switch authErr.Code {
		case services.ErrorCodeEmailInvalid, services.ErrorCodeEmailEmpty:
			response.Fail(c, response.CodeInvalidParams, authErr.Error())
		case services.ErrorCodeRateLimited:
			response.Fail(c, response.CodeInvalidParams, authErr.Error())
		case services.ErrorCodeExpired, services.ErrorCodeInvalid:
			response.Fail(c, response.CodeVerificationError, authErr.Error())
		case services.ErrorCodeStorageFailed, services.ErrorCodeLockFailed,
			services.ErrorCodeLockCheckFailed, services.ErrorCodeTTLFailed,
			services.ErrorCodeLockTTLFailed:
			response.Fail(c, response.CodeInternalError, "服务器内部错误")
		default:
			response.Fail(c, response.CodeInternalError, "未知错误")
		}
		return
	}

	// 处理非AuthError类型的错误
	response.Fail(c, response.CodeInternalError, "服务器内部错误")
}

// SendVerificationCode 发送验证码接口
// @Summary 发送邮箱验证码
// @Description 向指定邮箱发送6位数字验证码，用于用户身份验证。验证码有效期为10分钟，60秒内最多只能发送一次。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param request body dto.SendCodeRequest true "发送验证码请求体"
// @Success 200 {object} response.Response[dto.SendCodeData] "验证码发送成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或邮箱格式无效"
// @Router /api/v1/auth/send-code [post]
func (h *AuthHandlers) SendVerificationCode(c *gin.Context) {
	var req dto.SendCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeInvalidParams, "请求参数格式错误")
		return
	}

	// 清理邮箱地址（去除空格）
	req.Email = strings.TrimSpace(req.Email)

	// 调用服务层发送验证码
	if err := h.authService.SendVerificationCode(req.Email); err != nil {
		h.handleAuthError(c, err)
		return
	}

	// 发送成功
	data := dto.SendCodeData{
		Email:     req.Email,
		ExpiresIn: "10分钟",
	}
	response.OK(c, data, "验证码发送成功")
}

// VerifyCode 验证验证码接口
// @Summary 验证邮箱验证码
// @Description 验证用户提交的6位数字验证码是否正确。验证成功后，验证码自动失效。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param request body dto.VerifyCodeRequest true "验证码验证请求体"
// @Success 200 {object} response.Response[dto.VerifyCodeData] "验证码验证成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或验证码不正确"
// @Router /api/v1/auth/verify-code [post]
func (h *AuthHandlers) VerifyCode(c *gin.Context) {
	var req dto.VerifyCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, response.CodeInvalidParams, "请求参数格式错误")
		return
	}

	// 清理参数
	req.Email = strings.TrimSpace(req.Email)
	req.Code = strings.TrimSpace(req.Code)

	// 验证验证码
	if err := h.authService.VerifyCode(req.Email, req.Code); err != nil {
		h.handleAuthError(c, err)
		return
	}

	// 验证成功
	data := dto.VerifyCodeData{
		Email:   req.Email,
		IsValid: true,
		Token:   "", // 暂时为空，后续可以添加JWT token生成逻辑
	}
	response.OK(c, data, "验证码验证成功")
}

// GetCodeStatus 获取验证码状态接口
// @Summary 查询验证码状态
// @Description 查询指定邮箱的验证码是否存在、剩余有效时间以及是否被限流。用于前端显示重发倒计时等功能。
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param email query string true "邮箱地址" format(email) example(user@example.com)
// @Success 200 {object} response.Response[dto.CodeStatusData] "查询成功"
// @Failure 200 {object} response.Response[any] "邮箱参数缺失或格式错误"
// @Router /api/v1/auth/code-status [get]
func (h *AuthHandlers) GetCodeStatus(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.Fail(c, response.CodeInvalidParams, "邮箱参数不能为空")
		return
	}

	email = strings.TrimSpace(email)

	// 获取验证码剩余时间
	codeTTL, err := h.authService.GetCodeTTL(email)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	// 获取限流剩余时间
	lockTTL, err := h.authService.GetLockTTL(email)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	data := dto.CodeStatusData{
		Email:          email,
		CodeExists:     codeTTL > 0,
		CodeTTLSeconds: int(codeTTL.Seconds()),
		Locked:         lockTTL > 0,
		LockTTLSeconds: int(lockTTL.Seconds()),
	}
	response.OK(c, data, "获取状态成功")
}
