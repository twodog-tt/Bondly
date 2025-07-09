package services

import (
	"bondly-api/internal/logger"
	"bondly-api/internal/redis"
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net/mail"
	"strconv"
	"time"
)

// 自定义错误类型
var (
	ErrEmailInvalid    = errors.New("邮箱格式不正确")
	ErrEmailEmpty      = errors.New("邮箱不能为空")
	ErrRateLimited     = errors.New("验证码发送过于频繁，请60秒后再试")
	ErrCodeExpired     = errors.New("验证码已过期或不存在")
	ErrCodeInvalid     = errors.New("验证码不正确")
	ErrStorageFailed   = errors.New("存储验证码失败")
	ErrLockFailed      = errors.New("设置限流失败")
	ErrLockCheckFailed = errors.New("检查限流状态失败")
	ErrTTLFailed       = errors.New("获取验证码过期时间失败")
	ErrLockTTLFailed   = errors.New("获取限流时间失败")
)

// 错误包装器，用于携带额外信息
type AuthError struct {
	Err  error
	Code string // 业务错误码
}

func (e *AuthError) Error() string {
	return e.Err.Error()
}

func (e *AuthError) Unwrap() error {
	return e.Err
}

// 创建带错误码的认证错误
func NewAuthError(err error, code string) *AuthError {
	return &AuthError{
		Err:  err,
		Code: code,
	}
}

type AuthService struct {
	redisClient *redis.RedisClient
	logger      *logger.Logger
}

func NewAuthService(redisClient *redis.RedisClient) *AuthService {
	return &AuthService{
		redisClient: redisClient,
		logger:      logger.NewLogger(),
	}
}

// SendVerificationCode 发送验证码
func (s *AuthService) SendVerificationCode(email string) error {
	ctx := context.Background()

	s.logger.WithFields(map[string]interface{}{
		"email":  email,
		"action": "send_verification_code",
	}).Info("开始发送验证码")

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email": email,
			"error": err.Error(),
		}).Warn("邮箱格式验证失败")
		return NewAuthError(err, ErrorCodeEmailInvalid)
	}

	s.logger.WithField("email", email).Debug("邮箱格式验证通过")

	// 2. 检查是否在限流期内
	lockKey := fmt.Sprintf("email:lock:%s", email)
	exists, err := s.redisClient.Exists(ctx, lockKey)
	if err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("检查限流状态失败")
		return NewAuthError(fmt.Errorf("%w: %v", ErrLockCheckFailed, err), ErrorCodeLockCheckFailed)
	}

	if exists > 0 {
		s.logger.WithFields(map[string]interface{}{
			"email":   email,
			"lockKey": lockKey,
		}).Warn("验证码发送过于频繁，触发限流")
		return NewAuthError(ErrRateLimited, ErrorCodeRateLimited)
	}

	s.logger.WithField("email", email).Debug("限流检查通过")

	// 3. 生成6位数字验证码
	code := s.generateVerificationCode()
	s.logger.WithFields(map[string]interface{}{
		"email": email,
		"code":  code,
	}).Debug("生成验证码成功")

	// 4. 将验证码存入Redis，过期时间10分钟
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	if err := s.redisClient.Set(ctx, verifyKey, code, 10*time.Minute); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("存储验证码到Redis失败")
		return NewAuthError(fmt.Errorf("%w: %v", ErrStorageFailed, err), ErrorCodeStorageFailed)
	}

	s.logger.WithFields(map[string]interface{}{
		"email":      email,
		"verifyKey":  verifyKey,
		"expiration": "10分钟",
	}).Debug("验证码存储到Redis成功")

	// 5. 设置限流键，过期时间60秒
	if err := s.redisClient.Set(ctx, lockKey, "1", 60*time.Second); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("设置限流键失败")
		return NewAuthError(fmt.Errorf("%w: %v", ErrLockFailed, err), ErrorCodeLockFailed)
	}

	s.logger.WithFields(map[string]interface{}{
		"email":        email,
		"lockKey":      lockKey,
		"lockDuration": "60秒",
	}).Debug("限流键设置成功")

	// 6. 发送验证码到邮箱（模拟）
	s.sendEmailMock(email, code)

	s.logger.WithFields(map[string]interface{}{
		"email": email,
		"code":  code,
	}).Info("验证码发送成功")

	return nil
}

