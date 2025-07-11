package logger

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
)

// BusinessLogger 业务日志工具
type BusinessLogger struct {
	entry *logrus.Entry
}

// NewBusinessLogger 创建业务日志工具实例
func NewBusinessLogger(ctx context.Context) *BusinessLogger {
	return &BusinessLogger{
		entry: FromContext(ctx),
	}
}

// WithFields 添加结构化字段
func (b *BusinessLogger) WithFields(fields logrus.Fields) *BusinessLogger {
	return &BusinessLogger{
		entry: b.entry.WithFields(fields),
	}
}

// WithField 添加单个字段
func (b *BusinessLogger) WithField(key string, value interface{}) *BusinessLogger {
	return &BusinessLogger{
		entry: b.entry.WithField(key, value),
	}
}

// StartAction 记录接口开始
func (b *BusinessLogger) StartAction(action string, userID interface{}, wallet string, params map[string]interface{}) {
	fields := logrus.Fields{
		"action": action,
	}

	if userID != nil {
		fields["user_id"] = userID
	}

	if wallet != "" {
		fields["wallet"] = wallet
	}

	if params != nil {
		fields["params"] = params
	}

	b.entry.WithFields(fields).Info("接口开始")
}

// ValidationFailed 记录校验失败
func (b *BusinessLogger) ValidationFailed(field string, reason string, value interface{}) {
	b.entry.WithFields(logrus.Fields{
		"validation_failed": true,
		"failed_field":      field,
		"reason":            reason,
		"value":             value,
	}).Warn("校验失败")
}

// DatabaseError 记录数据库错误
func (b *BusinessLogger) DatabaseError(operation string, table string, query string, err error) {
	b.entry.WithFields(logrus.Fields{
		"error_type": "database",
		"operation":  operation,
		"table":      table,
		"query":      query,
		"error":      err.Error(),
	}).Error("数据库操作失败")
}

// ThirdPartyError 记录第三方服务错误
func (b *BusinessLogger) ThirdPartyError(service string, operation string, params map[string]interface{}, err error) {
	fields := logrus.Fields{
		"error_type": "third_party",
		"service":    service,
		"operation":  operation,
		"error":      err.Error(),
	}

	if params != nil {
		fields["params"] = params
	}

	b.entry.WithFields(fields).Error("第三方服务调用失败")
}

// Success 记录操作成功
func (b *BusinessLogger) Success(action string, result map[string]interface{}) {
	fields := logrus.Fields{
		"action": action,
	}

	if result != nil {
		fields["result"] = result
	}

	b.entry.WithFields(fields).Info("操作成功")
}

// CacheHit 记录缓存命中
func (b *BusinessLogger) CacheHit(key string, dataType string) {
	b.entry.WithFields(logrus.Fields{
		"cache_hit": true,
		"key":       key,
		"data_type": dataType,
	}).Debug("缓存命中")
}

// CacheMiss 记录缓存未命中
func (b *BusinessLogger) CacheMiss(key string, dataType string) {
	b.entry.WithFields(logrus.Fields{
		"cache_miss": true,
		"key":        key,
		"data_type":  dataType,
	}).Debug("缓存未命中")
}

// CacheSet 记录缓存设置
func (b *BusinessLogger) CacheSet(key string, dataType string, ttl interface{}) {
	b.entry.WithFields(logrus.Fields{
		"cache_set": true,
		"key":       key,
		"data_type": dataType,
		"ttl":       ttl,
	}).Debug("缓存设置")
}

// RateLimitExceeded 记录限流
func (b *BusinessLogger) RateLimitExceeded(identifier string, limit interface{}) {
	b.entry.WithFields(logrus.Fields{
		"rate_limit_exceeded": true,
		"identifier":          identifier,
		"limit":               limit,
	}).Warn("请求频率超限")
}

// SecurityEvent 记录安全事件
func (b *BusinessLogger) SecurityEvent(eventType string, details map[string]interface{}) {
	fields := logrus.Fields{
		"security_event": true,
		"event_type":     eventType,
	}

	if details != nil {
		fields["details"] = details
	}

	b.entry.WithFields(fields).Warn("安全事件")
}

