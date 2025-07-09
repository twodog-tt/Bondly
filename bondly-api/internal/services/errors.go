package services

// 错误码常量
const (
	// 邮箱相关错误
	ErrorCodeEmailInvalid = "EMAIL_INVALID"
	ErrorCodeEmailEmpty   = "EMAIL_EMPTY"

	// 验证码相关错误
	ErrorCodeRateLimited = "RATE_LIMITED"
	ErrorCodeExpired     = "CODE_EXPIRED"
	ErrorCodeInvalid     = "CODE_INVALID"

	// 存储相关错误
	ErrorCodeStorageFailed   = "STORAGE_FAILED"
	ErrorCodeLockFailed      = "LOCK_FAILED"
	ErrorCodeLockCheckFailed = "LOCK_CHECK_FAILED"
	ErrorCodeTTLFailed       = "TTL_FAILED"
	ErrorCodeLockTTLFailed   = "LOCK_TTL_FAILED"

	// 用户相关错误
	ErrorCodeUserAddressEmpty  = "USER_ADDRESS_EMPTY"
	ErrorCodeUserIDEmpty       = "USER_ID_EMPTY"
	ErrorCodeUserAlreadyExists = "USER_ALREADY_EXISTS"
	ErrorCodeUserNotFound      = "USER_NOT_FOUND"
	ErrorCodeUserUpdateFailed  = "USER_UPDATE_FAILED"
	ErrorCodeUserCreateFailed  = "USER_CREATE_FAILED"
	ErrorCodeCacheFailed       = "CACHE_FAILED"
)

// 错误码映射表，用于错误码到HTTP状态码的映射
var ErrorCodeToHTTPStatus = map[string]int{
	ErrorCodeEmailInvalid:      400, // Bad Request
	ErrorCodeEmailEmpty:        400, // Bad Request
	ErrorCodeRateLimited:       429, // Too Many Requests
	ErrorCodeExpired:           400, // Bad Request
	ErrorCodeInvalid:           400, // Bad Request
	ErrorCodeStorageFailed:     500, // Internal Server Error
	ErrorCodeLockFailed:        500, // Internal Server Error
	ErrorCodeLockCheckFailed:   500, // Internal Server Error
	ErrorCodeTTLFailed:         500, // Internal Server Error
	ErrorCodeLockTTLFailed:     500, // Internal Server Error
	ErrorCodeUserAddressEmpty:  400, // Bad Request
	ErrorCodeUserIDEmpty:       400, // Bad Request
	ErrorCodeUserAlreadyExists: 409, // Conflict
	ErrorCodeUserNotFound:      404, // Not Found
	ErrorCodeUserUpdateFailed:  500, // Internal Server Error
	ErrorCodeUserCreateFailed:  500, // Internal Server Error
	ErrorCodeCacheFailed:       500, // Internal Server Error
}

// 错误码到业务状态码的映射
var ErrorCodeToBusinessCode = map[string]string{
	ErrorCodeEmailInvalid:      "INVALID_PARAMS",
	ErrorCodeEmailEmpty:        "INVALID_PARAMS",
	ErrorCodeRateLimited:       "RATE_LIMITED",
	ErrorCodeExpired:           "VERIFICATION_ERROR",
	ErrorCodeInvalid:           "VERIFICATION_ERROR",
	ErrorCodeStorageFailed:     "INTERNAL_ERROR",
	ErrorCodeLockFailed:        "INTERNAL_ERROR",
	ErrorCodeLockCheckFailed:   "INTERNAL_ERROR",
	ErrorCodeTTLFailed:         "INTERNAL_ERROR",
	ErrorCodeLockTTLFailed:     "INTERNAL_ERROR",
	ErrorCodeUserAddressEmpty:  "INVALID_PARAMS",
	ErrorCodeUserIDEmpty:       "INVALID_PARAMS",
	ErrorCodeUserAlreadyExists: "USER_EXISTS",
	ErrorCodeUserNotFound:      "USER_NOT_FOUND",
	ErrorCodeUserUpdateFailed:  "INTERNAL_ERROR",
	ErrorCodeUserCreateFailed:  "INTERNAL_ERROR",
	ErrorCodeCacheFailed:       "INTERNAL_ERROR",
}
