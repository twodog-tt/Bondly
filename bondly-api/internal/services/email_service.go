package services

import (
	"bondly-api/internal/email"
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
)

// EmailService 邮件服务
type EmailService struct {
	emailSender email.EmailSender
	logger      *logrus.Logger
}

// NewEmailService 创建邮件服务
func NewEmailService(emailSender email.EmailSender) *EmailService {
	return &EmailService{
		emailSender: emailSender,
		logger:      logrus.New(),
	}
}

// SendVerificationCode 发送验证码邮件
func (s *EmailService) SendVerificationCode(ctx context.Context, toEmail, code string) error {
	log := s.logger.WithFields(logrus.Fields{
		"to_email": toEmail,
		"action":   "send_verification_code",
	})

	log.Info("开始发送验证码邮件")

	// 创建邮件模板
	template := email.NewVerificationCodeEmailTemplate()

	// 准备邮件数据
	emailData := email.VerificationCodeEmailData{
		Code:        code,
		ExpiresIn:   "10分钟",
		UserEmail:   toEmail,
		ServiceName: "Bondly",
	}

	// 渲染邮件内容
	body, err := template.Render(emailData)
	if err != nil {
		log.WithFields(logrus.Fields{
			"error": err.Error(),
		}).Error("邮件模板渲染失败")
		return fmt.Errorf("failed to render email template: %w", err)
	}

	// 设置邮件主题
	subject := fmt.Sprintf("验证码 - Bondly")

	// 发送邮件
	if err := s.emailSender.Send(toEmail, subject, body); err != nil {
		log.WithFields(logrus.Fields{
			"error": err.Error(),
		}).Error("验证码邮件发送失败")
		return fmt.Errorf("failed to send verification code email: %w", err)
	}

	log.Info("验证码邮件发送成功")
	return nil
}

// SendWelcomeEmail 发送欢迎邮件
func (s *EmailService) SendWelcomeEmail(ctx context.Context, toEmail, nickname string) error {
	log := s.logger.WithFields(logrus.Fields{
		"to_email": toEmail,
		"nickname": nickname,
		"action":   "send_welcome_email",
	})

	log.Info("开始发送欢迎邮件")

	// 简单的欢迎邮件内容
	subject := "欢迎加入 Bondly！"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>欢迎加入 Bondly</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Bondly</div>
            <h1>欢迎加入！</h1>
        </div>
        
        <p>亲爱的 <strong>%s</strong>，</p>
        
        <p>欢迎您加入 Bondly 社区！我们很高兴您选择成为我们的一员。</p>
        
        <p>在 Bondly，您可以：</p>
        <ul>
            <li>分享您的想法和见解</li>
            <li>参与社区讨论和投票</li>
            <li>获得社区奖励和声誉</li>
            <li>连接志同道合的朋友</li>
        </ul>
        
        <p>如果您有任何问题或需要帮助，请随时联系我们。</p>
        
        <p>祝您在 Bondly 度过愉快的时光！</p>
        
        <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 Bondly. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, nickname)

	// 发送邮件
	if err := s.emailSender.Send(toEmail, subject, body); err != nil {
		log.WithFields(logrus.Fields{
			"error": err.Error(),
		}).Error("欢迎邮件发送失败")
		return fmt.Errorf("failed to send welcome email: %w", err)
	}

	log.Info("欢迎邮件发送成功")
	return nil
}
