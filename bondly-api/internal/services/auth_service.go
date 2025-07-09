package services

import (
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
}

func NewAuthService(redisClient *redis.RedisClient) *AuthService {
	return &AuthService{
		redisClient: redisClient,
	}
}

// SendVerificationCode 发送验证码
func (s *AuthService) SendVerificationCode(email string) error {
	ctx := context.Background()

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		return NewAuthError(err, ErrorCodeEmailInvalid)
	}

	// 2. 检查是否在限流期内
	lockKey := fmt.Sprintf("email:lock:%s", email)
	exists, err := s.redisClient.Exists(ctx, lockKey)
	if err != nil {
		return NewAuthError(fmt.Errorf("%w: %v", ErrLockCheckFailed, err), ErrorCodeLockCheckFailed)
	}
	if exists > 0 {
		return NewAuthError(ErrRateLimited, ErrorCodeRateLimited)
	}

	// 3. 生成6位数字验证码
	code := s.generateVerificationCode()

	// 4. 将验证码存入Redis，过期时间10分钟
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	if err := s.redisClient.Set(ctx, verifyKey, code, 10*time.Minute); err != nil {
		return NewAuthError(fmt.Errorf("%w: %v", ErrStorageFailed, err), ErrorCodeStorageFailed)
	}

	// 5. 设置限流键，过期时间60秒
	if err := s.redisClient.Set(ctx, lockKey, "1", 60*time.Second); err != nil {
		return NewAuthError(fmt.Errorf("%w: %v", ErrLockFailed, err), ErrorCodeLockFailed)
	}

	// 6. 发送验证码到邮箱（模拟）
	s.sendEmailMock(email, code)

	return nil
}

// VerifyCode 验证验证码
func (s *AuthService) VerifyCode(email, code string) error {
	ctx := context.Background()

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		return NewAuthError(err, ErrorCodeEmailInvalid)
	}

	// 2. 从Redis获取存储的验证码
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	storedCode, err := s.redisClient.Get(ctx, verifyKey)
	if err != nil {
		return NewAuthError(ErrCodeExpired, ErrorCodeExpired)
	}

	// 3. 验证验证码
	if storedCode != code {
		return NewAuthError(ErrCodeInvalid, ErrorCodeInvalid)
	}

	// 4. 验证成功后删除验证码
	if err := s.redisClient.Del(ctx, verifyKey); err != nil {
		// 记录日志但不返回错误，因为验证已经成功
		fmt.Printf("删除验证码失败: %v\n", err)
	}

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

	ttl, err := s.redisClient.TTL(ctx, verifyKey)
	if err != nil {
		return 0, NewAuthError(fmt.Errorf("%w: %v", ErrTTLFailed, err), ErrorCodeTTLFailed)
	}

	return ttl, nil
}

// GetLockTTL 获取限流剩余时间
func (s *AuthService) GetLockTTL(email string) (time.Duration, error) {
	ctx := context.Background()
	lockKey := fmt.Sprintf("email:lock:%s", email)

	ttl, err := s.redisClient.TTL(ctx, lockKey)
	if err != nil {
		return 0, NewAuthError(fmt.Errorf("%w: %v", ErrLockTTLFailed, err), ErrorCodeLockTTLFailed)
	}

	return ttl, nil
}
