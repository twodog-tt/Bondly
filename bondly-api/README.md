# Bondly API (bondly-api)

> **去中心化社交价值网络的后端服务**

## 📋 项目概述

Bondly API 是基于 Node.js + Express + TypeScript 构建的后端服务，为 Bondly 社交平台提供 RESTful API 接口。支持用户管理、内容存储、社交互动、区块链交互等核心功能。

## 🚀 核心功能

### 用户管理
- **用户注册/登录**: 支持邮箱、社交账户、Web3 钱包登录
- **身份验证**: JWT Token 认证，多因子验证
- **用户档案**: 声誉值计算、SBT 身份管理
- **权限控制**: 基于角色的访问控制 (RBAC)

### 内容管理
- **内容存储**: 支持 IPFS/Arweave 去中心化存储
- **内容索引**: 全文搜索、标签分类、推荐算法
- **版本控制**: 内容版本管理、草稿系统
- **审核系统**: 内容审核、举报处理

### 社交互动
- **评论系统**: 多级评论、回复通知
- **点赞系统**: 基于质押的互动机制
- **关注系统**: 用户关注、粉丝管理
- **通知系统**: 实时通知推送

### 区块链集成
- **智能合约交互**: 质押、奖励、NFT 铸造
- **事件监听**: 链上事件实时同步
- **交易管理**: 交易状态跟踪、失败重试
- **Gas 优化**: 批量交易、Gas 预估

### 数据分析
- **用户行为分析**: 互动数据、活跃度统计
- **内容分析**: 热度计算、推荐算法
- **经济模型**: Token 流通、质押统计
- **治理数据**: 投票记录、提案统计

## 🛠 技术栈

### 核心框架
- **Node.js**: 服务器运行环境
- **Express.js**: Web 应用框架
- **TypeScript**: 类型安全开发
- **Prisma**: ORM 数据库操作

### 数据库
- **PostgreSQL**: 主数据库
- **Redis**: 缓存和会话存储
- **MongoDB**: 文档存储（可选）

### 区块链集成
- **Ethers.js**: 以太坊交互
- **Web3.js**: 区块链连接
- **IPFS**: 去中心化存储

### 消息队列
- **RabbitMQ**: 异步任务处理
- **Redis Pub/Sub**: 实时消息推送

### 监控和日志
- **Winston**: 日志管理
- **Prometheus**: 性能监控
- **Grafana**: 数据可视化

## 📁 项目结构

```
src/
├── controllers/        # 控制器层
│   ├── auth.ts        # 认证控制器
│   ├── user.ts        # 用户控制器
│   ├── content.ts     # 内容控制器
│   └── social.ts      # 社交控制器
├── services/          # 业务逻辑层
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── content.service.ts
│   └── blockchain.service.ts
├── models/            # 数据模型
│   ├── user.model.ts
│   ├── content.model.ts
│   └── interaction.model.ts
├── middleware/        # 中间件
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── routes/            # 路由定义
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── content.routes.ts
├── utils/             # 工具函数
│   ├── blockchain.utils.ts
│   ├── ipfs.utils.ts
│   └── validation.utils.ts
├── config/            # 配置文件
│   ├── database.ts
│   ├── blockchain.ts
│   └── redis.ts
└── app.ts            # 应用入口
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0
- Docker (可选)

### 安装依赖
```bash
cd bondly-api
npm install
```

### 环境配置
创建 `.env` 文件：
```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/bondly"
REDIS_URL="redis://localhost:6379"

# JWT 配置
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# 区块链配置
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/your_project_id"
CONTRACT_ADDRESS="0x..."

# IPFS 配置
IPFS_GATEWAY="https://ipfs.io/ipfs/"
IPFS_API_URL="https://ipfs.infura.io:5001"

# 邮件配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### 数据库迁移
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 查看数据库
npx prisma studio
```

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm start
```

## 📚 API 文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

#### Web3 钱包登录
```http
POST /api/auth/web3-login
Content-Type: application/json

{
  "address": "string",
  "signature": "string",
  "message": "string"
}
```

### 用户接口

#### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### 更新用户档案
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "bio": "string",
  "avatar": "string"
}
```

### 内容接口

#### 发布内容
```http
POST /api/content/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "visibility": "public|private|friends"
}
```

#### 获取内容列表
```http
GET /api/content/posts?page=1&limit=10&tag=web3
```

#### 获取单个内容
```http
GET /api/content/posts/:id
```

### 社交接口

#### 点赞内容
```http
POST /api/social/posts/:id/like
Authorization: Bearer <token>
```

#### 评论内容
```http
POST /api/social/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "parentId": "string" // 可选，回复评论
}
```

#### 关注用户
```http
POST /api/social/users/:id/follow
Authorization: Bearer <token>
```

## 🔧 配置说明

### 数据库配置
在 `src/config/database.ts` 中配置：
- PostgreSQL 连接参数
- Redis 连接参数
- 连接池设置

### 区块链配置
在 `src/config/blockchain.ts` 中配置：
- 以太坊网络 RPC 端点
- 智能合约地址
- Gas 价格策略

### 存储配置
- **IPFS**: 去中心化内容存储
- **Arweave**: 永久存储方案
- **本地存储**: 开发环境使用

## 🔄 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化

### API 设计
- RESTful 设计原则
- 统一的错误响应格式
- 版本化 API 路径

### 数据库设计
- 使用 Prisma Schema 定义模型
- 建立合适的索引
- 数据迁移版本控制

### 测试
- 单元测试: Jest
- 集成测试: Supertest
- API 测试: Postman/Newman

## 📦 部署

### Docker 部署
```bash
# 构建镜像
docker build -t bondly-api .

# 运行容器
docker run -p 3000:3000 bondly-api
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/bondly
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: bondly
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 云部署
- **AWS**: ECS + RDS + ElastiCache
- **GCP**: Cloud Run + Cloud SQL + Memorystore
- **Azure**: App Service + Azure Database + Redis Cache

## 🔍 监控和日志

### 日志配置
- 结构化日志输出
- 不同环境日志级别
- 日志轮转和归档

### 性能监控
- API 响应时间监控
- 数据库查询性能
- 内存和 CPU 使用率

### 错误追踪
- 错误日志收集
- 异常通知机制
- 错误统计分析

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [前端项目](../bondly-fe/README.md)
- [智能合约](../bondly-contracts/README.md)
- [技术文档](../docs/README.md)
- [API 文档](https://api.bondly.io/docs) 