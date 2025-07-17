# Bondly API

> **基于 Go + Gin + GORM 构建的后端 API 服务**

## 🚀 快速开始

### 环境要求
- Go 1.21+
- PostgreSQL 12+
- Redis 6+
- Docker (推荐)

### 本地开发

```bash
# 1. 克隆项目
git clone <repository>
cd bondly-api

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件设置数据库和Redis连接

# 3. 安装依赖
go mod download

# 4. 使用 Docker 启动依赖服务
docker-compose -f docker-compose.dev.yml up -d

# 5. 运行应用
go run main.go
```

### API 文档
启动后访问 Swagger UI：`http://localhost:8080/swagger/index.html`

### 数据库文档
详细的数据库表结构说明：[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

## 📊 数据库表结构

### 数据库概览
- **数据库名**: bondly_db
- **总表数**: 9个表
- **数据库类型**: PostgreSQL

### 表结构详情

#### 1. **users 表** (用户表)
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

-- 约束
CHECK (char_length(wallet_address) = 42)
CHECK (char_length(custody_wallet_address) = 42)
CHECK (position('@' in email) > 1)
CHECK (char_length(nickname) > 0)
CHECK (role IN ('user', 'admin', 'moderator'))
CHECK (reputation_score >= 0)

-- 索引
UNIQUE INDEX idx_users_wallet_address (wallet_address)
UNIQUE INDEX idx_users_email (email)
```

#### 2. **posts 表** (文章表)
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

-- 约束
CHECK (char_length(title) > 0)
CHECK (char_length(content) > 0)
CHECK (likes >= 0)
CHECK (views >= 0)

-- 索引
INDEX idx_posts_author (author_id)
INDEX idx_posts_created_at (created_at)
INDEX idx_posts_is_published (is_published)
```

#### 3. **comments 表** (评论表)
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

-- 约束
CHECK (char_length(content) > 0)
CHECK (likes >= 0)

-- 索引
INDEX idx_comments_post (post_id)
INDEX idx_comments_author (author_id)
INDEX idx_comments_parent (parent_comment_id)
```

#### 4. **user_followers 表** (用户关注关系表)
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

-- 索引
INDEX idx_user_followers_follower_id (follower_id)
INDEX idx_user_followers_followed_id (followed_id)
```

#### 5. **wallet_bindings 表** (钱包绑定表)
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

-- 约束
CHECK (char_length(wallet_address) = 42)
CHECK (network IN ('ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'))

-- 索引
INDEX idx_wallet_bindings_user_id (user_id)
INDEX idx_wallet_bindings_wallet_address (wallet_address)
```

#### 6. **contents 表** (内容表 - 旧版)
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

-- 索引
INDEX idx_contents_deleted_at (deleted_at)
```

#### 7. **proposals 表** (提案表)
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

-- 索引
INDEX idx_proposals_deleted_at (deleted_at)
```

#### 8. **votes 表** (投票表)
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

-- 索引
INDEX idx_votes_deleted_at (deleted_at)
```

#### 9. **transactions 表** (交易表)
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

-- 索引
INDEX idx_transactions_hash (hash) UNIQUE
INDEX idx_transactions_deleted_at (deleted_at)
```

### 表关系图

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

### 核心功能模块

1. **用户系统**: 支持邮箱和钱包双重登录，用户关注机制
2. **内容管理**: 文章发布、评论系统（支持嵌套评论）
3. **钱包管理**: 多网络钱包绑定，托管钱包支持
4. **治理系统**: 提案投票机制
5. **区块链集成**: 交易记录和状态跟踪
6. **声誉系统**: 链上声誉管理，治理资格验证，声誉排行榜

## 📚 Swagger 文档使用

### 功能特性
- **完整接口文档**: 21个API接口，涵盖6个功能模块
- **自动生成 curl**: 每个接口都会自动生成 curl 命令
- **交互式测试**: 支持在线测试API接口
- **详细参数说明**: 包含请求参数、响应格式、错误码说明

### 使用方法

#### 1. 查看 curl 示例
1. 打开任意 API 接口展开详情
2. 点击右上角 **"Try it out"** 按钮
3. 填写必要参数（会自动填入示例值）
4. 在参数区域下方查看生成的 curl 命令
5. 点击 **"Execute"** 执行请求并查看结果

#### 2. API 分组概览
- **🔐 认证管理**: 邮箱验证码、登录验证
- **👤 用户管理**: 用户信息、余额、声誉
- **⛓️ 区块链**: 状态查询、合约信息
- **📄 内容管理**: 内容CRUD操作
- **🏛️ 治理管理**: 提案、投票系统
- **🏆 声誉系统**: 声誉查询、排行榜、治理资格
- **🔍 系统监控**: 健康检查、状态监控

## 📁 项目结构

```
bondly-api/
├── main.go                 # 应用入口
├── config/                 # 配置管理
├── internal/
│   ├── handlers/          # HTTP 处理器
│   │   └── reputation_handlers.go # 声誉系统处理器
│   ├── services/          # 业务逻辑层
│   │   └── reputation_service.go  # 声誉系统服务
│   ├── repositories/      # 数据访问层
│   ├── models/            # 数据模型
│   ├── dto/               # 数据传输对象
│   │   └── reputation.go  # 声誉系统DTO
│   ├── middleware/        # 中间件
│   ├── database/          # 数据库配置
│   ├── redis/             # Redis 客户端
│   ├── blockchain/        # 区块链集成
│   │   └── reputation.go  # 声誉合约集成
│   └── utils/             # 工具函数
├── docs/                   # Swagger 文档
├── test_reputation_api.sh  # 声誉系统API测试脚本
└── docker-compose.dev.yml  # 开发环境配置
```

## 🔧 技术栈

- **语言**: Go 1.21+
- **框架**: Gin Web Framework
- **数据库**: PostgreSQL + Redis
- **消息队列**: Apache Kafka
- **区块链**: Ethereum (go-ethereum)
- **文档**: Swagger/OpenAPI

## 📚 核心功能

### 认证管理
- 邮箱验证码登录
- JWT 令牌认证
- 会话管理

### 用户管理
- 用户信息 CRUD
- 余额查询
- 用户关注系统

### 区块链集成
- 智能合约交互
- 代币质押操作
- 交易状态查询

### 内容管理
- 文章/帖子管理
- 评论系统
- 内容审核

### 治理系统
- DAO 提案管理
- 投票机制
- 治理统计

### 声誉系统
- 链上声誉数据同步
- 声誉排行榜查询
- 治理资格验证（≥100声誉分）
- 管理员声誉调整

## 🔗 主要 API 端点

### 健康检查
- `GET /health` - 服务状态
- `GET /health/redis` - Redis 状态

### 认证相关
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/verify-code` - 验证登录

### 用户相关
- `GET /api/v1/users/:address` - 获取用户信息
- `POST /api/v1/users/profile` - 更新用户资料
- `GET /api/v1/users/:address/balance` - 查询余额

### 区块链相关
- `GET /api/v1/blockchain/status` - 区块链状态
- `POST /api/v1/blockchain/stake` - 质押代币
- `GET /api/v1/blockchain/transactions/:address` - 交易记录

### 治理相关
- `GET /api/v1/governance/proposals` - 提案列表
- `POST /api/v1/governance/proposals` - 创建提案
- `POST /api/v1/governance/vote` - 投票

### 声誉系统
- `GET /api/v1/reputation/user/:id` - 获取用户声誉
- `GET /api/v1/reputation/address/:address` - 按钱包地址查询声誉
- `GET /api/v1/reputation/ranking` - 声誉排行榜
- `GET /api/v1/reputation/governance/eligible/:id` - 检查治理资格

## ⚙️ 环境变量配置

```bash
# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=bondly
DB_PASSWORD=password
DB_NAME=bondly_db

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 区块链配置
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETH_CONTRACT_ADDRESS=0x...
ETH_REPUTATION_VAULT_ADDRESS=0x...

# Kafka 配置
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_BONDLY_EVENTS=bondly_events

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json

# CORS 配置
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT 配置
JWT_SECRET=your-secret-key

# 钱包配置
WALLET_SECRET_KEY=your-wallet-secret-key

# 邮件配置
EMAIL_PROVIDER=mock
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=Bondly <noreply@yourdomain.com>
```

## 🛠️ 开发工具

### 数据库表结构查看
```bash
# 查看实际数据库表结构
go run cmd/read-schema/main.go
```

### 数据库迁移
```bash
# 运行数据库迁移
go run cmd/migrate/main.go
```

### 生成 Swagger 文档
```bash
# 生成 API 文档
swag init -g main.go
```

## 📊 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 实际数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 🧪 开发工具

```bash
# 格式化代码
make fmt

# 代码检查
make lint

# 运行测试
make test

# 构建应用
make build

# 数据库迁移
make migrate
```

## 🐳 Docker 部署

```bash
# 构建并启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker ps

# 查看日志
docker logs bondly-api

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

## 🧪 API 测试示例

### 认证接口测试

```bash
# 发送验证码
curl -X POST "http://localhost:8080/api/v1/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 验证登录
curl -X POST "http://localhost:8080/api/v1/auth/verify-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'

# 查询验证码状态
curl "http://localhost:8080/api/v1/auth/code-status?email=test@example.com"
```

### 用户接口测试

```bash
# 获取用户信息
curl "http://localhost:8080/api/v1/users/0x1234567890abcdef1234567890abcdef12345678"

# 查询用户余额
curl "http://localhost:8080/api/v1/users/0x1234567890abcdef1234567890abcdef12345678/balance"

# 创建新用户
curl -X POST "http://localhost:8080/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "username": "testuser",
    "bio": "Test user profile"
  }'
