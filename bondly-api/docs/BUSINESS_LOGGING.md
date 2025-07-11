# Bondly API 业务日志规范

## 概述

本文档定义了Bondly API项目中统一的业务日志输出规范，确保所有API接口的关键业务路径都有完整的日志记录，便于问题排查、性能监控和业务分析。

## 日志工具

### BusinessLogger

项目提供了统一的业务日志工具 `BusinessLogger`，位于 `internal/logger/business_logger.go`。

```go
import loggerpkg "bondly-api/internal/logger"

// 创建业务日志工具
bizLog := loggerpkg.NewBusinessLogger(ctx)
```

### 核心特性

- **自动trace-id**: 通过context自动获取trace-id，支持分布式追踪
- **结构化日志**: 使用JSON格式，便于日志分析和查询
- **敏感信息脱敏**: 自动处理敏感数据，避免泄露
- **统一字段**: 标准化的日志字段，便于监控和分析

## 日志规范

### 1. 接口开始日志

每个API接口开始时必须记录：

```go
// 记录接口开始
bizLog.StartAPI("POST", "/api/v1/auth/login", userID, walletAddress, params)
```

**字段说明：**
- `method`: HTTP方法
- `path`: 接口路径
- `user_id`: 用户ID（可选）
- `wallet`: 钱包地址（可选）
- `params`: 关键参数（可选）

### 2. 参数校验失败

参数校验失败时使用Warn级别：

```go
bizLog.ValidationFailed("email", "邮箱格式错误", email)
```

**字段说明：**
- `validation_failed`: 标识校验失败
- `failed_field`: 失败的字段名
- `reason`: 失败原因
- `value`: 失败的值（注意脱敏）

### 3. 数据库操作失败

数据库操作失败时使用Error级别：

```go
bizLog.DatabaseError("select", "users", "SELECT BY ID", err)
```

**字段说明：**
- `error_type`: "database"
- `operation`: 操作类型（select/insert/update/delete）
- `table`: 表名
- `query`: 查询类型描述
- `error`: 错误信息

### 4. 第三方服务失败

第三方服务调用失败时使用Error级别：

```go
bizLog.ThirdPartyError("email_service", "send_verification_code", params, err)
```

**字段说明：**
- `error_type`: "third_party"
- `service`: 服务名称
- `operation`: 操作名称
- `params`: 调用参数
- `error`: 错误信息

### 5. 操作成功

操作成功时使用Info级别：

```go
bizLog.Success("user_created", map[string]interface{}{
    "user_id": userID,
    "email": email,
})
```

**字段说明：**
- `action`: 操作名称
- `result`: 操作结果（可选）

### 6. 缓存操作

缓存相关操作使用Debug级别：

```go
bizLog.CacheHit(cacheKey, "user")
bizLog.CacheMiss(cacheKey, "user")
bizLog.CacheSet(cacheKey, "user", "30m")
```

### 7. 便捷方法

提供了一些常用的便捷方法：

```go
// 用户相关
bizLog.UserNotFound("user_id", userID)
bizLog.UserCreated(userID, email, wallet)
bizLog.UserUpdated(userID, updatedFields)

// 钱包相关
bizLog.WalletGenerated(userID, walletAddress)
bizLog.WalletBound(userID, walletAddress)

// 文件相关
bizLog.FileUploaded(fileName, fileSize, fileType, accessURL)

// 邮件相关
bizLog.EmailSent(to, subject, template)
bizLog.CodeSent(email, expiresIn)
bizLog.CodeVerified(email)

// 登录相关
bizLog.LoginSuccess(userID, email, isNewUser)
```

## 使用示例

### 完整的API接口示例

