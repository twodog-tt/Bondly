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

// LoginRequest 登录请求结构
type LoginRequest struct {
	Email    string `json:"email" binding:"required" example:"user@example.com"`
	Nickname string `json:"nickname" binding:"required" example:"John Doe"`
}

// LoginResponse 登录响应结构
type LoginResponse struct {
	Token     string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	UserID    int64  `json:"user_id" example:"1"`
	Email     string `json:"email" example:"user@example.com"`
	Nickname  string `json:"nickname" example:"John Doe"`
	Role      string `json:"role" example:"user"`
	IsNewUser bool   `json:"is_new_user" example:"false"`
	ExpiresIn string `json:"expires_in" example:"24小时"`
}
