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
- **🔍 系统监控**: 健康检查、状态监控

## 📁 项目结构

```
bondly-api/
├── main.go                 # 应用入口
├── config/                 # 配置管理
├── internal/
│   ├── handlers/          # HTTP 处理器
│   ├── services/          # 业务逻辑层
│   ├── repositories/      # 数据访问层
│   ├── models/            # 数据模型
│   ├── middleware/        # 中间件
│   ├── database/          # 数据库配置
│   ├── redis/             # Redis 客户端
│   ├── blockchain/        # 区块链集成
│   └── utils/             # 工具函数
├── docs/                   # Swagger 文档
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
- 声誉系统

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

# Kafka 配置
KAFKA_BROKERS=localhost:9092
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