// Performance 记录性能指标
func (b *BusinessLogger) Performance(operation string, duration interface{}, metrics map[string]interface{}) {
	fields := logrus.Fields{
		"performance": true,
		"operation":   operation,
		"duration":    duration,
	}

	if metrics != nil {
		fields["metrics"] = metrics
	}

	b.entry.WithFields(fields).Info("性能指标")
}

// BusinessLogic 记录业务逻辑
func (b *BusinessLogger) BusinessLogic(step string, data map[string]interface{}) {
	fields := logrus.Fields{
		"business_logic": true,
		"step":           step,
	}

	if data != nil {
		fields["data"] = data
	}

	b.entry.WithFields(fields).Debug("业务逻辑")
}

// SensitiveDataMasked 记录敏感数据脱敏
func (b *BusinessLogger) SensitiveDataMasked(dataType string, originalLength int) {
	b.entry.WithFields(logrus.Fields{
		"sensitive_data_masked": true,
		"data_type":             dataType,
		"original_length":       originalLength,
	}).Debug("敏感数据已脱敏")
}

// 便捷方法

// StartAPI 开始API接口
func (b *BusinessLogger) StartAPI(method, path string, userID interface{}, wallet string, params map[string]interface{}) {
	action := fmt.Sprintf("%s %s", method, path)
	b.StartAction(action, userID, wallet, params)
}

// UserNotFound 用户不存在
func (b *BusinessLogger) UserNotFound(identifier string, value interface{}) {
	b.entry.WithFields(logrus.Fields{
		"user_not_found": true,
		"identifier":     identifier,
		"value":          value,
	}).Info("用户不存在")
}

// UserCreated 用户创建成功
func (b *BusinessLogger) UserCreated(userID int64, email string, wallet string) {
	b.Success("user_created", map[string]interface{}{
		"user_id": userID,
		"email":   email,
		"wallet":  wallet,
	})
}

// UserUpdated 用户更新成功
func (b *BusinessLogger) UserUpdated(userID int64, updatedFields []string) {
	b.Success("user_updated", map[string]interface{}{
		"user_id":        userID,
		"updated_fields": updatedFields,
	})
}

// WalletGenerated 钱包生成成功
func (b *BusinessLogger) WalletGenerated(userID int64, walletAddress string) {
	b.Success("wallet_generated", map[string]interface{}{
		"user_id":        userID,
		"wallet_address": walletAddress,
	})
}

// WalletBound 钱包绑定成功
func (b *BusinessLogger) WalletBound(userID int64, walletAddress string) {
	b.Success("wallet_bound", map[string]interface{}{
		"user_id":        userID,
		"wallet_address": walletAddress,
	})
}

// FileUploaded 文件上传成功
func (b *BusinessLogger) FileUploaded(fileName string, fileSize int64, fileType string, accessURL string) {
	b.Success("file_uploaded", map[string]interface{}{
		"file_name":  fileName,
		"file_size":  fileSize,
		"file_type":  fileType,
		"access_url": accessURL,
	})
}

// EmailSent 邮件发送成功
func (b *BusinessLogger) EmailSent(to string, subject string, template string) {
	b.Success("email_sent", map[string]interface{}{
		"to":       to,
		"subject":  subject,
		"template": template,
	})
}

// CodeSent 验证码发送成功
func (b *BusinessLogger) CodeSent(email string, expiresIn string) {
	b.Success("code_sent", map[string]interface{}{
		"email":      email,
		"expires_in": expiresIn,
	})
}

// CodeVerified 验证码验证成功
func (b *BusinessLogger) CodeVerified(email string) {
	b.Success("code_verified", map[string]interface{}{
		"email": email,
	})
}

// LoginSuccess 登录成功
func (b *BusinessLogger) LoginSuccess(userID int64, email string, isNewUser bool) {
	b.Success("login_success", map[string]interface{}{
		"user_id":     userID,
		"email":       email,
		"is_new_user": isNewUser,
	})
}
