# Bondly 数据库表结构文档

## 📊 数据库概览

- **数据库名**: bondly_db
- **数据库类型**: PostgreSQL 15+
- **总表数**: 9个表
- **字符集**: UTF-8
- **时区**: Asia/Shanghai

## 🗂️ 表结构详情

### 1. **users 表** (用户表)

**表描述**: 存储用户基本信息，支持邮箱和钱包双重登录

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(255) NOT NULL DEFAULT 'user',
    reputation_score BIGINT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    custody_wallet_address VARCHAR(42),
    encrypted_private_key TEXT
);
```

**字段说明**:
- `id`: 用户唯一标识，自增主键
- `wallet_address`: 用户绑定的钱包地址，42位以太坊地址格式
- `email`: 用户邮箱地址，用于邮箱登录
- `nickname`: 用户昵称，不能为空，默认"Anonymous"
- `avatar_url`: 用户头像链接
- `bio`: 用户个人简介
- `role`: 用户角色，默认"user"，可选值：user/admin/moderator
- `reputation_score`: 声誉积分，默认0，用于治理投票权重
- `last_login_at`: 最后登录时间
- `created_at`: 账户创建时间
- `updated_at`: 信息更新时间
- `custody_wallet_address`: 托管钱包地址
- `encrypted_private_key`: 加密的私钥

**约束**:
```sql
CHECK (char_length(wallet_address) = 42)
CHECK (char_length(custody_wallet_address) = 42)
CHECK (position('@' in email) > 1)
CHECK (char_length(nickname) > 0)
CHECK (role IN ('user', 'admin', 'moderator'))
CHECK (reputation_score >= 0)
```

**索引**:
```sql
UNIQUE INDEX idx_users_wallet_address (wallet_address)
UNIQUE INDEX idx_users_email (email)
```

### 2. **posts 表** (文章表)

**表描述**: 存储用户发布的文章内容，是主要的内容管理表

```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**字段说明**:
- `id`: 文章唯一标识，自增主键
- `author_id`: 作者ID，关联users表
- `title`: 文章标题，不能为空
- `content`: 文章内容，不能为空
- `cover_image_url`: 封面图片链接
- `tags`: 文章标签，数组类型
- `likes`: 点赞数，默认0
- `views`: 浏览量，默认0
- `is_published`: 是否发布，默认true
- `created_at`: 创建时间
- `updated_at`: 更新时间

**约束**:
```sql
CHECK (char_length(title) > 0)
CHECK (char_length(content) > 0)
CHECK (likes >= 0)
CHECK (views >= 0)
```

**索引**:
```sql
INDEX idx_posts_author (author_id)
INDEX idx_posts_created_at (created_at)
INDEX idx_posts_is_published (is_published)
```

### 3. **comments 表** (评论表)

**表描述**: 存储文章评论，支持嵌套评论结构

```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id BIGINT,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);
```

**字段说明**:
- `id`: 评论唯一标识，自增主键
- `post_id`: 所属文章ID，关联posts表
- `author_id`: 评论作者ID，关联users表
- `content`: 评论内容，不能为空
- `parent_comment_id`: 父评论ID，用于嵌套评论
- `likes`: 点赞数，默认0
- `created_at`: 创建时间
- `updated_at`: 更新时间

**约束**:
```sql
CHECK (char_length(content) > 0)
CHECK (likes >= 0)
```

**索引**:
```sql
INDEX idx_comments_post (post_id)
INDEX idx_comments_author (author_id)
INDEX idx_comments_parent (parent_comment_id)
```

### 4. **user_followers 表** (用户关注关系表)

**表描述**: 存储用户之间的关注关系

```sql
CREATE TABLE user_followers (
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (follower_id <> followed_id)
);
```

**字段说明**:
- `follower_id`: 关注者ID，关联users表
- `followed_id`: 被关注者ID，关联users表
- `created_at`: 关注时间
- 复合主键: (follower_id, followed_id)

**约束**:
```sql
CHECK (follower_id <> followed_id)  -- 不能关注自己
```

**索引**:
```sql
INDEX idx_user_followers_follower_id (follower_id)
INDEX idx_user_followers_followed_id (followed_id)
```

### 5. **wallet_bindings 表** (钱包绑定表)

**表描述**: 存储用户绑定的多网络钱包地址

```sql
CREATE TABLE wallet_bindings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    network VARCHAR(255) NOT NULL DEFAULT 'ethereum',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, wallet_address)
);
```

**字段说明**:
- `id`: 绑定记录唯一标识，自增主键
- `user_id`: 用户ID，关联users表
- `wallet_address`: 钱包地址，42位格式
- `network`: 网络类型，默认"ethereum"
- `created_at`: 绑定时间

**约束**:
```sql
CHECK (char_length(wallet_address) = 42)
CHECK (network IN ('ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'))
UNIQUE (user_id, wallet_address)  -- 每个用户每个钱包地址只能绑定一次
```

