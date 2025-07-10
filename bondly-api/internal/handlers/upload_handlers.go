package handlers

import (
	"bondly-api/internal/dto"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

type UploadHandlers struct {
	uploadService *services.UploadService
}

func NewUploadHandlers(uploadService *services.UploadService) *UploadHandlers {
	return &UploadHandlers{
		uploadService: uploadService,
	}
}

// UploadImage 上传图片接口
// @Summary 上传图片文件
// @Description 上传图片文件，支持jpg、jpeg、png、gif、webp格式，文件大小限制5MB
// @Tags 文件上传
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "图片文件"
// @Success 200 {object} response.Response[dto.UploadImageData] "图片上传成功"
// @Failure 200 {object} response.Response[any] "文件格式错误或上传失败"
// @Router /api/v1/upload/image [post]
func (h *UploadHandlers) UploadImage(c *gin.Context) {
	// 获取上传的文件
	file, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, response.CodeNoFileSelected, response.MsgNoFileSelected)
		return
	}

	// 验证文件
	if err := h.validateImageFile(file); err != nil {
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	// 构建基础URL
	baseURL := "http://localhost:8080"
	if c.Request.Host != "" {
		baseURL = "http://" + c.Request.Host
	}

	// 上传文件
	result, err := h.uploadService.UploadImage(c.Request.Context(), file, baseURL)
	if err != nil {
		response.Fail(c, response.CodeFileUploadFailed, response.MsgFileUploadFailed)
		return
	}

	// 返回上传结果
	data := dto.UploadImageData{
		URL: result.AccessURL,
	}
	response.OK(c, data, response.MsgImageUploaded)
}

// validateImageFile 验证图片文件
func (h *UploadHandlers) validateImageFile(file *multipart.FileHeader) error {
	// 检查文件大小（5MB）
	const maxSize = 5 * 1024 * 1024
	if file.Size > maxSize {
		return fmt.Errorf(response.MsgFileTooLarge)
	}

	// 检查文件类型
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	isAllowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return fmt.Errorf(response.MsgInvalidFileType)
	}

	return nil
}
