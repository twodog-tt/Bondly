package services

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/errors"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/redis"
	"bondly-api/internal/repositories"
	"bondly-api/internal/utils"
	"context"
	stderrors "errors"
	"fmt"
	"math/rand"
	"net/mail"
	"strconv"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// 自定义错误类型 - 使用统一错误码
var (
	ErrEmailInvalid    = NewAuthError(stderrors.New(response.MsgEmailInvalid), response.CodeEmailInvalid)
	ErrEmailEmpty      = NewAuthError(stderrors.New(response.MsgEmailEmpty), response.CodeEmailEmpty)
	ErrRateLimited     = NewAuthError(stderrors.New(response.MsgRateLimited), response.CodeRateLimited)
	ErrCodeExpired     = NewAuthError(stderrors.New(response.MsgExpired), response.CodeExpired)
	ErrCodeInvalid     = NewAuthError(stderrors.New(response.MsgInvalid), response.CodeInvalid)
	ErrStorageFailed   = NewAuthError(stderrors.New(response.MsgStorageFailed), response.CodeStorageFailed)
	ErrLockFailed      = NewAuthError(stderrors.New(response.MsgLockFailed), response.CodeLockFailed)
	ErrLockCheckFailed = NewAuthError(stderrors.New(response.MsgLockCheckFailed), response.CodeLockCheckFailed)
	ErrTTLFailed       = NewAuthError(stderrors.New(response.MsgTTLFailed), response.CodeTTLFailed)
	ErrLockTTLFailed   = NewAuthError(stderrors.New(response.MsgLockTTLFailed), response.CodeLockTTLFailed)
)

// 错误包装器，用于携带额外信息
type AuthError struct {
	Err  error
	Code int // 业务错误码
}

func (e *AuthError) Error() string {
	return e.Err.Error()
}

func (e *AuthError) Unwrap() error {
	return e.Err
}

// 创建带错误码的认证错误
func NewAuthError(err error, code int) *AuthError {
	return &AuthError{
		Err:  err,
		Code: code,
	}
}

// 注意：错误码和错误消息已统一在 response/error_code.go 中管理

type AuthService struct {
	redisClient *redis.RedisClient
	userRepo    *repositories.UserRepository
	jwtUtil     *utils.JWTUtil
}

func NewAuthService(redisClient *redis.RedisClient, userRepo *repositories.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		redisClient: redisClient,
		userRepo:    userRepo,
		jwtUtil:     utils.NewJWTUtil(jwtSecret, 24*time.Hour), // JWT token有效期24小时
	}
}

