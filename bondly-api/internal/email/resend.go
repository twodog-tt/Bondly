package email

import (
	"fmt"

	"github.com/resendlabs/resend-go"
	"github.com/sirupsen/logrus"
)

// ResendEmailSender Resend邮件发送器
type ResendEmailSender struct {
	client *resend.Client
	from   string
	logger *logrus.Logger
}

// NewResendEmailSender 创建Resend邮件发送器
func NewResendEmailSender(config EmailConfig) (*ResendEmailSender, error) {
	if config.ResendKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is required")
	}

	if config.FromEmail == "" {
		return nil, fmt.Errorf("EMAIL_FROM is required")
	}

	client := resend.NewClient(config.ResendKey)

	return &ResendEmailSender{
		client: client,
		from:   config.FromEmail,
		logger: logrus.New(),
	}, nil
}

// Send 使用Resend发送邮件
func (s *ResendEmailSender) Send(to string, subject string, body string) error {
	s.logger.WithFields(logrus.Fields{
		"to":      to,
		"subject": subject,
		"from":    s.from,
	}).Info("📧 开始发送Resend邮件")

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: subject,
		Html:    body,
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"to":      to,
			"subject": subject,
			"error":   err.Error(),
		}).Error("❌ Resend邮件发送失败")
		return fmt.Errorf("failed to send email via Resend: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"to":      to,
		"subject": subject,
	}).Info("✅ Resend邮件发送成功")

	return nil
}
