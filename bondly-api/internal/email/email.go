package email

import (
	"fmt"
)

// EmailSender 邮件发送接口
type EmailSender interface {
	Send(to string, subject string, body string) error
}

// EmailConfig 邮件配置
type EmailConfig struct {
	Provider  string
	ResendKey string
	FromEmail string
}

// NewEmailSender 根据配置创建邮件发送器
func NewEmailSender(config EmailConfig) (EmailSender, error) {
	switch config.Provider {
	case "mock":
		return NewMockEmailSender(), nil
	case "resend":
		return NewResendEmailSender(config)
	default:
		return nil, fmt.Errorf("unsupported email provider: %s", config.Provider)
	}
}

// EmailTemplate 邮件模板接口
type EmailTemplate interface {
	Render(data interface{}) (string, error)
}

// VerificationCodeEmailData 验证码邮件数据
type VerificationCodeEmailData struct {
	Code        string
	ExpiresIn   string
	UserEmail   string
	ServiceName string
}

// NewVerificationCodeEmailTemplate 创建验证码邮件模板
func NewVerificationCodeEmailTemplate() EmailTemplate {
	return &verificationCodeEmailTemplate{}
}

type verificationCodeEmailTemplate struct{}

func (t *verificationCodeEmailTemplate) Render(data interface{}) (string, error) {
	emailData, ok := data.(VerificationCodeEmailData)
	if !ok {
		return "", fmt.Errorf("invalid email data type")
	}

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>验证码 - %s</title>
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
        .code {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            letter-spacing: 4px;
        }
        .expires {
            color: #64748b;
            font-size: 14px;
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">%s</div>
            <h1>验证码</h1>
        </div>
        
        <p>您好！</p>
        
        <p>您正在使用邮箱 <strong>%s</strong> 进行身份验证，请输入以下验证码：</p>
        
        <div class="code">%s</div>
        
        <div class="expires">验证码有效期：%s</div>
        
        <div class="warning">
            <strong>安全提醒：</strong>
            <ul>
                <li>请勿将验证码泄露给他人</li>
                <li>如非本人操作，请忽略此邮件</li>
                <li>验证码仅用于身份验证，不会要求您转账或提供其他信息</li>
            </ul>
        </div>
        
        <p>如果这不是您的操作，请忽略此邮件。</p>
        
        <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>&copy; 2024 %s. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, emailData.ServiceName, emailData.ServiceName, emailData.UserEmail, emailData.Code, emailData.ExpiresIn, emailData.ServiceName)

	return html, nil
}
