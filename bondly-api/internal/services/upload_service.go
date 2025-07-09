package services

import (
	"bondly-api/internal/logger"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	// 文件大小限制：5MB
	MaxFileSize = 5 * 1024 * 1024
	// 允许的图片类型
	AllowedImageTypes = "image/jpeg,image/jpg,image/png,image/gif,image/webp"
)

// 自定义错误类型
var (
	ErrFileTooLarge    = errors.New("文件大小超过限制，最大允许5MB")
	ErrInvalidFileType = errors.New("不支持的文件类型，仅支持jpg、jpeg、png、gif、webp")
	ErrNoFileUploaded  = errors.New("请选择要上传的图片文件")
	ErrCreateDirectory = errors.New("创建上传目录失败")
	ErrSaveFile        = errors.New("文件保存失败")
)

// 错误包装器，用于携带额外信息
type UploadError struct {
	Err  error
	Code string // 业务错误码
}

func (e *UploadError) Error() string {
	return e.Err.Error()
}

func (e *UploadError) Unwrap() error {
	return e.Err
}

// 创建带错误码的上传错误
func NewUploadError(err error, code string) *UploadError {
	return &UploadError{
		Err:  err,
		Code: code,
	}
}

// 错误码常量
const (
	ErrorCodeFileTooLarge    = "FILE_TOO_LARGE"
	ErrorCodeInvalidFileType = "INVALID_FILE_TYPE"
	ErrorCodeNoFileUploaded  = "NO_FILE_UPLOADED"
	ErrorCodeCreateDirectory = "CREATE_DIRECTORY_FAILED"
	ErrorCodeSaveFile        = "SAVE_FILE_FAILED"
)

// UploadResult 上传结果
type UploadResult struct {
	FileName   string
	FilePath   string
	AccessURL  string
	FileSize   int64
	UploadTime time.Time
}

// UploadService 上传服务
type UploadService struct {
	logger *logger.Logger
}

// NewUploadService 创建上传服务
func NewUploadService() *UploadService {
	return &UploadService{
		logger: logger.NewLogger(),
	}
}

// UploadImage 上传图片
func (s *UploadService) UploadImage(file *multipart.FileHeader, baseURL string) (*UploadResult, error) {
	s.logger.WithFields(map[string]interface{}{
		"fileName": file.Filename,
		"fileSize": file.Size,
		"action":   "upload_image",
	}).Info("开始上传图片")

	// 1. 验证文件
	if err := s.validateImageFile(file); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"fileName": file.Filename,
			"error":    err.Error(),
		}).Warn("图片文件验证失败")
		return nil, err
	}

	s.logger.WithField("fileName", file.Filename).Debug("图片文件验证通过")

	// 2. 创建上传目录
	uploadPath, err := s.createUploadPath()
	if err != nil {
		s.logger.WithFields(map[string]interface{}{
			"fileName": file.Filename,
			"error":    err.Error(),
		}).Error("创建上传目录失败")
		return nil, err
	}

	s.logger.WithFields(map[string]interface{}{
		"fileName":   file.Filename,
		"uploadPath": uploadPath,
	}).Debug("上传目录创建成功")

	// 3. 生成唯一文件名
	fileName := s.generateFileName(file.Filename)
	filePath := filepath.Join(uploadPath, fileName)

	s.logger.WithFields(map[string]interface{}{
		"fileName": fileName,
		"filePath": filePath,
	}).Debug("生成文件名成功")

	// 4. 保存文件
	if err := s.saveFile(file, filePath); err != nil {
		s.logger.WithFields(map[string]interface{}{
			"fileName": file.Filename,
			"filePath": filePath,
			"error":    err.Error(),
		}).Error("文件保存失败")
		return nil, err
	}

	s.logger.WithFields(map[string]interface{}{
		"fileName": file.Filename,
		"filePath": filePath,
	}).Debug("文件保存成功")

	// 5. 构建访问URL
	accessURL := s.buildAccessURL(baseURL, fileName)

	s.logger.WithFields(map[string]interface{}{
		"fileName":  file.Filename,
		"accessURL": accessURL,
	}).Info("图片上传成功")

	// 6. 返回上传结果
	result := &UploadResult{
		FileName:   fileName,
		FilePath:   filePath,
		AccessURL:  accessURL,
		FileSize:   file.Size,
		UploadTime: time.Now(),
	}

	return result, nil
}

// validateImageFile 验证图片文件
func (s *UploadService) validateImageFile(file *multipart.FileHeader) error {
	// 检查文件大小
	if file.Size > MaxFileSize {
		return NewUploadError(ErrFileTooLarge, ErrorCodeFileTooLarge)
	}

	// 检查文件类型
	contentType := file.Header.Get("Content-Type")
	allowedTypes := strings.Split(AllowedImageTypes, ",")

	isValidType := false
	for _, allowedType := range allowedTypes {
		if strings.TrimSpace(allowedType) == contentType {
			isValidType = true
			break
		}
	}

	if !isValidType {
		return NewUploadError(ErrInvalidFileType, ErrorCodeInvalidFileType)
	}

	return nil
}

// generateFileName 生成唯一文件名
func (s *UploadService) generateFileName(originalName string) string {
	// 获取文件扩展名
	ext := filepath.Ext(originalName)
	// 生成UUID作为文件名
	fileName := uuid.New().String() + ext
	return fileName
}

// createUploadPath 创建上传路径
func (s *UploadService) createUploadPath() (string, error) {
	// 按日期创建子目录：uploads/2025/01/
	now := time.Now()
	year := fmt.Sprintf("%d", now.Year())
	month := fmt.Sprintf("%02d", now.Month())

	uploadPath := filepath.Join("uploads", year, month)

	// 创建目录
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return "", NewUploadError(fmt.Errorf("%w: %v", ErrCreateDirectory, err), ErrorCodeCreateDirectory)
	}

	return uploadPath, nil
}

// saveFile 保存文件
func (s *UploadService) saveFile(file *multipart.FileHeader, filePath string) error {
	// 打开源文件
	src, err := file.Open()
	if err != nil {
		return NewUploadError(fmt.Errorf("%w: %v", ErrSaveFile, err), ErrorCodeSaveFile)
	}
	defer src.Close()

	// 创建目标文件
	dst, err := os.Create(filePath)
	if err != nil {
		return NewUploadError(fmt.Errorf("%w: %v", ErrSaveFile, err), ErrorCodeSaveFile)
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := dst.ReadFrom(src); err != nil {
		return NewUploadError(fmt.Errorf("%w: %v", ErrSaveFile, err), ErrorCodeSaveFile)
	}

	return nil
}

// buildAccessURL 构建访问URL
func (s *UploadService) buildAccessURL(baseURL, fileName string) string {
	now := time.Now()
	return fmt.Sprintf("%s/uploads/%s/%s/%s", baseURL,
		now.Format("2006"),
		now.Format("01"),
		fileName)
}
