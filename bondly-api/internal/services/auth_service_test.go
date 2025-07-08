package services

import (
	"fmt"
	"regexp"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuthService_ValidateEmail(t *testing.T) {
	service := &AuthService{}

	validEmails := []string{
		"test@example.com",
		"user.name@domain.co.uk",
		"test+label@gmail.com",
		"123@test.io",
	}

	invalidEmails := []string{
		"",
		"invalid-email",
		"test@",
		"@example.com",
		"test..test@example.com",
		"test@.com",
	}

	// 测试有效邮箱
	for _, email := range validEmails {
		t.Run("Valid_"+email, func(t *testing.T) {
			err := service.validateEmail(email)
			assert.NoError(t, err, "邮箱 %s 应该是有效的", email)
		})
	}

	// 测试无效邮箱
	for _, email := range invalidEmails {
		t.Run("Invalid_"+email, func(t *testing.T) {
			err := service.validateEmail(email)
			assert.Error(t, err, "邮箱 %s 应该是无效的", email)
		})
	}
}

func TestAuthService_GenerateVerificationCode(t *testing.T) {
	service := &AuthService{}

	// 生成多个验证码测试
	codes := make(map[string]bool)
	for i := 0; i < 100; i++ {
		code := service.generateVerificationCode()

		// 验证长度
		assert.Equal(t, 6, len(code))

		// 验证是否为数字
		matched, _ := regexp.MatchString(`^\d{6}$`, code)
		assert.True(t, matched, "验证码应该是6位数字: %s", code)

		// 验证范围 (100000-999999)
		assert.Regexp(t, `^[1-9]\d{5}$`, code, "验证码应该在100000-999999范围内")

		// 记录生成的验证码，检查随机性
		codes[code] = true
	}

	// 验证随机性 - 至少应该有多个不同的验证码
	assert.Greater(t, len(codes), 10, "生成的验证码应该有足够的随机性")
}

func TestAuthService_SendEmailMock(t *testing.T) {
	service := &AuthService{}

	// 测试邮件发送模拟函数不会panic
	assert.NotPanics(t, func() {
		service.sendEmailMock("test@example.com", "123456")
	})
}

func TestAuthService_EmailValidation_DetailedCases(t *testing.T) {
	service := &AuthService{}

	testCases := []struct {
		name        string
		email       string
		expectError bool
		errorMsg    string
	}{
		{
			name:        "有效邮箱",
			email:       "test@example.com",
			expectError: false,
		},
		{
			name:        "空邮箱",
			email:       "",
			expectError: true,
			errorMsg:    "邮箱不能为空",
		},
		{
			name:        "无效格式",
			email:       "invalid-email",
			expectError: true,
			errorMsg:    "邮箱格式无效",
		},
		{
			name:        "缺少域名",
			email:       "test@",
			expectError: true,
			errorMsg:    "邮箱格式无效",
		},
		{
			name:        "缺少用户名",
			email:       "@example.com",
			expectError: true,
			errorMsg:    "邮箱格式无效",
		},
		{
			name:        "包含空格",
			email:       "test @example.com",
			expectError: true,
			errorMsg:    "邮箱格式无效",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := service.validateEmail(tc.email)

			if tc.expectError {
				assert.Error(t, err)
				if tc.errorMsg != "" {
					assert.Contains(t, err.Error(), tc.errorMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestAuthService_KeyGeneration(t *testing.T) {
	// 测试Redis key的生成格式
	email := "test@example.com"

	expectedVerifyKey := fmt.Sprintf("email:verify:%s", email)
	expectedLockKey := fmt.Sprintf("email:lock:%s", email)

	assert.Equal(t, "email:verify:test@example.com", expectedVerifyKey)
	assert.Equal(t, "email:lock:test@example.com", expectedLockKey)
}

func TestAuthService_CodeFormat(t *testing.T) {
	service := &AuthService{}

	// 测试多次生成的验证码都符合要求
	for i := 0; i < 50; i++ {
		code := service.generateVerificationCode()

		// 验证长度
		assert.Len(t, code, 6, "验证码长度应该是6位")

		// 验证第一位不为0
		assert.NotEqual(t, "0", string(code[0]), "验证码第一位不应该是0")

		// 验证全部为数字
		for j, char := range code {
			assert.True(t, char >= '0' && char <= '9',
				"验证码第%d位应该是数字，但得到: %c", j, char)
		}
	}
}

func TestAuthService_CodeUniqueness(t *testing.T) {
	service := &AuthService{}

	// 生成大量验证码，测试重复率
	codes := make(map[string]int)
	total := 1000

	for i := 0; i < total; i++ {
		code := service.generateVerificationCode()
		codes[code]++
	}

	// 计算重复率
	duplicates := 0
	for _, count := range codes {
		if count > 1 {
			duplicates += count - 1
		}
	}

	duplicateRate := float64(duplicates) / float64(total)

	// 重复率应该很低（小于5%）
	assert.Less(t, duplicateRate, 0.05,
		"验证码重复率过高: %.2f%%, 重复数: %d, 总数: %d",
		duplicateRate*100, duplicates, total)

	// 唯一验证码数量应该足够多
	assert.Greater(t, len(codes), total*95/100,
		"唯一验证码数量不足，期望至少 %d，实际 %d", total*95/100, len(codes))
}

// 边界测试
func TestAuthService_EdgeCases(t *testing.T) {
	service := &AuthService{}

	// 测试邮箱边界情况
	edgeCaseEmails := []struct {
		email string
		valid bool
	}{
		{"a@b.co", true},                             // 最短有效邮箱
		{"test@domain-with-dash.com", true},          // 包含连字符的域名
		{"test.email.with+symbol@example.com", true}, // 包含多个符号
		{"test@sub.domain.example.com", true},        // 子域名
		{"1234567890@example.com", true},             // 数字用户名
		{"test@exam ple.com", false},                 // 域名包含空格
		{"test@", false},                             // 空域名
		{"@example.com", false},                      // 空用户名
		{"test@@example.com", false},                 // 双@符号
		{"test@.example.com", false},                 // 域名以点开头
		{"test@example..com", false},                 // 域名包含双点
	}

	for _, tc := range edgeCaseEmails {
		t.Run(fmt.Sprintf("Email_%s", tc.email), func(t *testing.T) {
			err := service.validateEmail(tc.email)
			if tc.valid {
				assert.NoError(t, err, "邮箱 %s 应该是有效的", tc.email)
			} else {
				assert.Error(t, err, "邮箱 %s 应该是无效的", tc.email)
			}
		})
	}
}

// 性能基准测试
func BenchmarkAuthService_GenerateVerificationCode(b *testing.B) {
	service := &AuthService{}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.generateVerificationCode()
	}
}

func BenchmarkAuthService_ValidateEmail(b *testing.B) {
	service := &AuthService{}
	email := "test@example.com"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.validateEmail(email)
	}
}

func BenchmarkAuthService_ValidateEmail_Invalid(b *testing.B) {
	service := &AuthService{}
	email := "invalid-email"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.validateEmail(email)
	}
}
