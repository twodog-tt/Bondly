package errors

import (
	"bondly-api/internal/pkg/response"
)

// UploadError 上传错误
type UploadError struct {
	*BaseError
}

// NewUploadError 创建上传错误
func NewUploadError(err error, code int) *UploadError {
	return &UploadError{
		BaseError: WrapError(err, code, response.GetMessage(code)),
	}
}

// NewUploadErrorWithMessage 创建带自定义消息的上传错误
func NewUploadErrorWithMessage(err error, code int, message string) *UploadError {
	return &UploadError{
		BaseError: WrapError(err, code, message),
	}
}

// 上传相关的便捷错误创建函数
func NewFileTooLargeError() *UploadError {
	return NewUploadError(nil, response.CodeFileTooLarge)
}

func NewInvalidFileTypeError() *UploadError {
	return NewUploadError(nil, response.CodeInvalidFileType)
}

func NewNoFileUploadedError() *UploadError {
	return NewUploadError(nil, response.CodeNoFileUploaded)
}

func NewCreateDirectoryError(err error) *UploadError {
	return NewUploadError(err, response.CodeCreateDirectory)
}

func NewSaveFileError(err error) *UploadError {
	return NewUploadError(err, response.CodeSaveFile)
}
