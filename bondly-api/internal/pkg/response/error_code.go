package response

// CodeSuccess 成功码
const (
	CodeSuccess = 1000
)

// 通用错误码 (1400-1499)
const (
	CodeInvalidParams = 1400
	CodeUnauthorized  = 1401
	CodeForbidden     = 1403
	CodeNotFound      = 1404
	CodeInternalError = 1500
	CodeUnknownError  = 1501
)

// 业务相关错误码 (1600-1699)
const (
	CodeVerificationError  = 1601
	CodeEmailExists        = 1602
	CodeRequestFormatError = 1603
	CodeEmailParamEmpty    = 1604
)

// 用户相关错误码 (1700-1799)
const (
	CodeUserAddressEmpty     = 1700
	CodeUserIDEmpty          = 1701
	CodeUserAlreadyExists    = 1702
	CodeUserNotFound         = 1703
	CodeUserUpdateFailed     = 1704
	CodeUserCreateFailed     = 1705
	CodeCacheFailed          = 1706
	CodeUserIDInvalid        = 1707
	CodeWalletAddressEmpty   = 1708
	CodeEmailAddressEmpty    = 1709
	CodeGetUserListFailed    = 1710
	CodeGetRankingFailed     = 1711
	CodeCustodyWalletEmpty   = 1712
	CodeCustodyWalletInvalid = 1713
	CodePrivateKeyEmpty      = 1714
	CodePrivateKeyInvalid    = 1715
)

// 验证码相关错误码 (1800-1899)
const (
	CodeEmailInvalid = 1800
	CodeEmailEmpty   = 1801
	CodeRateLimited  = 1802
	CodeExpired      = 1803
	CodeInvalid      = 1804
)

// 存储相关错误码 (1900-1999)
const (
	CodeStorageFailed   = 1900
	CodeLockFailed      = 1901
	CodeLockCheckFailed = 1902
	CodeTTLFailed       = 1903
	CodeLockTTLFailed   = 1904
)

// 文件上传相关错误码 (2000-2099)
const (
	CodeFileTooLarge     = 2000
	CodeInvalidFileType  = 2001
	CodeNoFileUploaded   = 2002
	CodeCreateDirectory  = 2003
	CodeSaveFile         = 2004
	CodeFileUploadFailed = 2005
	CodeNoFileSelected   = 2006
)

// ErrorCodeToHTTPStatus 错误码到HTTP状态码的映射
var ErrorCodeToHTTPStatus = map[int]int{
	// 通用错误码
	CodeInvalidParams: 400, // Bad Request
	CodeUnauthorized:  401, // Unauthorized
	CodeForbidden:     403, // Forbidden
	CodeNotFound:      404, // Not Found
	CodeInternalError: 500, // Internal Server Error
	CodeUnknownError:  500, // Internal Server Error

	// 业务相关错误码
	CodeVerificationError:  400, // Bad Request
	CodeEmailExists:        409, // Conflict
	CodeRequestFormatError: 400, // Bad Request
	CodeEmailParamEmpty:    400, // Bad Request

	// 用户相关错误码
	CodeUserAddressEmpty:     400, // Bad Request
	CodeUserIDEmpty:          400, // Bad Request
	CodeUserAlreadyExists:    409, // Conflict
	CodeUserNotFound:         404, // Not Found
	CodeUserUpdateFailed:     500, // Internal Server Error
	CodeUserCreateFailed:     500, // Internal Server Error
	CodeCacheFailed:          500, // Internal Server Error
	CodeUserIDInvalid:        400, // Bad Request
	CodeWalletAddressEmpty:   400, // Bad Request
	CodeEmailAddressEmpty:    400, // Bad Request
	CodeGetUserListFailed:    500, // Internal Server Error
	CodeGetRankingFailed:     500, // Internal Server Error
	CodeCustodyWalletEmpty:   400, // Bad Request
	CodeCustodyWalletInvalid: 400, // Bad Request
	CodePrivateKeyEmpty:      400, // Bad Request
	CodePrivateKeyInvalid:    400, // Bad Request

	// 验证码相关错误码
	CodeEmailInvalid: 400, // Bad Request
	CodeEmailEmpty:   400, // Bad Request
	CodeRateLimited:  429, // Too Many Requests
	CodeExpired:      400, // Bad Request
	CodeInvalid:      400, // Bad Request

	// 存储相关错误码
	CodeStorageFailed:   500, // Internal Server Error
	CodeLockFailed:      500, // Internal Server Error
	CodeLockCheckFailed: 500, // Internal Server Error
	CodeTTLFailed:       500, // Internal Server Error
	CodeLockTTLFailed:   500, // Internal Server Error

	// 文件上传相关错误码
	CodeFileTooLarge:     413, // Payload Too Large
	CodeInvalidFileType:  400, // Bad Request
	CodeNoFileUploaded:   400, // Bad Request
	CodeCreateDirectory:  500, // Internal Server Error
	CodeSaveFile:         500, // Internal Server Error
	CodeFileUploadFailed: 500, // Internal Server Error
	CodeNoFileSelected:   400, // Bad Request
}

