package utils

import (
	"bondly-api/internal/pkg/response"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New(response.MsgInvalidToken)
	ErrExpiredToken = errors.New(response.MsgExpiredToken)
)

// JWTClaims JWT声明结构
type JWTClaims struct {
	UserID        int64  `json:"user_id"`
	Email         string `json:"email"`
	Role          string `json:"role"`
	WalletAddress string `json:"wallet_address"`
	jwt.RegisteredClaims
}

// JWTConfig JWT配置
type JWTConfig struct {
	SecretKey string        `json:"secret_key"`
	ExpiresIn time.Duration `json:"expires_in"`
}

// JWTUtil JWT工具
type JWTUtil struct {
	config JWTConfig
}

// NewJWTUtil 创建JWT工具实例
func NewJWTUtil(secretKey string, expiresIn time.Duration) *JWTUtil {
	return &JWTUtil{
		config: JWTConfig{
			SecretKey: secretKey,
			ExpiresIn: expiresIn,
		},
	}
}

// GenerateToken 生成JWT token
func (j *JWTUtil) GenerateToken(userID int64, email, role, walletAddress string) (string, error) {
	now := time.Now()
	claims := JWTClaims{
		UserID:        userID,
		Email:         email,
		Role:          role,
		WalletAddress: walletAddress,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(j.config.ExpiresIn)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "bondly-api",
			Subject:   "user-auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.config.SecretKey))
}

// ValidateToken 验证JWT token
func (j *JWTUtil) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(j.config.SecretKey), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

// RefreshToken 刷新token
func (j *JWTUtil) RefreshToken(tokenString string) (string, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// 生成新的token
	return j.GenerateToken(claims.UserID, claims.Email, claims.Role, claims.WalletAddress)
}

// 全局JWT工具实例
var jwtUtil *JWTUtil

// InitJWTUtil 初始化全局JWT工具
func InitJWTUtil(secretKey string, expiresIn time.Duration) {
	jwtUtil = NewJWTUtil(secretKey, expiresIn)
}

// ValidateJWT 全局JWT验证函数
func ValidateJWT(tokenString string) (*JWTClaims, error) {
	if jwtUtil == nil {
		return nil, errors.New("JWT util not initialized")
	}
	return jwtUtil.ValidateToken(tokenString)
}

// GenerateJWT 全局JWT生成函数
func GenerateJWT(userID int64, email, role, walletAddress string) (string, error) {
	if jwtUtil == nil {
		return "", errors.New("JWT util not initialized")
	}
	return jwtUtil.GenerateToken(userID, email, role, walletAddress)
}
