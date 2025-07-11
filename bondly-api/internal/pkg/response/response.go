package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data,omitempty"`
	Success bool   `json:"success"`
}

// OK 返回成功响应（带数据）
func OK[T any](c *gin.Context, data T, message string) {
	c.JSON(http.StatusOK, Response[T]{
		Code:    1000,
		Message: message,
		Data:    data,
		Success: true,
	})
}

// OKMsg 返回成功响应（无数据）
func OKMsg(c *gin.Context, message string) {
	OK(c, gin.H{}, message)
}

// Fail 返回失败响应
func Fail(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response[any]{
		Code:    code,
		Message: message,
		Data:    nil,
		Success: false,
	})
}

// ResponseAny 非泛型Response类型，用于Swagger文档
type ResponseAny struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseUser 用户相关响应类型
type ResponseUser struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseContent 内容相关响应类型
type ResponseContent struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseProposal 提案相关响应类型
type ResponseProposal struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseTransaction 交易相关响应类型
type ResponseTransaction struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseComment 评论相关响应类型
type ResponseComment struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseWalletBinding 钱包绑定相关响应类型
type ResponseWalletBinding struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}

// ResponseUserFollow 用户关注相关响应类型
type ResponseUserFollow struct {
	Code    int         `json:"code" example:"1000"`
	Message string      `json:"message" example:"操作成功"`
	Data    interface{} `json:"data,omitempty"`
	Success bool        `json:"success" example:"true"`
}
