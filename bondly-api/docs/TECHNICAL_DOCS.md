# Bondly Technical Documentation

## 📋 Table of Contents

- [Database Architecture](#database-architecture)
- [Business Logging Standards](#business-logging-standards)
- [Email Service Configuration](#email-service-configuration)
- [Script Tools](#script-tools)

---

## 🗄️ Database Architecture

### Database Overview

- **Database Name**: bondly_db
- **Database Type**: PostgreSQL 15+
- **Total Tables**: 11 tables
- **Character Set**: UTF-8
- **Time Zone**: Asia/Shanghai

### Table Structure Details

#### 1. **users Table** (User Table)

**Table Description**: Stores basic user information, supports both email and wallet login

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

#### 2. **posts Table** (Article Table - New Version)

**Table Description**: Stores user-published article content, the main content management table

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

#### 3. **contents Table** (Content Table - Compatible with Old Version)

**Table Description**: Legacy content table for compatibility, recommend using posts table for new features

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

#### 4. **comments Table** (Comment Table)

**Table Description**: Stores article comments, supports nested comment structure

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

#### 5. **content_interactions Table** (Content Interaction Table)

**Table Description**: Stores user interaction behaviors with content

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

#### 6. **user_followers Table** (User Follow Relationship Table)

**Table Description**: Stores follow relationships between users

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

#### 7. **wallet_bindings Table** (Wallet Binding Table)

**Table Description**: Stores user's bound multi-network wallet addresses

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

#### 8. **proposals Table** (Proposal Table)

**Table Description**: Stores governance proposal information

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

#### 9. **votes Table** (Vote Table)

**Table Description**: Stores user voting records for proposals

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

#### 10. **transactions Table** (Transaction Table)

**Table Description**: Stores blockchain transaction records

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

#### 11. **airdrop_records Table** (Airdrop Record Table)

**Table Description**: Stores user airdrop records and status

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

### Table Relationship Diagram

```
users (User Table)
├── 1:N posts (Article Table) - author_id
├── 1:N comments (Comment Table) - author_id
├── 1:N contents (Content Table) - author_id
├── 1:N content_interactions (Content Interaction Table) - user_id
├── 1:N proposals (Proposal Table) - proposer_id
├── 1:N votes (Vote Table) - voter_id
├── 1:N wallet_bindings (Wallet Binding Table) - user_id
├── 1:N user_followers (Follow Relationship Table) - follower_id
├── 1:N user_followers (Follow Relationship Table) - followed_id
└── 1:N airdrop_records (Airdrop Record Table) - user_id

posts (Article Table)
└── 1:N comments (Comment Table) - post_id

comments (Comment Table)
└── 1:N comments (Nested Comments) - parent_comment_id

contents (Content Table)
└── 1:N content_interactions (Content Interaction Table) - content_id

proposals (Proposal Table)
└── 1:N votes (Vote Table) - proposal_id

transactions (Transaction Table) - Independent table, records blockchain transactions
airdrop_records (Airdrop Record Table) - Independent table, records user airdrops
```

### Database Tools

#### View Table Structure
```bash
# Run table structure viewer
go run cmd/read-schema/main.go
```

#### Database Migration
```bash
# Run database migration
go run cmd/migrate/main.go
```

#### Data Seeding
```bash
# Seed test data
go run cmd/seed-data/main.go
```

#### Backup and Restore
```bash
# Backup database
pg_dump -h localhost -U postgres bondly_db > backup.sql

# Restore database
psql -h localhost -U postgres bondly_db < backup.sql
```

### Performance Optimization Recommendations

#### Index Optimization
- Add indexes for frequently queried fields
- Consider composite indexes for multi-field queries
- Regularly analyze index usage

#### Query Optimization
- Use pagination queries appropriately
- Avoid N+1 query problems
- Use appropriate JOIN strategies

#### Data Maintenance
- Monitor table size and growth trends
- Regularly update statistics
- Clean up expired data

---

## 📝 Business Logging Standards

### Overview

The Bondly API project uses a unified business logging tool `BusinessLogger` to ensure all critical business operations have complete log records for troubleshooting and business analysis.

### Core Tools

#### BusinessLogger
```go
import loggerpkg "bondly-api/internal/logger"

// Create business logging tool
bizLog := loggerpkg.NewBusinessLogger(ctx)
```

**Features**:
- Automatic trace-id tracking
- Structured JSON logs
- Sensitive information masking
- Unified field standards

### Log Methods

#### 1. Basic Methods

```go
// API start
bizLog.StartAPI("POST", "/api/v1/auth/login", userID, walletAddress, params)

// Parameter validation failed
bizLog.ValidationFailed("email", "Invalid email format", email)

// Database error
bizLog.DatabaseError("select", "users", "SELECT BY ID", err)

// Third-party service error
bizLog.ThirdPartyError("email_service", "send_code", params, err)

// Operation successful
bizLog.Success("user_created", result)

// Cache operations
bizLog.CacheHit(cacheKey, "user")
bizLog.CacheMiss(cacheKey, "user")
bizLog.CacheSet(cacheKey, "user", "30m")
```

#### 2. Business Methods

```go
// Content related
bizLog.ContentCreated(contentID, authorID, title)
bizLog.ContentRetrieved(contentID, userID)
bizLog.ContentUpdated(contentID, authorID, fields)

// Content interaction related
bizLog.ContentInteractionCreated(contentID, userID, interactionType)
bizLog.ContentInteractionRemoved(contentID, userID, interactionType)

// User related
bizLog.UserRegistered(userID, walletAddress, email)
bizLog.UserLoggedIn(userID, loginMethod)
bizLog.UserProfileUpdated(userID, fields)

// Wallet related
bizLog.WalletBound(userID, walletAddress, network)
bizLog.WalletUnbound(userID, walletAddress)
```

#### 3. Convenient Methods

```go
// Quick logging
bizLog.Info("operation", "user_action", map[string]interface{}{
    "user_id": userID,
    "action": "like_content",
    "content_id": contentID,
})

// Error logging
bizLog.Error("operation", "database_error", err, map[string]interface{}{
    "table": "users",
    "operation": "insert",
})
```

### Usage Examples

#### User Registration
```go
func (h *AuthHandlers) Register(c *gin.Context) {
    ctx := c.Request.Context()
    bizLog := loggerpkg.NewBusinessLogger(ctx)
    
    // Start API call
    bizLog.StartAPI("POST", "/api/v1/auth/register", 0, "", params)
    
    // Parameter validation
    if err := validateParams(params); err != nil {
        bizLog.ValidationFailed("params", err.Error(), params)
        return
    }
    
    // Create user
    user, err := h.authService.Register(ctx, params)
    if err != nil {
        bizLog.DatabaseError("insert", "users", "CREATE USER", err)
        return
    }
    
    // Log success
    bizLog.UserRegistered(user.ID, user.WalletAddress, user.Email)
    bizLog.Success("user_created", user)
}
```

#### Content Creation
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

### Log Viewing

#### View Business Logs
```bash
# View all business logs
tail -f logs/business.log | jq

# View specific user operations
tail -f logs/business.log | jq 'select(.user_id == "123")'

# View error logs
tail -f logs/business.log | jq 'select(.level == "error")'
```

#### Log Field Description
- `timestamp`: Log timestamp
- `level`: Log level (info/error/warn)
- `trace_id`: Request trace ID
- `operation`: Operation type
- `action`: Specific action
- `user_id`: User ID
- `wallet_address`: Wallet address
- `params`: Operation parameters
- `result`: Operation result
- `error`: Error information

---

## 📧 Email Service Configuration

### Overview

Bondly API supports multiple email service providers, currently mainly using Resend service.

### Configuration

#### Environment Variables
```env
EMAIL_PROVIDER=resend
EMAIL_RESEND_KEY=your-resend-api-key
EMAIL_FROM_EMAIL=noreply@bondly.com
```

#### Supported Providers
- **Resend**: Recommended, API-friendly, fast sending
- **Mock**: For development testing, no actual email sending

### Usage Examples

#### Send Verification Code
```go
emailService := services.NewEmailService(emailSender)

err := emailService.SendVerificationCode(
    ctx,
    "user@example.com",
    "123456",
)
```

#### Send Notification
```go
err := emailService.SendNotification(
    ctx,
    "user@example.com",
    "Content Liked",
    "Your content received a new like!",
)
```

### Email Templates

#### Verification Code Email
```html
<h2>Bondly Verification Code</h2>
<p>Your verification code is: <strong>{{.Code}}</strong></p>
<p>The code is valid for 5 minutes.</p>
```

#### Notification Email
```html
<h2>{{.Title}}</h2>
<p>{{.Content}}</p>
<p>Thank you for using Bondly!</p>
```

---

## 🛠️ Script Tools

### Database Scripts

#### Migration Scripts
```bash
# Run all migrations
go run cmd/migrate/main.go

# View table structure
go run cmd/read-schema/main.go
```

#### Data Seeding Scripts
```bash
# Seed test data
go run cmd/seed-data/main.go
```

### Test Scripts

#### Airdrop Testing
```bash
# Test airdrop functionality
go run cmd/test-airdrop/main.go
```

### Script Directory Structure

```
cmd/
├── migrate/           # Database migration
│   ├── main.go
│   ├── add_airdrop_tables.sql
│   ├── add_cover_image_url.sql
│   └── remove_old_interaction_tables.sql
├── read-schema/       # Table structure viewer
│   └── main.go
├── seed-data/         # Data seeding
│   └── main.go
└── test-airdrop/      # Airdrop testing
    └── main.go
```

### Script Usage Instructions

#### Migration Scripts
- Automatically create/update database table structure
- Execute in dependency order
- Support rollback operations

#### Data Seeding Scripts
- Create test users and content
- Generate mock data
- Support custom data volume

#### Table Structure Viewer Scripts
- Display detailed information of all tables
- Include fields, indexes, constraints
- Facilitate database structure analysis

---

**Document Version**: v1.0 | **Last Updated**: December 2024