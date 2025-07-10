# 邮件发送模块

Bondly项目的邮件发送模块，支持多种邮件服务提供商，提供统一的邮件发送接口。

## 功能特性

- 🎯 **统一接口**: 定义 `EmailSender` 接口，便于依赖注入和测试
- 🔧 **多提供商支持**: 支持 Mock 和 Resend 邮件服务
- 📧 **HTML模板**: 提供美观的HTML邮件模板
- 🛡️ **错误处理**: 完善的错误处理和日志记录
- 🧪 **易于测试**: Mock发送器便于单元测试

## 目录结构

```
internal/email/
├── email.go          # 接口定义和工厂函数
├── mock.go           # Mock邮件发送器
├── resend.go         # Resend邮件发送器
└── README.md         # 本文档
```

## 快速开始

### 1. 环境配置

在 `.env` 文件中配置邮件服务：

```bash
# 邮件服务配置
EMAIL_PROVIDER=mock              # 或 resend
RESEND_API_KEY=re_abc123...      # Resend API密钥（仅resend模式需要）
EMAIL_FROM=Bondly <noreply@yourdomain.com>  # 发件人地址
```

### 2. 使用示例

```go
package main

import (
    "bondly-api/internal/email"
    "bondly-api/internal/services"
)

func main() {
    // 创建邮件发送器
    emailSender, err := email.NewEmailSender()
    if err != nil {
        panic(err)
    }

    // 创建邮件服务
    emailService := services.NewEmailService(emailSender)

    // 发送验证码邮件
    err = emailService.SendVerificationCode(ctx, "user@example.com", "123456")
    if err != nil {
        log.Printf("发送验证码失败: %v", err)
    }

    // 发送欢迎邮件
    err = emailService.SendWelcomeEmail(ctx, "user@example.com", "张三")
    if err != nil {
        log.Printf("发送欢迎邮件失败: %v", err)
    }
}
```

## 邮件提供商

### Mock发送器

用于开发和测试环境，将邮件内容打印到日志中：

```bash
EMAIL_PROVIDER=mock
```

**特点:**
- 无需外部依赖
- 邮件内容打印到日志
- 模拟网络延迟
- 适合开发和测试

### Resend发送器

使用 Resend 服务发送真实邮件：

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Your App <noreply@yourdomain.com>
```

**特点:**
- 发送真实邮件
- 高送达率
- 支持HTML内容
- 需要Resend账户和API密钥



## 邮件模板

### 验证码邮件模板

自动生成的HTML验证码邮件，包含：

- 品牌标识
- 验证码显示
- 有效期提醒
- 安全警告
- 响应式设计

### 欢迎邮件模板

新用户注册后的欢迎邮件，包含：

- 个性化问候
- 功能介绍
- 品牌信息

## 自定义邮件模板

实现 `EmailTemplate` 接口创建自定义模板：

```go
type CustomEmailTemplate struct{}

func (t *CustomEmailTemplate) Render(data interface{}) (string, error) {
    // 自定义邮件内容渲染逻辑
    return htmlContent, nil
}
```

## 错误处理

邮件发送失败时会：

1. 记录详细错误日志
2. 返回具体错误信息
3. 在认证服务中自动回退到Mock发送

## 测试

运行邮件模块测试：

```bash
cd bondly-api
go test ./internal/email/...
```

## 集成到认证服务

邮件模块已集成到认证服务中，在发送验证码时会自动使用配置的邮件发送器：

```go
// 在认证服务中自动调用
authService.SendVerificationCode(ctx, email)
```

## 注意事项

1. **环境变量**: 确保正确配置环境变量
2. **API密钥**: Resend模式需要有效的API密钥
3. **发件人地址**: 发件人地址需要验证过的域名
4. **错误处理**: 生产环境建议配置监控和告警
5. **限流**: 注意邮件发送频率限制

## 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查环境变量配置
   - 验证API密钥有效性
   - 查看错误日志

2. **Mock模式不工作**
   - 确认 `EMAIL_PROVIDER=mock`
   - 检查日志输出

3. **Resend模式初始化失败**
   - 验证 `RESEND_API_KEY` 和 `EMAIL_FROM`
   - 确认网络连接正常

### 日志查看

```bash
# 查看邮件发送日志
make logs-email

# 查看所有日志
make logs
``` 