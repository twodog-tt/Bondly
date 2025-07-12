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

// UserNotFound 用户未找到
func (b *BusinessLogger) UserNotFound(identifier string, value interface{}) {
	b.entry.WithFields(logrus.Fields{
		"user_not_found": true,
		"identifier":     identifier,
		"value":          value,
	}).Warn("用户未找到")
}

// UserCreated 用户创建
func (b *BusinessLogger) UserCreated(userID int64, email string, wallet string) {
	b.entry.WithFields(logrus.Fields{
		"user_created": true,
		"user_id":      userID,
		"email":        email,
		"wallet":       wallet,
	}).Info("用户创建成功")
}

// UserUpdated 用户更新
func (b *BusinessLogger) UserUpdated(userID int64, updatedFields []string) {
	b.entry.WithFields(logrus.Fields{
		"user_updated":   true,
		"user_id":        userID,
		"updated_fields": updatedFields,
	}).Info("用户信息更新成功")
}

// WalletGenerated 钱包生成
func (b *BusinessLogger) WalletGenerated(userID int64, walletAddress string) {
	b.entry.WithFields(logrus.Fields{
		"wallet_generated": true,
		"user_id":          userID,
		"wallet_address":   walletAddress,
	}).Info("托管钱包生成成功")
}

// WalletBound 钱包绑定
func (b *BusinessLogger) WalletBound(userID int64, walletAddress string) {
	b.entry.WithFields(logrus.Fields{
		"wallet_bound":   true,
		"user_id":        userID,
		"wallet_address": walletAddress,
	}).Info("钱包绑定成功")
}

// FileUploaded 文件上传
func (b *BusinessLogger) FileUploaded(fileName string, fileSize int64, fileType string, accessURL string) {
	b.entry.WithFields(logrus.Fields{
		"file_uploaded": true,
		"file_name":     fileName,
		"file_size":     fileSize,
		"file_type":     fileType,
		"access_url":    accessURL,
	}).Info("文件上传成功")
}

// EmailSent 邮件发送
func (b *BusinessLogger) EmailSent(to string, subject string, template string) {
	b.entry.WithFields(logrus.Fields{
		"email_sent": true,
		"to":         to,
		"subject":    subject,
		"template":   template,
	}).Info("邮件发送成功")
}

// CodeSent 验证码发送
func (b *BusinessLogger) CodeSent(email string, expiresIn string) {
	b.entry.WithFields(logrus.Fields{
		"code_sent":  true,
		"email":      email,
		"expires_in": expiresIn,
	}).Info("验证码发送成功")
}

// CodeVerified 验证码验证
func (b *BusinessLogger) CodeVerified(email string) {
	b.entry.WithFields(logrus.Fields{
		"code_verified": true,
		"email":         email,
	}).Info("验证码验证成功")
}

// LoginSuccess 登录成功
func (b *BusinessLogger) LoginSuccess(userID int64, email string, isNewUser bool) {
	b.entry.WithFields(logrus.Fields{
		"login_success": true,
		"user_id":       userID,
		"email":         email,
		"is_new_user":   isNewUser,
	}).Info("用户登录成功")
}

// ContentInteractionCreated 内容互动创建
func (b *BusinessLogger) ContentInteractionCreated(contentID int64, userID int64, interactionType string) {
	b.entry.WithFields(logrus.Fields{
		"content_interaction_created": true,
		"content_id":                  contentID,
		"user_id":                     userID,
		"interaction_type":            interactionType,
	}).Info("内容互动创建成功")
}

// ContentInteractionDeleted 内容互动删除
func (b *BusinessLogger) ContentInteractionDeleted(contentID int64, userID int64, interactionType string) {
	b.entry.WithFields(logrus.Fields{
		"content_interaction_deleted": true,
		"content_id":                  contentID,
		"user_id":                     userID,
		"interaction_type":            interactionType,
	}).Info("内容互动删除成功")
}

// ContentInteractionStatsRetrieved 内容互动统计获取
func (b *BusinessLogger) ContentInteractionStatsRetrieved(contentID int64, stats map[string]interface{}) {
	b.entry.WithFields(logrus.Fields{
		"content_interaction_stats_retrieved": true,
		"content_id":                          contentID,
		"stats":                               stats,
	}).Info("内容互动统计获取成功")
}

// ContentInteractionStatusRetrieved 用户互动状态获取
func (b *BusinessLogger) ContentInteractionStatusRetrieved(contentID int64, userID int64, status map[string]interface{}) {
	b.entry.WithFields(logrus.Fields{
		"content_interaction_status_retrieved": true,
		"content_id":                           contentID,
		"user_id":                              userID,
		"status":                               status,
	}).Info("用户互动状态获取成功")
}

// ContentCreated 内容创建
func (b *BusinessLogger) ContentCreated(contentID int64, authorID int64, contentType string) {
	b.entry.WithFields(logrus.Fields{
		"content_created": true,
		"content_id":      contentID,
		"author_id":       authorID,
		"content_type":    contentType,
	}).Info("内容创建成功")
}

// ContentUpdated 内容更新
func (b *BusinessLogger) ContentUpdated(contentID int64, authorID int64, updatedFields []string) {
	b.entry.WithFields(logrus.Fields{
		"content_updated": true,
		"content_id":      contentID,
		"author_id":       authorID,
		"updated_fields":  updatedFields,
	}).Info("内容更新成功")
}

// ContentDeleted 内容删除
func (b *BusinessLogger) ContentDeleted(contentID int64, authorID int64) {
	b.entry.WithFields(logrus.Fields{
		"content_deleted": true,
		"content_id":      contentID,
		"author_id":       authorID,
	}).Info("内容删除成功")
}

// ContentRetrieved 内容获取
func (b *BusinessLogger) ContentRetrieved(contentID int64, viewCount int64) {
	b.entry.WithFields(logrus.Fields{
		"content_retrieved": true,
		"content_id":        contentID,
		"view_count":        viewCount,
	}).Info("内容获取成功")
}

// ContentListRetrieved 内容列表获取
func (b *BusinessLogger) ContentListRetrieved(total int64, page int, limit int, filters map[string]interface{}) {
	b.entry.WithFields(logrus.Fields{
		"content_list_retrieved": true,
		"total":                  total,
		"page":                   page,
		"limit":                  limit,
		"filters":                filters,
	}).Info("内容列表获取成功")
}
