package email

import (
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
)

// MockEmailSender Mock邮件发送器
type MockEmailSender struct {
	logger *logrus.Logger
}

// NewMockEmailSender 创建Mock邮件发送器
func NewMockEmailSender() *MockEmailSender {
	return &MockEmailSender{
		logger: logrus.New(),
	}
}

// Send 模拟发送邮件，在本地打印日志
func (s *MockEmailSender) Send(to string, subject string, body string) error {
	s.logger.WithFields(logrus.Fields{
		"to":      to,
		"subject": subject,
		"time":    time.Now().Format("2006-01-02 15:04:05"),
	}).Info("📧 Mock邮件发送")

	// 打印邮件内容（仅用于调试）
	s.logger.WithFields(logrus.Fields{
		"body_preview": fmt.Sprintf("%.100s...", body), // 只显示前100个字符
	}).Debug("邮件内容预览")

	// 模拟网络延迟
	time.Sleep(100 * time.Millisecond)

	s.logger.WithFields(logrus.Fields{
		"to":      to,
		"subject": subject,
	}).Info("✅ Mock邮件发送成功")

	return nil
}
