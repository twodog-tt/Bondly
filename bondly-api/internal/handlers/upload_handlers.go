package handlers

import (
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"errors"

	"github.com/gin-gonic/gin"
)

// UploadImageData 图片上传响应数据
type UploadImageData struct {
	URL string `json:"url" example:"http://localhost:8080/uploads/2025/01/abc123.png"`
}

// UploadHandlers 上传处理器
type UploadHandlers struct {
	uploadService *services.UploadService
}

// NewUploadHandlers 创建上传处理器
func NewUploadHandlers(uploadService *services.UploadService) *UploadHandlers {
	return &UploadHandlers{
		uploadService: uploadService,
	}
}

// handleUploadError 统一处理上传错误
func (h *UploadHandlers) handleUploadError(c *gin.Context, err error) {
	var uploadErr *services.UploadError
	if errors.As(err, &uploadErr) {
		// 根据错误码返回不同的业务状态码
		switch uploadErr.Code {
		case services.ErrorCodeFileTooLarge, services.ErrorCodeInvalidFileType:
			response.Fail(c, response.CodeInvalidParams, uploadErr.Error())
		case services.ErrorCodeNoFileUploaded:
			response.Fail(c, response.CodeInvalidParams, uploadErr.Error())
		case services.ErrorCodeCreateDirectory, services.ErrorCodeSaveFile:
			response.Fail(c, response.CodeInternalError, "服务器内部错误")
		default:
			response.Fail(c, response.CodeInternalError, "未知错误")
		}
		return
	}

	// 处理非UploadError类型的错误
	response.Fail(c, response.CodeInternalError, "服务器内部错误")
}

// UploadImage 图片上传接口
// @Summary 上传图片
// @Description 上传图片文件，支持jpg、jpeg、png、gif、webp格式，文件大小限制5MB
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "图片文件"
// @Success 200 {object} response.Response[UploadImageData] "上传成功"
// @Failure 200 {object} response.Response[any] "文件格式错误或上传失败"
// @Router /api/v1/upload/image [post]
func (h *UploadHandlers) UploadImage(c *gin.Context) {
	// 获取上传的文件
	file, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, response.CodeInvalidParams, services.ErrNoFileUploaded.Error())
		return
	}

	// 构建基础URL
	baseURL := "http://localhost:8080"
	if c.Request.Host != "" {
		baseURL = "http://" + c.Request.Host
	}

	// 调用服务层上传图片
	result, err := h.uploadService.UploadImage(file, baseURL)
	if err != nil {
		h.handleUploadError(c, err)
		return
	}

	// 返回成功响应
	data := UploadImageData{
		URL: result.AccessURL,
	}
	response.OK(c, data, "上传成功")
}
