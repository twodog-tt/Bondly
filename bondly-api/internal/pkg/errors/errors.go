package errors

import (
	"bondly-api/internal/pkg/response"
	"fmt"
)

// BusinessError 业务错误接口
type BusinessError interface {
	Error() string
	Code() int
	Message() string
	Unwrap() error
}

// BaseError 基础错误结构
type BaseError struct {
	Err     error  `json:"-"`
	ErrCode int    `json:"code"`
	ErrMsg  string `json:"message"`
}

func (e *BaseError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.ErrMsg, e.Err)
	}
	return e.ErrMsg
}

func (e *BaseError) Code() int {
	return e.ErrCode
}

func (e *BaseError) Message() string {
	return e.ErrMsg
}

func (e *BaseError) Unwrap() error {
	return e.Err
}

// NewError 创建新的基础错误
func NewError(code int, message string) *BaseError {
	return &BaseError{
		ErrCode: code,
		ErrMsg:  message,
	}
}

// WrapError 包装现有错误
func WrapError(err error, code int, message string) *BaseError {
	return &BaseError{
		Err:     err,
		ErrCode: code,
		ErrMsg:  message,
	}
}

// NewInternalError 创建内部错误
func NewInternalError(err error) *BaseError {
	return WrapError(err, response.CodeInternalError, response.MsgInternalError)
}

// NewInvalidParamsError 创建参数错误
func NewInvalidParamsError(message string) *BaseError {
	return NewError(response.CodeInvalidParams, message)
}

// NewUnauthorizedError 创建未授权错误
func NewUnauthorizedError(message string) *BaseError {
	return NewError(response.CodeUnauthorized, message)
}

// NewNotFoundError 创建未找到错误
func NewNotFoundError(message string) *BaseError {
	return NewError(response.CodeNotFound, message)
}

// IsBusinessError 检查是否为业务错误
func IsBusinessError(err error) bool {
	_, ok := err.(BusinessError)
	return ok
}

// GetErrorCode 获取错误码
func GetErrorCode(err error) int {
	if businessErr, ok := err.(BusinessError); ok {
		return businessErr.Code()
	}
	return response.CodeInternalError
}

// GetErrorMessage 获取错误消息
func GetErrorMessage(err error) string {
	if businessErr, ok := err.(BusinessError); ok {
		return businessErr.Message()
	}
	return err.Error()
}
