# Bondly 技术文档

## 📋 目录

- [数据库架构](#数据库架构)
- [业务日志规范](#业务日志规范)
- [邮件服务配置](#邮件服务配置)
- [脚本工具](#脚本工具)

---

## 🗄️ 数据库架构

### 数据库概览

- **数据库名**: bondly_db
- **数据库类型**: PostgreSQL 15+
- **总表数**: 11个表
- **字符集**: UTF-8
- **时区**: Asia/Shanghai

### 表结构详情

#### 1. **users 表** (用户表)

**表描述**: 存储用户基本信息，支持邮箱和钱包双重登录

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(64) NOT NULL DEFAULT 'Anonymous',
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    reputation_score BIGINT NOT NULL DEFAULT 0,
    wallet_address VARCHAR(42) UNIQUE,
    custody_wallet_address VARCHAR(42),
    encrypted_private_key TEXT,
    has_received_airdrop BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:
- `id`: 用户唯一标识，自增主键
- `email`: 用户邮箱地址，用于邮箱登录，可选
- `wallet_address`: 用户绑定的钱包地址，42位以太坊地址格式，可选
- `nickname`: 用户昵称，不能为空，默认"Anonymous"
- `avatar_url`: 用户头像链接，可为空
- `bio`: 用户个人简介，可为空
- `role`: 用户角色，默认"user"，可选值：user/admin/moderator
- `reputation_score`: 声誉积分，默认0，用于治理投票权重
- `custody_wallet_address`: 托管钱包地址，可为空
- `encrypted_private_key`: 加密的私钥，可为空
- `has_received_airdrop`: 是否已获得新用户空投，默认false
- `last_login_at`: 最后登录时间
- `created_at`: 账户创建时间
- `updated_at`: 信息更新时间

#### 2. **posts 表** (文章表 - 新版)

**表描述**: 存储用户发布的文章内容，是主要的内容管理表

```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    likes BIGINT NOT NULL DEFAULT 0,
    views BIGINT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### 3. **contents 表** (内容表 - 兼容旧版)

**表描述**: 旧版内容表，用于兼容性，建议新功能使用posts表

```sql
CREATE TABLE contents (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT,
    title TEXT,
    content TEXT,
    type TEXT,
    status TEXT DEFAULT 'draft',
    cover_image_url TEXT,
    likes BIGINT DEFAULT 0,
    dislikes BIGINT DEFAULT 0,
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### 4. **comments 表** (评论表)

**表描述**: 存储文章评论，支持嵌套评论结构

```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT,
    author_id BIGINT,
    content TEXT,
    parent_comment_id BIGINT,
    likes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);
```

#### 5. **content_interactions 表** (内容互动表)

**表描述**: 存储用户对内容的互动行为

```sql
CREATE TABLE content_interactions (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT,
    user_id BIGINT,
    interaction_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (content_id) REFERENCES contents(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 6. **user_followers 表** (用户关注关系表)

**表描述**: 存储用户之间的关注关系

```sql
CREATE TABLE user_followers (
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (followed_id) REFERENCES users(id)
);
```

#### 7. **wallet_bindings 表** (钱包绑定表)

**表描述**: 存储用户绑定的多网络钱包地址

```sql
CREATE TABLE wallet_bindings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    wallet_address TEXT,
    network TEXT DEFAULT 'ethereum',
    created_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 8. **proposals 表** (提案表)

**表描述**: 存储治理提案信息

```sql
CREATE TABLE proposals (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    proposer_id BIGINT,
    status TEXT DEFAULT 'active',
    votes_for BIGINT DEFAULT 0,
    votes_against BIGINT DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (proposer_id) REFERENCES users(id)
);
```

#### 9. **votes 表** (投票表)

**表描述**: 存储用户对提案的投票记录

```sql
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT,
    voter_id BIGINT,
    vote BOOLEAN,
    weight BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    FOREIGN KEY (voter_id) REFERENCES users(id)
);
```

#### 10. **transactions 表** (交易表)

**表描述**: 存储区块链交易记录

```sql
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    hash TEXT UNIQUE,
    from_address TEXT,
    to_address TEXT,
    value TEXT,
    gas_used BIGINT,
    gas_price TEXT,
    status TEXT,
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

#### 11. **airdrop_records 表** (空投记录表)

**表描述**: 存储用户空投记录和状态

```sql
CREATE TABLE airdrop_records (
    id INTEGER PRIMARY KEY DEFAULT nextval('airdrop_records_id_seq'),
    user_id INTEGER NOT NULL,
    wallet_address VARCHAR NOT NULL,
    amount VARCHAR NOT NULL,
    tx_hash VARCHAR,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 表关系图

```
users (用户表)
├── 1:N posts (文章表) - author_id
├── 1:N comments (评论表) - author_id
├── 1:N contents (内容表) - author_id
├── 1:N content_interactions (内容互动表) - user_id
├── 1:N proposals (提案表) - proposer_id
├── 1:N votes (投票表) - voter_id
├── 1:N wallet_bindings (钱包绑定表) - user_id
├── 1:N user_followers (关注关系表) - follower_id
├── 1:N user_followers (关注关系表) - followed_id
└── 1:N airdrop_records (空投记录表) - user_id

posts (文章表)
└── 1:N comments (评论表) - post_id

comments (评论表)
└── 1:N comments (嵌套评论) - parent_comment_id

contents (内容表)
└── 1:N content_interactions (内容互动表) - content_id

proposals (提案表)
└── 1:N votes (投票表) - proposal_id

transactions (交易表) - 独立表，记录区块链交易
airdrop_records (空投记录表) - 独立表，记录用户空投
```

### 数据库工具

#### 查看表结构
```bash
# 运行表结构查看工具
go run cmd/read-schema/main.go
```

#### 数据库迁移
```bash
# 运行数据库迁移
go run cmd/migrate/main.go
```

#### 数据填充
```bash
# 填充测试数据
go run cmd/seed-data/main.go
```

#### 备份和恢复
```bash
# 备份数据库
pg_dump -h localhost -U postgres bondly_db > backup.sql

# 恢复数据库
psql -h localhost -U postgres bondly_db < backup.sql
```

### 性能优化建议

#### 索引优化
- 为经常查询的字段添加索引
- 考虑复合索引优化多字段查询
- 定期分析索引使用情况

#### 查询优化
- 合理使用分页查询
- 避免N+1查询问题
- 使用适当的JOIN策略

#### 数据维护
- 监控表大小和增长趋势
- 定期更新统计信息
- 清理过期数据

---

## 📝 业务日志规范

### 概述

Bondly API项目使用统一的业务日志工具`BusinessLogger`，确保所有关键业务操作都有完整的日志记录，便于问题排查和业务分析。

### 核心工具

#### BusinessLogger
```go
import loggerpkg "bondly-api/internal/logger"

// 创建业务日志工具
bizLog := loggerpkg.NewBusinessLogger(ctx)
```

**特性：**
- 自动trace-id追踪
- 结构化JSON日志
- 敏感信息脱敏
- 统一字段规范

### 日志方法

#### 1. 基础方法

```go
// 接口开始
bizLog.StartAPI("POST", "/api/v1/auth/login", userID, walletAddress, params)

// 参数校验失败
bizLog.ValidationFailed("email", "邮箱格式错误", email)

// 数据库错误
bizLog.DatabaseError("select", "users", "SELECT BY ID", err)

// 第三方服务错误
bizLog.ThirdPartyError("email_service", "send_code", params, err)

// 操作成功
bizLog.Success("user_created", result)

// 缓存操作
bizLog.CacheHit(cacheKey, "user")
bizLog.CacheMiss(cacheKey, "user")
bizLog.CacheSet(cacheKey, "user", "30m")
```

#### 2. 业务方法

```go
// 内容相关
bizLog.ContentCreated(contentID, authorID, title)
bizLog.ContentRetrieved(contentID, userID)
bizLog.ContentUpdated(contentID, authorID, fields)

// 内容互动相关
bizLog.ContentInteractionCreated(contentID, userID, interactionType)
bizLog.ContentInteractionRemoved(contentID, userID, interactionType)

// 用户相关
bizLog.UserRegistered(userID, walletAddress, email)
bizLog.UserLoggedIn(userID, loginMethod)
bizLog.UserProfileUpdated(userID, fields)

// 钱包相关
bizLog.WalletBound(userID, walletAddress, network)
bizLog.WalletUnbound(userID, walletAddress)
```

#### 3. 便捷方法

```go
// 快速记录
bizLog.Info("operation", "user_action", map[string]interface{}{
    "user_id": userID,
    "action": "like_content",
    "content_id": contentID,
})

// 错误记录
bizLog.Error("operation", "database_error", err, map[string]interface{}{
    "table": "users",
    "operation": "insert",
})
```

### 使用示例

#### 用户注册
```go
func (h *AuthHandlers) Register(c *gin.Context) {
    ctx := c.Request.Context()
    bizLog := loggerpkg.NewBusinessLogger(ctx)
    
    // 开始API调用
    bizLog.StartAPI("POST", "/api/v1/auth/register", 0, "", params)
    
    // 参数校验
    if err := validateParams(params); err != nil {
        bizLog.ValidationFailed("params", err.Error(), params)
        return
    }
    
    // 创建用户
    user, err := h.authService.Register(ctx, params)
    if err != nil {
        bizLog.DatabaseError("insert", "users", "CREATE USER", err)
        return
    }
    
    // 记录成功
    bizLog.UserRegistered(user.ID, user.WalletAddress, user.Email)
    bizLog.Success("user_created", user)
}
```

#### 内容创建
```go
func (h *ContentHandlers) CreateContent(c *gin.Context) {
    ctx := c.Request.Context()
    bizLog := loggerpkg.NewBusinessLogger(ctx)
    
    userID := getUserID(c)
    bizLog.StartAPI("POST", "/api/v1/contents", userID, "", params)
    
    content, err := h.contentService.Create(ctx, userID, params)
    if err != nil {
        bizLog.DatabaseError("insert", "contents", "CREATE CONTENT", err)
        return
    }
    
    bizLog.ContentCreated(content.ID, userID, content.Title)
    bizLog.Success("content_created", content)
}
```

### 日志查看

#### 查看业务日志
```bash
# 查看所有业务日志
tail -f logs/business.log | jq

# 查看特定用户的操作
tail -f logs/business.log | jq 'select(.user_id == "123")'

# 查看错误日志
tail -f logs/business.log | jq 'select(.level == "error")'
```

#### 日志字段说明
- `timestamp`: 日志时间戳
- `level`: 日志级别 (info/error/warn)
- `trace_id`: 请求追踪ID
- `operation`: 操作类型
- `action`: 具体动作
- `user_id`: 用户ID
- `wallet_address`: 钱包地址
- `params`: 操作参数
- `result`: 操作结果
- `error`: 错误信息

---

## 📧 邮件服务配置

### 概述

Bondly API支持多种邮件服务提供商，目前主要使用Resend服务。

### 配置

#### 环境变量
```env
EMAIL_PROVIDER=resend
EMAIL_RESEND_KEY=your-resend-api-key
EMAIL_FROM_EMAIL=noreply@bondly.com
```

#### 支持的提供商
- **Resend**: 推荐使用，API友好，发送速度快
- **Mock**: 开发测试用，不实际发送邮件

### 使用示例

#### 发送验证码
```go
emailService := services.NewEmailService(emailSender)

err := emailService.SendVerificationCode(
    ctx,
    "user@example.com",
    "123456",
)
```

#### 发送通知
```go
err := emailService.SendNotification(
    ctx,
    "user@example.com",
    "内容被点赞",
    "您的内容获得了新的点赞！",
)
```

### 邮件模板

#### 验证码邮件
```html
<h2>Bondly 验证码</h2>
<p>您的验证码是：<strong>{{.Code}}</strong></p>
<p>验证码有效期为5分钟。</p>
```

#### 通知邮件
```html
<h2>{{.Title}}</h2>
<p>{{.Content}}</p>
<p>感谢使用 Bondly！</p>
```

---

## 🛠️ 脚本工具

### 数据库脚本

#### 迁移脚本
```bash
# 运行所有迁移
go run cmd/migrate/main.go

# 查看表结构
go run cmd/read-schema/main.go
```

#### 数据填充脚本
```bash
# 填充测试数据
go run cmd/seed-data/main.go
```

### 测试脚本

#### 空投测试
```bash
# 测试空投功能
go run cmd/test-airdrop/main.go
```

### 脚本目录结构

```
cmd/
├── migrate/           # 数据库迁移
│   ├── main.go
│   ├── add_airdrop_tables.sql
│   ├── add_cover_image_url.sql
│   └── remove_old_interaction_tables.sql
├── read-schema/       # 表结构查看
│   └── main.go
├── seed-data/         # 数据填充
│   └── main.go
└── test-airdrop/      # 空投测试
    └── main.go
```

### 脚本使用说明

#### 迁移脚本
- 自动创建/更新数据库表结构
- 按依赖关系顺序执行
- 支持回滚操作

#### 数据填充脚本
- 创建测试用户和内容
- 生成模拟数据
- 支持自定义数据量

#### 表结构查看脚本
- 显示所有表的详细信息
- 包含字段、索引、约束
- 便于数据库结构分析

---

**文档版本**: v1.0 | **最后更新**: 2024年12月