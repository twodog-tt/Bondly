package services

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"context"
	stderrors "errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

const (
	// 文件大小限制：5MB
	MaxFileSize = 5 * 1024 * 1024
	// 允许的图片类型
	AllowedImageTypes = "image/jpeg,image/jpg,image/png,image/gif,image/webp"
)

// 自定义错误类型 - 使用统一错误码
var (
	ErrFileTooLarge    = NewUploadError(stderrors.New(response.MsgFileTooLarge), response.CodeFileTooLarge)
	ErrInvalidFileType = NewUploadError(stderrors.New(response.MsgInvalidFileType), response.CodeInvalidFileType)
	ErrNoFileUploaded  = NewUploadError(stderrors.New(response.MsgNoFileSelected), response.CodeNoFileSelected)
	ErrCreateDirectory = NewUploadError(stderrors.New(response.MsgCreateDirectory), response.CodeCreateDirectory)
	ErrSaveFile        = NewUploadError(stderrors.New(response.MsgSaveFile), response.CodeSaveFile)
)

// 错误包装器，用于携带额外信息
type UploadError struct {
	Err  error
	Code int // 业务错误码
}

func (e *UploadError) Error() string {
	return e.Err.Error()
}

func (e *UploadError) Unwrap() error {
	return e.Err
}

// 创建带错误码的上传错误
func NewUploadError(err error, code int) *UploadError {
	return &UploadError{
		Err:  err,
		Code: code,
	}
}

// 错误码常量
const (
	ErrorCodeFileTooLarge    = response.CodeFileTooLarge
	ErrorCodeInvalidFileType = response.CodeInvalidFileType
	ErrorCodeNoFileUploaded  = response.CodeNoFileSelected
	ErrorCodeCreateDirectory = response.CodeCreateDirectory
	ErrorCodeSaveFile        = response.CodeSaveFile
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
}

// NewUploadService 创建上传服务
func NewUploadService() *UploadService {
	return &UploadService{}
}

// UploadImage 上传图片
func (s *UploadService) UploadImage(ctx context.Context, file *multipart.FileHeader, baseURL string) (*UploadResult, error) {
	log := loggerpkg.FromContext(ctx)

	log.WithFields(logrus.Fields{
		"fileName": file.Filename,
		"fileSize": file.Size,
		"action":   "upload_image",
	}).Info("开始上传图片")

	// 1. 验证文件
	if err := s.validateImageFile(file); err != nil {
		log.WithFields(logrus.Fields{
			"fileName": file.Filename,
			"error":    err.Error(),
		}).Warn("图片文件验证失败")
		return nil, err
	}

	log.WithField("fileName", file.Filename).Debug("图片文件验证通过")

	// 2. 创建上传目录
	uploadPath, err := s.createUploadPath()
	if err != nil {
		log.WithFields(logrus.Fields{
			"fileName": file.Filename,
			"error":    err.Error(),
		}).Error("创建上传目录失败")
		return nil, err
	}

	log.WithFields(logrus.Fields{
		"fileName":   file.Filename,
		"uploadPath": uploadPath,
	}).Debug("上传目录创建成功")

	// 3. 生成唯一文件名
	fileName := s.generateFileName(file.Filename)
	filePath := filepath.Join(uploadPath, fileName)

	log.WithFields(logrus.Fields{
		"fileName": fileName,
		"filePath": filePath,
	}).Debug("生成文件名成功")

	// 4. 保存文件
	if err := s.saveFile(file, filePath); err != nil {
		log.WithFields(logrus.Fields{
			"fileName": file.Filename,
			"filePath": filePath,
			"error":    err.Error(),
		}).Error("文件保存失败")
		return nil, err
	}

	log.WithFields(logrus.Fields{
		"fileName": file.Filename,
		"filePath": filePath,
	}).Debug("文件保存成功")

	// 5. 构建访问URL
	accessURL := s.buildAccessURL(baseURL, fileName)

	log.WithFields(logrus.Fields{
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