```

### 系统接口测试

```bash
# 健康检查
curl "http://localhost:8080/health"

# 区块链状态
curl "http://localhost:8080/api/v1/blockchain/status"

# 治理提案列表
curl "http://localhost:8080/api/v1/governance/proposals"

# 声誉系统测试
curl "http://localhost:8080/api/v1/reputation/user/1"
curl "http://localhost:8080/api/v1/reputation/address/0x1234567890abcdef1234567890abcdef12345678"
curl "http://localhost:8080/api/v1/reputation/ranking"
curl "http://localhost:8080/api/v1/reputation/governance/eligible/1"
```

## 📖 开发指南

### 添加新功能模块

1. **创建模型** (`internal/models/`)
2. **创建仓库** (`internal/repositories/`)
3. **创建服务** (`internal/services/`)
4. **创建处理器** (`internal/handlers/`)
5. **注册路由** (`internal/server/`)
6. **添加 Swagger 注释**
7. **编写测试用例**

### 最佳实践

- 使用分层架构模式
- 遵循 RESTful API 设计
- 统一错误处理和日志记录
- 为所有接口添加 Swagger 文档
- 编写单元测试和集成测试
- 使用依赖注入提高可测试性

---

**文档版本**: v1.0 | **最后更新**: 2024年 

## 🌱 数据库模拟数据填充（Seed）

为了便于开发、联调和前端演示，Bondly 提供了一套一键生成类真实社交数据的数据库填充工具。

### 功能简介
- 自动生成用户、文章、评论、关注关系、钱包绑定、提案、投票、链上交易等多种数据
- 数据内容贴合 Web3 社交博客场景，包含丰富的链上与链下交互
- 支持多次重置，便于开发环境反复测试

### 使用方法

1. **确保数据库已初始化并可连接**（建议先执行 `make migrate` 完成表结构迁移）
2. 在 bondly-api 目录下执行：

```bash
make seed
```

3. 运行成功后，数据库将自动填充一批模拟数据，可直接通过前端或数据库工具查看。

### 数据类型说明
- **用户**：包含钱包地址、邮箱、昵称、头像、角色、声誉分等
- **文章**：多主题内容，带标签、封面、浏览量、点赞数
- **评论**：分布在不同文章下，内容多样
- **关注关系**：模拟真实社交网络结构
- **钱包绑定**：每个用户可绑定多个链钱包，支持多链
- **提案/投票**：DAO 治理场景下的提案与投票
- **链上交易**：模拟真实的链上转账、状态

### 注意事项
- 每次执行 `make seed` 会清空相关表并重新生成数据（开发环境专用，勿在生产环境运行）
- 如需自定义数据量或内容，可修改 `cmd/seed-data/main.go`
- 该工具仅用于开发、测试和演示，不建议用于生产环境 