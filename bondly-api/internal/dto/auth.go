package dto

// SendCodeRequest 发送验证码请求结构
type SendCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com" format:"email"`
}

// VerifyCodeRequest 验证验证码请求结构
type VerifyCodeRequest struct {
	Email string `json:"email" binding:"required" example:"user@example.com" format:"email"`
	Code  string `json:"code" binding:"required" example:"123456" minLength:"6" maxLength:"6"`
}

// SendCodeData 发送验证码响应数据
type SendCodeData struct {
	Email     string `json:"email" example:"user@example.com"`
	ExpiresIn string `json:"expires_in" example:"10分钟"`
}

// VerifyCodeData 验证码验证响应数据
type VerifyCodeData struct {
	Email   string `json:"email" example:"user@example.com"`
	IsValid bool   `json:"isValid" example:"true"`
	Token   string `json:"token,omitempty" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// CodeStatusData 验证码状态响应数据
type CodeStatusData struct {
	Email          string `json:"email" example:"user@example.com"`
	CodeExists     bool   `json:"code_exists" example:"true"`
	CodeTTLSeconds int    `json:"code_ttl_seconds" example:"300"`
	Locked         bool   `json:"locked" example:"false"`
	LockTTLSeconds int    `json:"lock_ttl_seconds" example:"0"`
}
