package response

const (
	// 成功
	CodeSuccess = 1000

	// 通用错误码
	CodeInvalidParams = 1400
	CodeUnauthorized  = 1401
	CodeForbidden     = 1403
	CodeNotFound      = 1404
	CodeInternalError = 1500

	// 业务相关错误码
	CodeVerificationError = 1601
	CodeEmailExists       = 1602
)