// VerifyCode 验证验证码
func (s *AuthService) VerifyCode(email, code string) error {
	ctx := context.Background()

	s.logger.WithFields(map[string]interface{}{
		"email":  email,
		"code":   code,
		"action": "verify_code",
	}).Info("开始验证验证码")

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email": email,
			"error": err.Error(),
		}).Warn("验证码验证时邮箱格式检查失败")
		return NewAuthError(err, ErrorCodeEmailInvalid)
	}

	s.logger.WithField("email", email).Debug("验证码验证时邮箱格式检查通过")

	// 2. 从Redis获取存储的验证码
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	storedCode, err := s.redisClient.Get(ctx, verifyKey)
	if err != nil {
		// 检查是否是键不存在的错误（验证码过期或从未发送）
		if err.Error() == "key does not exist" {
			s.logger.WithFields(map[string]interface{}{
				"email":     email,
				"verifyKey": verifyKey,
			}).Warn("验证码已过期或不存在")
			return NewAuthError(ErrCodeExpired, ErrorCodeExpired)
		}
		// 其他错误（Redis连接问题等）返回存储失败错误
		s.logger.WithFields(map[string]interface{}{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("从Redis获取验证码失败")
		return NewAuthError(fmt.Errorf("%w: %v", ErrStorageFailed, err), ErrorCodeStorageFailed)
	}

	s.logger.WithFields(map[string]interface{}{
		"email":      email,
		"verifyKey":  verifyKey,
		"storedCode": storedCode,
	}).Debug("从Redis获取验证码成功")

	// 3. 验证验证码
	if storedCode != code {
		s.logger.WithFields(map[string]interface{}{
			"email":        email,
			"providedCode": code,
			"storedCode":   storedCode,
		}).Warn("验证码不匹配")
		return NewAuthError(ErrCodeInvalid, ErrorCodeInvalid)
	}

	s.logger.WithField("email", email).Debug("验证码匹配成功")

	// 4. 验证成功后删除验证码
	if err := s.redisClient.Del(ctx, verifyKey); err != nil {
		// 记录日志但不返回错误，因为验证已经成功
		s.logger.WithFields(map[string]interface{}{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("验证成功后删除验证码失败")
	} else {
		s.logger.WithFields(map[string]interface{}{
			"email":     email,
			"verifyKey": verifyKey,
		}).Debug("验证成功后删除验证码成功")
	}

	s.logger.WithFields(map[string]interface{}{
		"email": email,
		"code":  code,
	}).Info("验证码验证成功")

	return nil
}

// validateEmail 校验邮箱格式
func (s *AuthService) validateEmail(email string) error {
	if email == "" {
		return ErrEmailEmpty
	}

	_, err := mail.ParseAddress(email)
	if err != nil {
		return ErrEmailInvalid
	}

	return nil
}

// generateVerificationCode 生成6位数字验证码
func (s *AuthService) generateVerificationCode() string {
	// 设置随机种子
	rand.Seed(time.Now().UnixNano())

	// 生成100000-999999之间的随机数，确保是6位数
	code := rand.Intn(900000) + 100000

	return strconv.Itoa(code)
}

// sendEmailMock 模拟发送邮件
func (s *AuthService) sendEmailMock(email, code string) {
	fmt.Printf("📧 [邮件发送模拟] 发送验证码到: %s\n", email)
	fmt.Printf("🔢 验证码: %s\n", code)
	fmt.Printf("⏰ 有效期: 10分钟\n")
	fmt.Println("📤 邮件发送成功（模拟）")
	fmt.Println("==========================================")
}

// GetCodeTTL 获取验证码剩余时间
func (s *AuthService) GetCodeTTL(email string) (time.Duration, error) {
	ctx := context.Background()
	verifyKey := fmt.Sprintf("email:verify:%s", email)

	s.logger.WithFields(map[string]interface{}{
		"email":     email,
		"verifyKey": verifyKey,
		"action":    "get_code_ttl",
	}).Debug("开始获取验证码剩余时间")

	ttl, err := s.redisClient.TTL(ctx, verifyKey)
	if err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("获取验证码剩余时间失败")
		return 0, NewAuthError(fmt.Errorf("%w: %v", ErrTTLFailed, err), ErrorCodeTTLFailed)
	}

	s.logger.WithFields(map[string]interface{}{
		"email":     email,
		"verifyKey": verifyKey,
		"ttl":       ttl.String(),
	}).Debug("获取验证码剩余时间成功")

	return ttl, nil
}

// GetLockTTL 获取限流剩余时间
func (s *AuthService) GetLockTTL(email string) (time.Duration, error) {
	ctx := context.Background()
	lockKey := fmt.Sprintf("email:lock:%s", email)

	s.logger.WithFields(map[string]interface{}{
		"email":   email,
		"lockKey": lockKey,
		"action":  "get_lock_ttl",
	}).Debug("开始获取限流剩余时间")

	ttl, err := s.redisClient.TTL(ctx, lockKey)
	if err != nil {
		s.logger.WithFields(map[string]interface{}{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("获取限流剩余时间失败")
		return 0, NewAuthError(fmt.Errorf("%w: %v", ErrLockTTLFailed, err), ErrorCodeLockTTLFailed)
	}

	s.logger.WithFields(map[string]interface{}{
		"email":   email,
		"lockKey": lockKey,
		"ttl":     ttl.String(),
	}).Debug("获取限流剩余时间成功")

	return ttl, nil
}