// ErrorCodeToBusinessCode 错误码到业务错误码的映射（用于统一错误处理）
var ErrorCodeToBusinessCode = map[int]int{
	// 验证码相关错误码 -> 统一映射到业务错误码
	CodeEmailInvalid: CodeInvalidParams,     // 邮箱格式错误 -> 参数错误
	CodeEmailEmpty:   CodeInvalidParams,     // 邮箱为空 -> 参数错误
	CodeRateLimited:  CodeInvalidParams,     // 限流 -> 参数错误
	CodeExpired:      CodeVerificationError, // 过期 -> 验证码错误
	CodeInvalid:      CodeVerificationError, // 无效 -> 验证码错误

	// 存储相关错误码 -> 统一映射到内部错误
	CodeStorageFailed:   CodeInternalError,
	CodeLockFailed:      CodeInternalError,
	CodeLockCheckFailed: CodeInternalError,
	CodeTTLFailed:       CodeInternalError,
	CodeLockTTLFailed:   CodeInternalError,

	// 用户相关错误码 -> 保持原样
	CodeUserCreateFailed:     CodeUserCreateFailed,
	CodeUserNotFound:         CodeUserNotFound,
	CodeUserIDInvalid:        CodeInvalidParams,
	CodeWalletAddressEmpty:   CodeInvalidParams,
	CodeEmailAddressEmpty:    CodeInvalidParams,
	CodeGetUserListFailed:    CodeInternalError,
	CodeGetRankingFailed:     CodeInternalError,
	CodeCustodyWalletEmpty:   CodeInvalidParams,
	CodeCustodyWalletInvalid: CodeInvalidParams,
	CodePrivateKeyEmpty:      CodeInvalidParams,
	CodePrivateKeyInvalid:    CodeInvalidParams,

	// 文件上传相关错误码 -> 统一映射
	CodeFileTooLarge:     CodeInvalidParams,
	CodeInvalidFileType:  CodeInvalidParams,
	CodeNoFileSelected:   CodeInvalidParams,
	CodeCreateDirectory:  CodeInternalError,
	CodeSaveFile:         CodeInternalError,
	CodeFileUploadFailed: CodeInternalError,
}

// 错误消息常量
const (
	// 通用错误消息
	MsgInvalidParams = "请求参数错误"
	MsgUnauthorized  = "未授权访问"
	MsgForbidden     = "禁止访问"
	MsgNotFound      = "资源不存在"
	MsgInternalError = "服务器内部错误"
	MsgUnknownError  = "未知错误"

	// 业务相关错误消息
	MsgVerificationError  = "验证码错误"
	MsgEmailExists        = "邮箱已存在"
	MsgRequestFormatError = "请求参数格式错误"
	MsgEmailParamEmpty    = "邮箱参数不能为空"

	// 用户相关错误消息
	MsgUserAddressEmpty     = "用户地址不能为空"
	MsgUserIDEmpty          = "用户ID不能为空"
	MsgUserAlreadyExists    = "用户已存在"
	MsgUserNotFound         = "用户不存在"
	MsgUserUpdateFailed     = "用户更新失败"
	MsgUserCreateFailed     = "创建用户失败"
	MsgCacheFailed          = "缓存操作失败"
	MsgUserIDInvalid        = "用户ID格式错误"
	MsgWalletAddressEmpty   = "钱包地址不能为空"
	MsgEmailAddressEmpty    = "邮箱地址不能为空"
	MsgGetUserListFailed    = "获取用户列表失败"
	MsgGetRankingFailed     = "获取排行榜失败"
	MsgCustodyWalletEmpty   = "托管钱包地址不能为空"
	MsgCustodyWalletInvalid = "托管钱包地址格式错误"
	MsgPrivateKeyEmpty      = "私钥不能为空"
	MsgPrivateKeyInvalid    = "私钥格式错误"

	// 验证码相关错误消息
	MsgEmailInvalid = "邮箱格式不正确"
	MsgEmailEmpty   = "邮箱不能为空"
	MsgRateLimited  = "验证码发送过于频繁，请60秒后再试"
	MsgExpired      = "验证码已过期或不存在"
	MsgInvalid      = "验证码不正确"

	// 存储相关错误消息
	MsgStorageFailed   = "存储验证码失败"
	MsgLockFailed      = "设置限流失败"
	MsgLockCheckFailed = "检查限流状态失败"
	MsgTTLFailed       = "获取验证码过期时间失败"
	MsgLockTTLFailed   = "获取限流时间失败"

	// 文件上传相关错误消息
	MsgFileTooLarge     = "文件大小超过限制"
	MsgInvalidFileType  = "不支持的文件类型"
	MsgNoFileUploaded   = "未上传文件"
	MsgCreateDirectory  = "创建目录失败"
	MsgSaveFile         = "保存文件失败"
	MsgFileUploadFailed = "文件上传失败"
	MsgNoFileSelected   = "请选择要上传的文件"

	// 服务层错误消息
	MsgEmailCheckFailed  = "检查邮箱失败"
	MsgWalletCheckFailed = "检查钱包地址失败"
	MsgGetUserFailed     = "获取用户失败"

	// JWT相关错误消息
	MsgInvalidToken = "无效的token"
	MsgExpiredToken = "token已过期"
)