**索引**:
```sql
INDEX idx_wallet_bindings_user_id (user_id)
INDEX idx_wallet_bindings_wallet_address (wallet_address)
```

### 6. **contents 表** (内容表 - 旧版)

**表描述**: 旧版内容表，已废弃，建议使用posts表

```sql
CREATE TABLE contents (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT,
    title TEXT,
    content TEXT,
    type TEXT,
    status TEXT DEFAULT 'draft',
    likes BIGINT DEFAULT 0,
    dislikes BIGINT DEFAULT 0,
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

**索引**:
```sql
INDEX idx_contents_deleted_at (deleted_at)
```

### 7. **proposals 表** (提案表)

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
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (proposer_id) REFERENCES users(id)
);
```

**字段说明**:
- `id`: 提案唯一标识，自增主键
- `title`: 提案标题
- `description`: 提案描述
- `proposer_id`: 提案人ID，关联users表
- `status`: 提案状态，默认"active"
- `votes_for`: 赞成票数，默认0
- `votes_against`: 反对票数，默认0
- `start_time`: 投票开始时间
- `end_time`: 投票结束时间
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间

**索引**:
```sql
INDEX idx_proposals_deleted_at (deleted_at)
```

### 8. **votes 表** (投票表)

**表描述**: 存储用户对提案的投票记录

```sql
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT,
    voter_id BIGINT,
    vote BOOLEAN,
    weight BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    FOREIGN KEY (voter_id) REFERENCES users(id)
);
```

**字段说明**:
- `id`: 投票记录唯一标识，自增主键
- `proposal_id`: 提案ID，关联proposals表
- `voter_id`: 投票人ID，关联users表
- `vote`: 投票结果，true为赞成，false为反对
- `weight`: 投票权重，基于用户声誉积分
- `created_at`: 投票时间
- `updated_at`: 更新时间
- `deleted_at`: 软删除时间

**索引**:
```sql
INDEX idx_votes_deleted_at (deleted_at)
```

### 9. **transactions 表** (交易表)

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
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

**字段说明**:
- `id`: 交易记录唯一标识，自增主键
- `hash`: 交易哈希，唯一索引
- `from_address`: 发送方地址
- `to_address`: 接收方地址
- `value`: 交易金额
- `gas_used`: 消耗的gas
- `gas_price`: gas价格
- `status`: 交易状态
- `block_number`: 区块号
- `created_at`: 记录创建时间
- `updated_at`: 记录更新时间
- `deleted_at`: 软删除时间

**索引**:
```sql
UNIQUE INDEX idx_transactions_hash (hash)
INDEX idx_transactions_deleted_at (deleted_at)
```

## 🔗 表关系图

```
users (用户表)
├── 1:N posts (文章表) - author_id
├── 1:N comments (评论表) - author_id
├── 1:N proposals (提案表) - proposer_id
├── 1:N votes (投票表) - voter_id
├── 1:N wallet_bindings (钱包绑定表) - user_id
├── 1:N user_followers (关注关系表) - follower_id
└── 1:N user_followers (关注关系表) - followed_id

posts (文章表)
└── 1:N comments (评论表) - post_id

comments (评论表)
└── 1:N comments (嵌套评论) - parent_comment_id

proposals (提案表)
└── 1:N votes (投票表) - proposal_id

transactions (交易表) - 独立表，记录区块链交易
```

## 🎯 核心功能模块

### 1. **用户系统**
- 支持邮箱和钱包双重登录
- 用户关注机制
- 声誉积分系统
- 角色权限管理

### 2. **内容管理**
- 文章发布和管理
- 评论系统（支持嵌套评论）
- 标签系统
- 内容审核

### 3. **钱包管理**
- 多网络钱包绑定
- 托管钱包支持
- 私钥加密存储

### 4. **治理系统**
- 提案创建和管理
- 投票机制
- 权重计算

### 5. **区块链集成**
- 交易记录和状态跟踪
- 多网络支持
- Gas费用记录

## 🛠️ 数据库工具

### 查看表结构
```bash
# 运行表结构查看工具
go run cmd/read-schema/main.go
```

### 数据库迁移
```bash
# 运行数据库迁移
go run cmd/migrate/main.go
```

### 备份和恢复
```bash
# 备份数据库
pg_dump -h localhost -U postgres bondly_db > backup.sql

# 恢复数据库
psql -h localhost -U postgres bondly_db < backup.sql
```

## 📊 性能优化建议

### 索引优化
- 为经常查询的字段添加索引
- 考虑复合索引优化多字段查询
- 定期分析索引使用情况

### 查询优化
- 使用软删除避免大量数据删除
- 合理使用分页查询
- 避免N+1查询问题

### 数据维护
- 定期清理软删除数据
- 监控表大小和增长趋势
- 定期更新统计信息 