// SendVerificationCode 发送验证码
func (s *AuthService) SendVerificationCode(ctx context.Context, email string) error {
	log := loggerpkg.FromContext(ctx)

	log.WithFields(logrus.Fields{
		"email":  email,
		"action": "send_verification_code",
	}).Info("开始发送验证码")

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		log.WithFields(logrus.Fields{
			"email": email,
			"error": err.Error(),
		}).Warn("邮箱格式验证失败")
		return errors.NewEmailInvalidError(err)
	}

	log.WithField("email", email).Debug("邮箱格式验证通过")

	// 2. 检查是否在限流期内
	lockKey := fmt.Sprintf("email:lock:%s", email)
	exists, err := s.redisClient.Exists(ctx, lockKey)
	if err != nil {
		log.WithFields(logrus.Fields{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("检查限流状态失败")
		return errors.NewLockCheckFailedError(fmt.Errorf("%w: %v", ErrLockCheckFailed, err))
	}

	if exists > 0 {
		log.WithFields(logrus.Fields{
			"email":   email,
			"lockKey": lockKey,
		}).Warn("验证码发送过于频繁，触发限流")
		return errors.NewRateLimitedError()
	}

	log.WithField("email", email).Debug("限流检查通过")

	// 3. 生成6位数字验证码
	code := s.generateVerificationCode()
	log.WithFields(logrus.Fields{
		"email": email,
		"code":  code,
	}).Debug("生成验证码成功")

	// 4. 将验证码存入Redis，过期时间10分钟
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	if err := s.redisClient.Set(ctx, verifyKey, code, 10*time.Minute); err != nil {
		log.WithFields(logrus.Fields{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("存储验证码到Redis失败")
		return errors.NewStorageFailedError(fmt.Errorf("%w: %v", ErrStorageFailed, err))
	}

	log.WithFields(logrus.Fields{
		"email":      email,
		"verifyKey":  verifyKey,
		"expiration": "10分钟",
	}).Debug("验证码存储到Redis成功")

	// 5. 设置限流键，过期时间60秒
	if err := s.redisClient.Set(ctx, lockKey, "1", 60*time.Second); err != nil {
		log.WithFields(logrus.Fields{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("设置限流键失败")
		return errors.NewLockFailedError(fmt.Errorf("%w: %v", ErrLockFailed, err))
	}

	log.WithFields(logrus.Fields{
		"email":        email,
		"lockKey":      lockKey,
		"lockDuration": "60秒",
	}).Debug("限流键设置成功")

	// 6. 发送验证码到邮箱（模拟）
	s.sendEmailMock(email, code)

	log.WithFields(logrus.Fields{
		"email": email,
		"code":  code,
	}).Info("验证码发送成功")

	return nil
}

// CheckFirstLogin 判断用户是否是第一次登陆
// @return string Jwt Token
func (s *AuthService) CheckFirstLogin(ctx context.Context, email string) (string, error) {
	log := loggerpkg.FromContext(ctx)

	log.WithFields(logrus.Fields{
		"email":  email,
		"action": "check-login",
	}).Info("判断用户是否是第一次登陆")

	// 检查用户是否存在
	user, err := s.userRepo.GetByEmail(email)
	if err != nil && !stderrors.Is(err, gorm.ErrRecordNotFound) {
		log.WithFields(logrus.Fields{
			"email": email,
			"error": err.Error(),
		}).Error("查询用户信息失败")
		return "", err
	}
	if user == nil {
		return "", nil
	}
	if user.ID != 0 {
		log.WithFields(logrus.Fields{
			"email": email,
		}).Info("用户已存在，返回Jwt-Token")
		// 生成JWT Token
		token, err := s.jwtUtil.GenerateToken(user.ID, email, user.Role)
		if err != nil {
			log.WithFields(logrus.Fields{
				"userID": user.ID,
				"email":  email,
				"error":  err.Error(),
			}).Error("生成JWT Token失败")
			return "", err
		}
		return token, nil
	}
	return "", nil
}

// LoginIn 登录 - 使用统一的错误码管理
func (s *AuthService) LoginIn(ctx context.Context, email, nickname string, imageURL *string) (*dto.LoginResponse, error) {
	log := loggerpkg.FromContext(ctx)

	log.WithFields(logrus.Fields{
		"email":     email,
		"nickname":  nickname,
		"image_url": imageURL,
		"action":    "login",
	}).Info("开始处理用户登录")

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		log.WithFields(logrus.Fields{
			"email": email,
			"error": err.Error(),
		}).Warn("登录时邮箱格式验证失败")
		return nil, errors.NewEmailInvalidError(err)
	}

	// 2. 检查用户是否存在
	user, err := s.userRepo.GetByEmail(email)
	var isNewUser bool

	if err != nil {
		if stderrors.Is(err, gorm.ErrRecordNotFound) {
			// 用户不存在，创建新用户
			log.WithFields(logrus.Fields{
				"email":    email,
				"nickname": nickname,
			}).Info("用户不存在，开始创建新用户")

			user = &models.User{
				Email:     &email,
				Nickname:  nickname,
				AvatarURL: imageURL,
				Role:      "user", // 默认角色
			}

			if err := s.userRepo.Create(user); err != nil {
				log.WithFields(logrus.Fields{
					"email":    email,
					"nickname": nickname,
					"error":    err.Error(),
				}).Error("创建新用户失败")
				return nil, errors.NewUserCreateFailedError(err)
			}

			isNewUser = true
			log.WithFields(logrus.Fields{
				"userID":   user.ID,
				"email":    email,
				"nickname": nickname,
			}).Info("新用户创建成功")
		} else {
			log.WithFields(logrus.Fields{
				"email": email,
				"error": err.Error(),
			}).Error("查询用户失败")
			return nil, errors.NewInternalError(err)
		}
	} else {
		// 用户存在，更新昵称和头像（如果不同）以及最后登录时间
		needsUpdate := false

		if user.Nickname != nickname {
			user.Nickname = nickname
			needsUpdate = true
		}

		// 如果提供了新的头像URL，则更新头像
		if imageURL != nil && (user.AvatarURL == nil || *user.AvatarURL != *imageURL) {
			user.AvatarURL = imageURL
			needsUpdate = true
		}

		if needsUpdate {
			if err := s.userRepo.Update(user); err != nil {
				log.WithFields(logrus.Fields{
					"userID":   user.ID,
					"email":    email,
					"nickname": nickname,
					"error":    err.Error(),
				}).Error("更新用户信息失败")
				return nil, errors.NewUserUpdateFailedError(err)
			}
		}

		// 更新最后登录时间
		if err := s.userRepo.UpdateLastLogin(user.ID); err != nil {
			log.WithFields(logrus.Fields{
				"userID": user.ID,
				"email":  email,
				"error":  err.Error(),
			}).Error("更新最后登录时间失败")
			return nil, errors.NewUserUpdateFailedError(err)
		}

		isNewUser = false
		log.WithFields(logrus.Fields{
			"userID":   user.ID,
			"email":    email,
			"nickname": nickname,
		}).Info("现有用户登录成功")
	}

	// 3. 生成JWT Token
	token, err := s.jwtUtil.GenerateToken(user.ID, email, user.Role)
	if err != nil {
		log.WithFields(logrus.Fields{
			"userID": user.ID,
			"email":  email,
			"error":  err.Error(),
		}).Error("生成JWT Token失败")
		return nil, errors.NewInternalError(err)
	}

	log.WithFields(logrus.Fields{
		"userID":    user.ID,
		"email":     email,
		"nickname":  nickname,
		"isNewUser": isNewUser,
	}).Info("用户登录处理完成")

	// 4. 返回登录响应
	return &dto.LoginResponse{
		Token:     token,
		UserID:    user.ID,
		Email:     email,
		Nickname:  user.Nickname,
		Role:      user.Role,
		IsNewUser: isNewUser,
		ExpiresIn: "24小时",
	}, nil
}

// VerifyCode 验证验证码
func (s *AuthService) VerifyCode(ctx context.Context, email, code string) error {
	log := loggerpkg.FromContext(ctx)

	log.WithFields(logrus.Fields{
		"email":  email,
		"code":   code,
		"action": "verify_code",
	}).Info("开始验证验证码")

	// 1. 校验邮箱格式
	if err := s.validateEmail(email); err != nil {
		log.WithFields(logrus.Fields{
			"email": email,
			"error": err.Error(),
		}).Warn("验证码验证时邮箱格式检查失败")
		return errors.NewEmailInvalidError(err)
	}

	log.WithField("email", email).Debug("验证码验证时邮箱格式检查通过")

	// 2. 从Redis获取验证码
	verifyKey := fmt.Sprintf("email:verify:%s", email)
	storedCode, err := s.redisClient.Get(ctx, verifyKey)
	if err != nil {
		// 检查是否是键不存在的错误（验证码过期或从未发送）
		if err.Error() == "key does not exist" {
			log.WithFields(logrus.Fields{
				"email":     email,
				"verifyKey": verifyKey,
			}).Warn("验证码不存在或已过期")
			return errors.NewCodeExpiredError()
		}
		// 其他错误（Redis连接问题等）返回存储失败错误
		log.WithFields(logrus.Fields{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("从Redis获取验证码失败")
		return errors.NewStorageFailedError(fmt.Errorf("%w: %v", ErrStorageFailed, err))
	}

	log.WithFields(logrus.Fields{
		"email":      email,
		"verifyKey":  verifyKey,
		"storedCode": storedCode,
	}).Debug("从Redis获取验证码成功")

	// 3. 验证验证码
	if storedCode != code {
		log.WithFields(logrus.Fields{
			"email":        email,
			"providedCode": code,
			"storedCode":   storedCode,
		}).Warn("验证码不匹配")
		return errors.NewCodeInvalidError()
	}

	log.WithField("email", email).Debug("验证码匹配成功")

	// 4. 验证成功后删除验证码
	if err := s.redisClient.Del(ctx, verifyKey); err != nil {
		// 记录日志但不返回错误，因为验证已经成功
		log.WithFields(logrus.Fields{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("验证成功后删除验证码失败")
	} else {
		log.WithFields(logrus.Fields{
			"email":     email,
			"verifyKey": verifyKey,
		}).Debug("验证成功后删除验证码成功")
	}

	log.WithFields(logrus.Fields{
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
func (s *AuthService) GetCodeTTL(ctx context.Context, email string) (time.Duration, error) {
	log := loggerpkg.FromContext(ctx)

	verifyKey := fmt.Sprintf("email:verify:%s", email)

	log.WithFields(logrus.Fields{
		"email":     email,
		"verifyKey": verifyKey,
	}).Debug("获取验证码剩余时间")

	ttl, err := s.redisClient.TTL(ctx, verifyKey)
	if err != nil {
		log.WithFields(logrus.Fields{
			"email":     email,
			"verifyKey": verifyKey,
			"error":     err.Error(),
		}).Error("获取验证码TTL失败")
		return 0, errors.NewTTLFailedError(fmt.Errorf("%w: %v", ErrTTLFailed, err))
	}

	log.WithFields(logrus.Fields{
		"email":     email,
		"verifyKey": verifyKey,
		"ttl":       ttl.String(),
	}).Debug("获取验证码TTL成功")

	return ttl, nil
}

// GetLockTTL 获取限流剩余时间
func (s *AuthService) GetLockTTL(ctx context.Context, email string) (time.Duration, error) {
	log := loggerpkg.FromContext(ctx)

	lockKey := fmt.Sprintf("email:lock:%s", email)

	log.WithFields(logrus.Fields{
		"email":   email,
		"lockKey": lockKey,
	}).Debug("获取限流剩余时间")

	ttl, err := s.redisClient.TTL(ctx, lockKey)
	if err != nil {
		log.WithFields(logrus.Fields{
			"email":   email,
			"lockKey": lockKey,
			"error":   err.Error(),
		}).Error("获取限流TTL失败")
		return 0, errors.NewLockTTLFailedError(fmt.Errorf("%w: %v", ErrLockTTLFailed, err))
	}

	log.WithFields(logrus.Fields{
		"email":   email,
		"lockKey": lockKey,
		"ttl":     ttl.String(),
	}).Debug("获取限流TTL成功")

	return ttl, nil
}
