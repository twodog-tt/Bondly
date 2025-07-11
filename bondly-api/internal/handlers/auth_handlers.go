package handlers

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
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
		// 获取对应的业务错误码
		businessCode := response.GetBusinessCode(authErr.Code)
		// 返回统一的错误响应
		response.Fail(c, businessCode, authErr.Error())
		return
	}

	// 处理非AuthError类型的错误
	response.Fail(c, response.CodeInternalError, response.MsgInternalError)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/auth/send-code", nil, "", nil)

	var req dto.SendCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.GetMessage(response.CodeRequestFormatError))
		return
	}

	// 清理邮箱地址（去除空格）
	req.Email = strings.TrimSpace(req.Email)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email": req.Email,
	})

	// 调用服务层发送验证码
	if err := h.authService.SendVerificationCode(c.Request.Context(), req.Email); err != nil {
		// 根据错误类型记录不同的日志
		var authErr *services.AuthError
		if errors.As(err, &authErr) {
			bizLog.ValidationFailed("email", authErr.Error(), req.Email)
		} else {
			bizLog.ThirdPartyError("email_service", "send_verification_code", map[string]interface{}{
				"email": req.Email,
			}, err)
		}
		h.handleAuthError(c, err)
		return
	}

	// 发送成功
	bizLog.CodeSent(req.Email, "10分钟")

	data := dto.SendCodeData{
		Email:     req.Email,
		ExpiresIn: "10分钟",
	}
	response.OK(c, data, response.MsgVerificationCodeSent)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/auth/verify-code", nil, "", nil)

	var req dto.VerifyCodeRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.GetMessage(response.CodeRequestFormatError))
		return
	}

	// 清理参数
	req.Email = strings.TrimSpace(req.Email)
	req.Code = strings.TrimSpace(req.Code)

	// 记录关键参数（验证码脱敏）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email":       req.Email,
		"code_length": len(req.Code),
	})

	// 验证验证码
	if err := h.authService.VerifyCode(c.Request.Context(), req.Email, req.Code); err != nil {
		// 根据错误类型记录不同的日志
		var authErr *services.AuthError
		if errors.As(err, &authErr) {
			bizLog.ValidationFailed("verification_code", authErr.Error(), map[string]interface{}{
				"email":       req.Email,
				"code_length": len(req.Code),
			})
		} else {
			bizLog.ThirdPartyError("verification_service", "verify_code", map[string]interface{}{
				"email": req.Email,
			}, err)
		}
		h.handleAuthError(c, err)
		return
	}

	// 判断用户是否是第一次登陆
	token, err := h.authService.CheckFirstLogin(c.Request.Context(), req.Email)
	if err != nil {
		bizLog.ThirdPartyError("auth_service", "check_first_login", map[string]interface{}{
			"email": req.Email,
		}, err)
		h.handleAuthError(c, err)
		return
	}

	// 验证成功
	bizLog.CodeVerified(req.Email)

	data := dto.VerifyCodeData{
		Email:   req.Email,
		IsValid: true,
		Token:   token,
	}
	response.OK(c, data, response.MsgVerificationCodeValid)
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
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/auth/code-status", nil, "", nil)

	email := c.Query("email")
	if email == "" {
		bizLog.ValidationFailed("email", "邮箱参数缺失", "")
		response.Fail(c, response.CodeEmailParamEmpty, response.GetMessage(response.CodeEmailParamEmpty))
		return
	}

	email = strings.TrimSpace(email)

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email": email,
	})

	// 获取验证码剩余时间
	codeTTL, err := h.authService.GetCodeTTL(c.Request.Context(), email)
	if err != nil {
		bizLog.ThirdPartyError("redis_service", "get_code_ttl", map[string]interface{}{
			"email": email,
		}, err)
		h.handleAuthError(c, err)
		return
	}

	// 获取限流剩余时间
	lockTTL, err := h.authService.GetLockTTL(c.Request.Context(), email)
	if err != nil {
		bizLog.ThirdPartyError("redis_service", "get_lock_ttl", map[string]interface{}{
			"email": email,
		}, err)
		h.handleAuthError(c, err)
		return
	}

	// 查询成功
	bizLog.Success("get_code_status", map[string]interface{}{
		"email":            email,
		"code_exists":      codeTTL > 0,
		"code_ttl_seconds": int(codeTTL.Seconds()),
		"locked":           lockTTL > 0,
		"lock_ttl_seconds": int(lockTTL.Seconds()),
	})

	data := dto.CodeStatusData{
		Email:          email,
		CodeExists:     codeTTL > 0,
		CodeTTLSeconds: int(codeTTL.Seconds()),
		Locked:         lockTTL > 0,
		LockTTLSeconds: int(lockTTL.Seconds()),
	}
	response.OK(c, data, response.MsgGetStatusSuccess)
}

// Login 用户登录接口
// @Summary 用户登录
// @Description 用户登录，如果用户不存在则自动创建新用户
// @Tags 认证管理
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "登录请求体"
// @Success 200 {object} response.Response[dto.LoginResponse] "登录成功"
// @Failure 200 {object} response.Response[any] "登录失败"
// @Router /api/v1/auth/login [post]
func (h *AuthHandlers) Login(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/auth/login", nil, "", nil)

	var req dto.LoginRequest

	// 绑定请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.GetMessage(response.CodeRequestFormatError))
		return
	}

	// 清理参数
	req.Email = strings.TrimSpace(req.Email)
	req.Nickname = strings.TrimSpace(req.Nickname)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"email":         req.Email,
		"nickname":      req.Nickname,
		"has_image_url": req.ImageURL != nil,
	})

	// 调用服务层登录
	loginData, err := h.authService.LoginIn(c.Request.Context(), req.Email, req.Nickname, req.ImageURL)
	if err != nil {
		// 根据错误类型记录不同的日志
		var authErr *services.AuthError
		if errors.As(err, &authErr) {
			bizLog.ValidationFailed("login_params", authErr.Error(), map[string]interface{}{
				"email": req.Email,
			})
		} else {
			bizLog.ThirdPartyError("auth_service", "login", map[string]interface{}{
				"email": req.Email,
			}, err)
		}
		h.handleAuthError(c, err)
		return
	}

	// 登录成功
	bizLog.LoginSuccess(loginData.UserID, req.Email, loginData.IsNewUser)

	// 登录成功
	response.OK(c, loginData, response.MsgLoginSuccess)
}
