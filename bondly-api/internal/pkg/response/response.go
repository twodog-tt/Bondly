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