```go
func (h *UserHandlers) GetUserByID(c *gin.Context) {
    // 创建业务日志工具
    bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
    
    // 记录接口开始
    bizLog.StartAPI("GET", "/api/v1/users/{id}", nil, "", nil)

    idStr := c.Param("id")
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
        response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
        return
    }

    // 记录关键参数
    bizLog.BusinessLogic("参数处理", map[string]interface{}{
        "user_id": id,
    })

    user, err := h.userService.GetUserByID(c.Request.Context(), int64(id))
    if err != nil {
        bizLog.UserNotFound("user_id", id)
        response.Fail(c, response.CodeInvalidParams, err.Error())
        return
    }

    // 获取用户成功
    bizLog.Success("get_user_by_id", map[string]interface{}{
        "user_id": user.ID,
        "email": user.Email,
        "nickname": user.Nickname,
    })

    data := h.buildUserResponse(user)
    response.OK(c, data, response.MsgUserRetrieved)
}
```

### 服务层示例

```go
func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
    bizLog := loggerpkg.NewBusinessLogger(ctx)
    
    bizLog.BusinessLogic("创建用户开始", map[string]interface{}{
        "email": user.Email,
        "wallet_address": user.WalletAddress,
        "nickname": user.Nickname,
    })

    // 检查邮箱是否已存在
    if user.Email != nil {
        exists, err := s.userRepo.ExistsByEmail(*user.Email)
        if err != nil {
            bizLog.DatabaseError("select", "users", "SELECT EXISTS", err)
            return errors.NewInternalError(fmt.Errorf("%s: %w", response.MsgEmailCheckFailed, err))
        }
        if exists {
            bizLog.ValidationFailed("email", "邮箱已存在", *user.Email)
            return errors.NewUserAlreadyExistsError()
        }
    }

    // 创建用户
    if err := s.userRepo.Create(user); err != nil {
        bizLog.DatabaseError("insert", "users", "INSERT", err)
        return errors.NewUserCreateFailedError(err)
    }

    bizLog.UserCreated(user.ID, *user.Email, *user.WalletAddress)
    return nil
}
```

## 敏感信息处理

### 需要脱敏的信息

- **密码**: 不记录原始密码
- **验证码**: 只记录长度，不记录具体值
- **私钥**: 不记录任何私钥信息
- **Token**: 不记录完整的JWT token
- **身份证号**: 只记录部分信息

### 脱敏示例

```go
// 验证码脱敏
bizLog.BusinessLogic("参数处理", map[string]interface{}{
    "email": req.Email,
    "code_length": len(req.Code), // 只记录长度
})

// 密码脱敏
bizLog.SensitiveDataMasked("password", len(password))
```

## 日志级别

- **Debug**: 详细的调试信息，缓存操作
- **Info**: 正常的业务操作，接口开始/结束
- **Warn**: 参数校验失败，业务警告
- **Error**: 数据库错误，第三方服务错误，系统错误

## 监控和告警

### 关键指标

- 接口响应时间
- 错误率
- 缓存命中率
- 数据库连接状态
- 第三方服务可用性

### 告警规则

- 错误率 > 5%
- 响应时间 > 2秒
- 数据库连接失败
- 第三方服务不可用

## 最佳实践

1. **统一使用BusinessLogger**: 不要直接使用logrus
2. **记录关键业务节点**: 每个重要操作都要有日志
3. **避免过度日志**: 不要记录无意义的调试信息
4. **结构化数据**: 使用map[string]interface{}记录复杂数据
5. **错误信息完整**: 包含足够的上下文信息
6. **性能考虑**: 避免在日志中执行复杂计算

## 日志查看

### 本地开发

```bash
# 查看所有日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 查看特定trace-id的日志
grep "trace_id:xxx" logs/app.log
```

### 生产环境

- 使用ELK Stack或类似工具
- 配置日志聚合和分析
- 设置告警规则
- 定期清理旧日志

## 更新日志

- 2024-01-XX: 初始版本，定义基本规范
- 2024-01-XX: 添加BusinessLogger工具
- 2024-01-XX: 完善使用示例和最佳实践 