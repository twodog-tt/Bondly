package errors

import (
	"bondly-api/internal/pkg/response"
)

// UserError 用户错误
type UserError struct {
	*BaseError
}

// NewUserError 创建用户错误
func NewUserError(err error, code int) *UserError {
	return &UserError{
		BaseError: WrapError(err, code, response.GetMessage(code)),
	}
}

// NewUserErrorWithMessage 创建带自定义消息的用户错误
func NewUserErrorWithMessage(err error, code int, message string) *UserError {
	return &UserError{
		BaseError: WrapError(err, code, message),
	}
}

// 用户相关的便捷错误创建函数
func NewUserAddressEmptyError() *UserError {
	return NewUserError(nil, response.CodeUserAddressEmpty)
}

func NewUserIDEmptyError() *UserError {
	return NewUserError(nil, response.CodeUserIDEmpty)
}

// 注意：用户相关的错误函数已在 auth_errors.go 中定义，这里不再重复定义