// GetHTTPStatus 根据错误码获取HTTP状态码
func GetHTTPStatus(code int) int {
	if status, exists := ErrorCodeToHTTPStatus[code]; exists {
		return status
	}
	return 500 // 默认返回500
}

// GetBusinessCode 根据错误码获取业务错误码
func GetBusinessCode(code int) int {
	if businessCode, exists := ErrorCodeToBusinessCode[code]; exists {
		return businessCode
	}
	return CodeInternalError
}

// GetMessage 根据错误码获取错误消息
func GetMessage(code int) string {
	switch code {
	// 通用错误码
	case CodeInvalidParams:
		return MsgInvalidParams
	case CodeUnauthorized:
		return MsgUnauthorized
	case CodeForbidden:
		return MsgForbidden
	case CodeNotFound:
		return MsgNotFound
	case CodeInternalError:
		return MsgInternalError
	case CodeUnknownError:
		return MsgUnknownError

	// 业务相关错误码
	case CodeVerificationError:
		return MsgVerificationError
	case CodeEmailExists:
		return MsgEmailExists
	case CodeRequestFormatError:
		return MsgRequestFormatError
	case CodeEmailParamEmpty:
		return MsgEmailParamEmpty

	// 用户相关错误码
	case CodeUserAddressEmpty:
		return MsgUserAddressEmpty
	case CodeUserIDEmpty:
		return MsgUserIDEmpty
	case CodeUserAlreadyExists:
		return MsgUserAlreadyExists
	case CodeUserNotFound:
		return MsgUserNotFound
	case CodeUserUpdateFailed:
		return MsgUserUpdateFailed
	case CodeUserCreateFailed:
		return MsgUserCreateFailed
	case CodeCacheFailed:
		return MsgCacheFailed
	case CodeUserIDInvalid:
		return MsgUserIDInvalid
	case CodeWalletAddressEmpty:
		return MsgWalletAddressEmpty
	case CodeEmailAddressEmpty:
		return MsgEmailAddressEmpty
	case CodeGetUserListFailed:
		return MsgGetUserListFailed
	case CodeGetRankingFailed:
		return MsgGetRankingFailed
	case CodeCustodyWalletEmpty:
		return MsgCustodyWalletEmpty
	case CodeCustodyWalletInvalid:
		return MsgCustodyWalletInvalid
	case CodePrivateKeyEmpty:
		return MsgPrivateKeyEmpty
	case CodePrivateKeyInvalid:
		return MsgPrivateKeyInvalid

	// 验证码相关错误码
	case CodeEmailInvalid:
		return MsgEmailInvalid
	case CodeEmailEmpty:
		return MsgEmailEmpty
	case CodeRateLimited:
		return MsgRateLimited
	case CodeExpired:
		return MsgExpired
	case CodeInvalid:
		return MsgInvalid

	// 存储相关错误码
	case CodeStorageFailed:
		return MsgStorageFailed
	case CodeLockFailed:
		return MsgLockFailed
	case CodeLockCheckFailed:
		return MsgLockCheckFailed
	case CodeTTLFailed:
		return MsgTTLFailed
	case CodeLockTTLFailed:
		return MsgLockTTLFailed

	// 文件上传相关错误码
	case CodeFileTooLarge:
		return MsgFileTooLarge
	case CodeInvalidFileType:
		return MsgInvalidFileType
	case CodeNoFileUploaded:
		return MsgNoFileUploaded
	case CodeCreateDirectory:
		return MsgCreateDirectory
	case CodeSaveFile:
		return MsgSaveFile
	case CodeFileUploadFailed:
		return MsgFileUploadFailed
	case CodeNoFileSelected:
		return MsgNoFileSelected

	default:
		return MsgUnknownError
	}
}
