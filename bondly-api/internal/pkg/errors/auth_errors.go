package errors

import (
	"bondly-api/internal/pkg/response"
)

// AuthError 认证错误
type AuthError struct {
	*BaseError
}

// NewAuthError 创建认证错误
func NewAuthError(err error, code int) *AuthError {
	return &AuthError{
		BaseError: WrapError(err, code, response.GetMessage(code)),
	}
}

// NewAuthErrorWithMessage 创建带自定义消息的认证错误
func NewAuthErrorWithMessage(err error, code int, message string) *AuthError {
	return &AuthError{
		BaseError: WrapError(err, code, message),
	}
}

// 认证相关的便捷错误创建函数
func NewEmailInvalidError(err error) *AuthError {
	return NewAuthError(err, response.CodeEmailInvalid)
}

func NewEmailEmptyError() *AuthError {
	return NewAuthError(nil, response.CodeEmailEmpty)
}

func NewRateLimitedError() *AuthError {
	return NewAuthError(nil, response.CodeRateLimited)
}

func NewCodeExpiredError() *AuthError {
	return NewAuthError(nil, response.CodeExpired)
}

func NewCodeInvalidError() *AuthError {
	return NewAuthError(nil, response.CodeInvalid)
}

func NewStorageFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeStorageFailed)
}

func NewLockFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeLockFailed)
}

func NewLockCheckFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeLockCheckFailed)
}

func NewTTLFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeTTLFailed)
}

func NewLockTTLFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeLockTTLFailed)
}

func NewUserCreateFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeUserCreateFailed)
}

func NewUserUpdateFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeUserUpdateFailed)
}

func NewUserNotFoundError() *AuthError {
	return NewAuthError(nil, response.CodeUserNotFound)
}

func NewUserAlreadyExistsError() *AuthError {
	return NewAuthError(nil, response.CodeUserAlreadyExists)
}

func NewCacheFailedError(err error) *AuthError {
	return NewAuthError(err, response.CodeCacheFailed)
}

// 托管钱包相关错误函数
func NewCustodyWalletEmptyError() *AuthError {
	return NewAuthError(nil, response.CodeCustodyWalletEmpty)
}

func NewCustodyWalletInvalidError(err error) *AuthError {
	return NewAuthError(err, response.CodeCustodyWalletInvalid)
}

func NewPrivateKeyEmptyError() *AuthError {
	return NewAuthError(nil, response.CodePrivateKeyEmpty)
}

func NewPrivateKeyInvalidError(err error) *AuthError {
	return NewAuthError(err, response.CodePrivateKeyInvalid)
}
