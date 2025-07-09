package pkg

import (
	"errors"
	"fmt"
)

// ErrorCode 错误码类型
type ErrorCode string

// Error 自定义错误结构
type Error struct {
	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
	Err     error     `json:"-"`
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *Error) Unwrap() error {
	return e.Err
}

// NewError 创建新的错误
func NewError(code ErrorCode, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

// WrapError 包装现有错误
func WrapError(err error, code ErrorCode, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// IsErrorCode 检查错误是否为指定错误码
func IsErrorCode(err error, code ErrorCode) bool {
	var customErr *Error
	if errors.As(err, &customErr) {
		return customErr.Code == code
	}
	return false
}

// GetErrorCode 获取错误码
func GetErrorCode(err error) ErrorCode {
	var customErr *Error
	if errors.As(err, &customErr) {
		return customErr.Code
	}
	return ""
}

// GetErrorMessage 获取错误消息
func GetErrorMessage(err error) string {
	var customErr *Error
	if errors.As(err, &customErr) {
		return customErr.Message
	}
	return err.Error()
}
