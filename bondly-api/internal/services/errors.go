package services

import "bondly-api/internal/pkg/response"

// 错误码常量 - 使用统一的错误码定义
const (
	// 邮箱相关错误
	ErrorCodeEmailInvalid = response.CodeEmailInvalid
	ErrorCodeEmailEmpty   = response.CodeEmailEmpty

	// 验证码相关错误
	ErrorCodeRateLimited = response.CodeRateLimited
	ErrorCodeExpired     = response.CodeExpired
	ErrorCodeInvalid     = response.CodeInvalid

	// 存储相关错误
	ErrorCodeStorageFailed   = response.CodeStorageFailed
	ErrorCodeLockFailed      = response.CodeLockFailed
	ErrorCodeLockCheckFailed = response.CodeLockCheckFailed
	ErrorCodeTTLFailed       = response.CodeTTLFailed
	ErrorCodeLockTTLFailed   = response.CodeLockTTLFailed

	// 用户相关错误
	ErrorCodeUserAddressEmpty  = response.CodeUserAddressEmpty
	ErrorCodeUserIDEmpty       = response.CodeUserIDEmpty
	ErrorCodeUserAlreadyExists = response.CodeUserAlreadyExists
	ErrorCodeUserNotFound      = response.CodeUserNotFound
	ErrorCodeUserUpdateFailed  = response.CodeUserUpdateFailed
	ErrorCodeUserCreateFailed  = response.CodeUserCreateFailed
	ErrorCodeCacheFailed       = response.CodeCacheFailed
)

// 错误码映射表，用于错误码到HTTP状态码的映射
var ErrorCodeToHTTPStatus = map[string]int{
	"EMAIL_INVALID":       response.GetHTTPStatus(response.CodeEmailInvalid),
	"EMAIL_EMPTY":         response.GetHTTPStatus(response.CodeEmailEmpty),
	"RATE_LIMITED":        response.GetHTTPStatus(response.CodeRateLimited),
	"CODE_EXPIRED":        response.GetHTTPStatus(response.CodeExpired),
	"CODE_INVALID":        response.GetHTTPStatus(response.CodeInvalid),
	"STORAGE_FAILED":      response.GetHTTPStatus(response.CodeStorageFailed),
	"LOCK_FAILED":         response.GetHTTPStatus(response.CodeLockFailed),
	"LOCK_CHECK_FAILED":   response.GetHTTPStatus(response.CodeLockCheckFailed),
	"TTL_FAILED":          response.GetHTTPStatus(response.CodeTTLFailed),
	"LOCK_TTL_FAILED":     response.GetHTTPStatus(response.CodeLockTTLFailed),
	"USER_ADDRESS_EMPTY":  response.GetHTTPStatus(response.CodeUserAddressEmpty),
	"USER_ID_EMPTY":       response.GetHTTPStatus(response.CodeUserIDEmpty),
	"USER_ALREADY_EXISTS": response.GetHTTPStatus(response.CodeUserAlreadyExists),
	"USER_NOT_FOUND":      response.GetHTTPStatus(response.CodeUserNotFound),
	"USER_UPDATE_FAILED":  response.GetHTTPStatus(response.CodeUserUpdateFailed),
	"USER_CREATE_FAILED":  response.GetHTTPStatus(response.CodeUserCreateFailed),
	"CACHE_FAILED":        response.GetHTTPStatus(response.CodeCacheFailed),
}

// 错误码到业务状态码的映射
var ErrorCodeToBusinessCode = map[string]string{
	"EMAIL_INVALID":       "INVALID_PARAMS",
	"EMAIL_EMPTY":         "INVALID_PARAMS",
	"RATE_LIMITED":        "RATE_LIMITED",
	"CODE_EXPIRED":        "VERIFICATION_ERROR",
	"CODE_INVALID":        "VERIFICATION_ERROR",
	"STORAGE_FAILED":      "INTERNAL_ERROR",
	"LOCK_FAILED":         "INTERNAL_ERROR",
	"LOCK_CHECK_FAILED":   "INTERNAL_ERROR",
	"TTL_FAILED":          "INTERNAL_ERROR",
	"LOCK_TTL_FAILED":     "INTERNAL_ERROR",
	"USER_ADDRESS_EMPTY":  "INVALID_PARAMS",
	"USER_ID_EMPTY":       "INVALID_PARAMS",
	"USER_ALREADY_EXISTS": "USER_EXISTS",
	"USER_NOT_FOUND":      "USER_NOT_FOUND",
	"USER_UPDATE_FAILED":  "INTERNAL_ERROR",
	"USER_CREATE_FAILED":  "INTERNAL_ERROR",
	"CACHE_FAILED":        "INTERNAL_ERROR",
}
