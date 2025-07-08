# Bondly API

Bondly API 是一个基于 Golang + Gin + GORM 构建的后端服务，专门用于与 Bondly 智能合约进行交互。

## 技术栈

### 核心技术栈
- **语言**: Go 1.21+
- **Web 框架**: Gin (高性能 HTTP 框架)
- **ORM**: GORM (Go 的 ORM 库)
- **数据库**: PostgreSQL (关系型数据库)
- **缓存**: Redis (内存数据库，用于缓存和会话存储)
- **消息队列**: Kafka (分布式消息系统)
- **区块链**: go-ethereum (以太坊客户端)
- **日志**: Logrus (结构化日志)
- **配置管理**: godotenv (环境变量管理)

### 架构特点
- **模块化设计**: 清晰的包结构和职责分离
- **依赖注入**: 通过配置和接口实现松耦合
- **缓存架构**: Redis 缓存层提升性能，支持用户信息、会话管理等
- **中间件支持**: 统一的请求处理和日志记录
- **优雅关闭**: 支持优雅的服务停止
- **健康检查**: 内置健康检查端点，包括数据库和缓存状态

## 项目结构

```
bondly-api/
├── main.go                 # 应用入口
├── go.mod                  # Go 模块文件
├── go.sum                  # 依赖校验文件
├── env.example             # 环境变量示例
├── Dockerfile              # Docker 配置
├── Makefile                # 构建脚本

├── config/                 # 配置管理
│   └── config.go
├── internal/               # 内部包
│   ├── server/            # 服务器管理
│   │   └── server.go
│   ├── handlers/          # HTTP 处理器
│   │   ├── handlers.go    # 基础处理器
│   │   └── user_handlers.go # 用户相关处理器
│   ├── services/          # 业务逻辑层
│   │   └── user_service.go
│   ├── repositories/      # 数据访问层
│   │   └── user_repository.go
│   ├── middleware/        # 中间件
│   │   └── middleware.go
│   ├── database/          # 数据库管理
│   │   └── database.go
│   ├── redis/             # Redis 客户端
│   │   └── redis.go
│   ├── cache/             # 缓存服务层
│   │   └── cache.go
│   ├── logger/            # 日志管理
│   │   └── logger.go
│   ├── blockchain/        # 区块链交互
│   │   └── ethereum.go
│   ├── kafka/             # 消息队列
│   │   └── kafka.go
│   ├── models/            # 数据模型
│   │   └── models.go
│   └── utils/             # 工具函数
│       ├── utils.go       # 通用工具
│       └── response.go    # 响应处理
├── cmd/                   # 命令行工具
│   └── migrate/          # 数据库迁移
└── docs/                  # 文档
    └── api.md
```

## 快速开始

### 前置要求

- Go 1.21+
- PostgreSQL 12+
- Redis 6+
- Kafka 2.8+
- Docker (可选)

### 安装依赖

```bash
# 安装 Go 依赖
make deps

# 或者手动安装
go mod download
go mod tidy
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp env.example .env

# 编辑环境变量
vim .env
```

### 开发环境运行

#### 方式一：本地直接运行（推荐用于快速调试）

```bash
# 开发模式
make dev

# 或者直接运行
go run main.go
```

#### 方式二：本地编译 + Docker 运行（推荐用于开发环境）

```bash
# 1. 本地编译（生成适用于 Linux 容器的二进制）
GOOS=linux GOARCH=amd64 go build -o bondly-api main.go

# 2. 构建 Docker 镜像
docker-compose -f docker-compose.dev.yml build --no-cache

# 3. 启动所有服务（包括数据库、Redis、Kafka等）
docker-compose -f docker-compose.dev.yml up -d

# 4. 查看服务状态
docker ps

# 5. 查看服务日志
docker logs bondly-api
```

#### 方式三：生产环境构建

```bash
# 构建二进制文件
make build

# 运行构建后的应用
./build/bondly-api
```

### 开发环境常用操作

#### 代码修改后重新部署

```bash
# 1. 重新编译
GOOS=linux GOARCH=amd64 go build -o bondly-api main.go

# 2. 重新构建镜像
docker-compose -f docker-compose.dev.yml build --no-cache

# 3. 重启服务
docker-compose -f docker-compose.dev.yml up -d

# 4. 查看启动日志
docker logs bondly-api
```

#### 查看和调试服务

```bash
# 查看所有容器状态
docker ps

# 查看 bondly-api 容器日志
docker logs bondly-api

# 实时查看日志
docker logs -f bondly-api

# 进入容器调试（如果需要）
docker exec -it bondly-api sh

# 停止所有服务
docker-compose -f docker-compose.dev.yml down

# 停止并删除所有数据（慎用）
docker-compose -f docker-compose.dev.yml down -v
```

#### 环境变量修改

```bash
# 修改 .env 文件后需要重新构建镜像
vim .env

# 重新构建并启动
GOOS=linux GOARCH=amd64 go build -o bondly-api main.go
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

#### 使用 Makefile 简化操作

```bash
# 查看所有可用命令
make help

# 开发环境快速操作
make dev-build    # 编译适用于容器的二进制
make dev-up       # 启动开发环境
make dev-down     # 停止开发环境
make dev-logs     # 查看服务日志
make dev-rebuild  # 重新构建并启动（推荐用于代码修改后）

# 本地开发
make dev          # 本地运行（不依赖 Docker）
make build        # 本地构建
make test         # 运行测试
```

## Redis 缓存功能

### 缓存架构

项目集成了 Redis 作为缓存中间件，提供以下功能：

#### 缓存层次
- **用户信息缓存**: 用户基本信息、声誉值、余额等
- **内容缓存**: 文章、帖子等内容数据
- **会话管理**: 用户会话存储
- **限流控制**: API 访问频率限制
- **统计数据**: 实时统计信息缓存

#### 缓存策略
- **缓存穿透**: 使用空值缓存防止恶意查询
- **缓存击穿**: 使用互斥锁防止热点数据失效
- **缓存雪崩**: 使用随机过期时间分散失效
- **缓存更新**: 采用先更新数据库，再删除缓存的策略

#### 缓存配置
```go
// 默认缓存过期时间配置
UserCacheTTL:      30 * time.Minute    // 用户信息
ContentCacheTTL:   15 * time.Minute    // 内容信息
ProposalCacheTTL:  10 * time.Minute    // 提案信息
SessionCacheTTL:   24 * time.Hour      // 用户会话
StatsCacheTTL:     5 * time.Minute     // 统计数据
```

### 缓存 API

#### 健康检查
- `GET /health/redis` - Redis 连接状态和统计信息

#### 缓存管理（仅开发环境）
- `DELETE /api/v1/cache/clear` - 清空所有缓存
- `GET /api/v1/cache/stats` - 获取缓存统计信息

### Redis 配置

#### 环境变量
```bash
REDIS_HOST=localhost          # Redis 主机
REDIS_PORT=6379              # Redis 端口
REDIS_PASSWORD=              # Redis 密码（可选）
REDIS_DB=0                   # Redis 数据库编号
REDIS_POOL_SIZE=10           # 连接池大小
REDIS_MIN_IDLE_CONNS=5       # 最小空闲连接数
REDIS_MAX_RETRIES=3          # 最大重试次数
REDIS_DIAL_TIMEOUT=5         # 连接超时（秒）
REDIS_READ_TIMEOUT=3         # 读取超时（秒）
REDIS_WRITE_TIMEOUT=3        # 写入超时（秒）
```

## API 端点

### 健康检查
- `GET /health` - 服务健康状态
- `GET /health/redis` - Redis 连接状态

### 区块链相关
- `GET /api/v1/blockchain/status` - 获取区块链状态
- `GET /api/v1/blockchain/contract/:address` - 获取合约信息

### 用户相关
- `GET /api/v1/users/:address` - 获取用户信息
- `GET /api/v1/users/:address/balance` - 获取用户余额
- `GET /api/v1/users/:address/reputation` - 获取用户声誉
- `POST /api/v1/users/` - 创建新用户

### 内容相关
- `GET /api/v1/content/` - 获取内容列表
- `GET /api/v1/content/:id` - 获取内容详情

### 治理相关
- `GET /api/v1/governance/proposals` - 获取提案列表
- `GET /api/v1/governance/proposals/:id` - 获取提案详情

## API 响应格式

所有 API 都使用统一的响应格式：

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息"
}
```

### 示例请求

#### 创建用户
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef",
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "This is a test user"
  }'
```

#### 获取用户信息
```bash
curl http://localhost:8080/api/v1/users/0x1234567890abcdef
```

#### 获取用户声誉
```bash
curl http://localhost:8080/api/v1/users/0x1234567890abcdef/reputation
```

## 开发指南

### 代码格式化

```bash
make fmt
```

### 代码检查

```bash
make lint
```

### 运行测试

```bash
# 运行所有测试
make test

# 运行测试并生成覆盖率报告
make test-coverage
```

### 数据库迁移

```bash
make migrate
```

## 配置说明

### 服务器配置
- `SERVER_PORT`: 服务器端口 (默认: 8080)
- `SERVER_HOST`: 服务器主机 (默认: localhost)
  - **重要**: 在 Docker 环境中，必须设置为 `0.0.0.0` 才能从宿主机访问
  - 本地开发时可以使用 `localhost`
  - 容器环境使用 `0.0.0.0`

### 数据库配置
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称
- `DB_SSL_MODE`: SSL 模式

### Redis 配置
- `REDIS_HOST`: Redis 主机
- `REDIS_PORT`: Redis 端口
- `REDIS_PASSWORD`: Redis 密码（可选）
- `REDIS_DB`: Redis 数据库编号
- `REDIS_POOL_SIZE`: 连接池大小
- `REDIS_MIN_IDLE_CONNS`: 最小空闲连接数
- `REDIS_MAX_RETRIES`: 最大重试次数
- `REDIS_DIAL_TIMEOUT`: 连接超时时间（秒）
- `REDIS_READ_TIMEOUT`: 读取超时时间（秒）
- `REDIS_WRITE_TIMEOUT`: 写入超时时间（秒）

### 以太坊配置
- `ETH_RPC_URL`: 以太坊 RPC URL
- `ETH_PRIVATE_KEY`: 私钥（用于交易签名）
- `ETH_CONTRACT_ADDRESS`: 合约地址

### Kafka 配置
- `KAFKA_BROKERS`: Kafka 代理地址
- `KAFKA_TOPIC_BONDLY_EVENTS`: 事件主题

## 架构设计

### 分层架构

项目采用清晰的分层架构设计：

```
┌─────────────────┐
│   Handlers      │  HTTP 请求处理层
├─────────────────┤
│   Services      │  业务逻辑层
├─────────────────┤
│     Cache       │  缓存服务层
├─────────────────┤
│ Repositories    │  数据访问层
├─────────────────┤
│   Database      │  数据存储层
└─────────────────┘
```

#### 各层职责

- **Handlers**: 处理 HTTP 请求，参数验证，调用业务逻辑
- **Services**: 实现业务逻辑，数据验证，事务管理，缓存协调
- **Cache**: 提供统一的缓存接口，管理 Redis 连接和操作
- **Repositories**: 封装数据库操作，提供数据访问接口
- **Database**: 数据持久化存储

### 依赖注入

使用依赖注入模式，提高代码的可测试性和可维护性：

```go
// 初始化依赖
userRepo := repositories.NewUserRepository(db)
userService := services.NewUserService(userRepo)
userHandlers := handlers.NewUserHandlers(userService)
```

### 统一响应格式

所有 API 都使用统一的响应格式，便于前端处理：

```go
// 成功响应
utils.Success(c, data)

// 错误响应
utils.BadRequest(c, "错误信息")
utils.NotFound(c, "资源不存在")
utils.InternalError(c, "服务器内部错误")
```

## 开发环境说明

### 为什么使用本地编译 + Docker 运行？

1. **开发效率高**: 本地编译速度快，调试方便
2. **跨平台兼容**: 使用 `GOOS=linux GOARCH=amd64` 确保生成的二进制在 Linux 容器中运行
3. **环境隔离**: 依赖服务（数据库、Redis、Kafka）在容器中运行，避免污染本地环境
4. **快速迭代**: 代码修改后只需重新编译和构建镜像即可

### 架构说明

- **本地**: Go 代码编译、开发调试
- **Docker 容器**: 
  - `bondly-api`: 运行编译好的二进制文件
  - `bondly-postgres`: PostgreSQL 数据库
  - `bondly-redis`: Redis 缓存
  - `bondly-kafka`: Kafka 消息队列
  - `bondly-zookeeper`: Kafka 依赖的 Zookeeper

## 部署

### 开发环境部署

1. 安装 Go 1.21+ 和 Docker
2. 配置环境变量（确保 `SERVER_HOST=0.0.0.0`）
3. 本地编译: `GOOS=linux GOARCH=amd64 go build -o bondly-api main.go`
4. 构建并启动: `docker-compose -f docker-compose.dev.yml up -d`

### 生产环境部署

1. 使用多阶段 Dockerfile 在容器内编译
2. 配置生产环境变量
3. 运行数据库迁移
4. 启动应用

### 生产环境部署步骤

1. 使用 Docker Compose 或 Kubernetes
2. 配置负载均衡
3. 设置监控和日志
4. 配置 SSL 证书

## 开发最佳实践

### 添加新的业务模块

1. **创建模型** (`internal/models/`)
   ```go
   type NewEntity struct {
       ID        uint           `json:"id" gorm:"primaryKey"`
       Name      string         `json:"name"`
       CreatedAt time.Time      `json:"created_at"`
       UpdatedAt time.Time      `json:"updated_at"`
       DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
   }
   ```

2. **创建仓库** (`internal/repositories/`)
   ```go
   type NewEntityRepository struct {
       db *gorm.DB
   }
   
   func (r *NewEntityRepository) Create(entity *models.NewEntity) error {
       return r.db.Create(entity).Error
   }
   ```

3. **创建服务** (`internal/services/`)
   ```go
   type NewEntityService struct {
       repo *repositories.NewEntityRepository
   }
   
   func (s *NewEntityService) CreateEntity(entity *models.NewEntity) error {
       // 业务逻辑
       return s.repo.Create(entity)
   }
   ```

4. **创建处理器** (`internal/handlers/`)
   ```go
   type NewEntityHandlers struct {
       service *services.NewEntityService
   }
   
   func (h *NewEntityHandlers) CreateEntity(c *gin.Context) {
       // 参数验证和响应处理
   }
   ```

5. **注册路由** (`internal/server/server.go`)
   ```go
   newEntityRepo := repositories.NewNewEntityRepository(db)
   newEntityService := services.NewNewEntityService(newEntityRepo)
   newEntityHandlers := handlers.NewNewEntityHandlers(newEntityService)
   
   newEntity := v1.Group("/new-entity")
   {
       newEntity.POST("/", newEntityHandlers.CreateEntity)
   }
   ```

### 错误处理

- 使用统一的错误响应格式
- 在 Service 层处理业务逻辑错误
- 在 Handler 层处理 HTTP 相关错误
- 记录详细的错误日志

### 测试

- 为每层编写单元测试
- 使用依赖注入便于 Mock 测试
- 编写集成测试验证 API 功能

## 核心功能

### 1. 配置管理
- 支持环境变量配置
- 多环境配置支持
- 配置验证和默认值

### 2. 数据库管理
- PostgreSQL 连接池
- GORM 自动迁移
- 事务支持
- 连接健康检查

### 3. 区块链集成
- 以太坊客户端连接
- 账户余额查询
- 区块信息获取
- 网络状态监控

### 4. 消息队列
- Kafka 生产者和消费者
- 消息序列化
- 错误处理和重试
- 主题管理

### 5. API 接口
- RESTful API 设计
- 版本控制 (v1)
- 统一的响应格式
- 错误处理机制

### 6. 中间件
- 日志记录
- CORS 支持
- 请求 ID 追踪
- 错误恢复

## 数据模型

### 用户模型 (User)
- 钱包地址
- 用户名和头像
- 声誉分数
- 创建和更新时间

### 内容模型 (Content)
- 作者关联
- 内容类型 (文章、帖子、评论)
- 状态管理
- 互动统计

### 提案模型 (Proposal)
- 提案信息
- 投票统计
- 时间管理
- 状态跟踪

### 投票模型 (Vote)
- 投票记录
- 权重计算
- 提案关联

### 交易模型 (Transaction)
- 区块链交易记录
- 状态跟踪
- Gas 信息

## 监控和日志

应用使用 Logrus 进行日志记录，支持 JSON 和文本格式。日志级别可通过环境变量 `LOG_LEVEL` 配置。

### 日志特性
- 结构化日志输出
- 请求追踪
- 性能监控
- 错误报告

## 安全考虑

### 输入验证
- 参数验证
- SQL 注入防护
- XSS 防护

### 访问控制
- CORS 配置
- 请求限制
- 认证机制 (待实现)

### 数据保护
- 敏感信息加密
- 日志脱敏
- 错误信息控制

## 性能优化

### 数据库优化
- 连接池配置
- 索引优化
- 查询优化

### 缓存策略
- Redis 缓存支持
- 内存缓存
- 缓存失效策略

### 并发处理
- Goroutine 管理
- 上下文控制
- 资源限制

## 扩展性设计

### 微服务架构
- 服务拆分准备
- 接口标准化
- 消息队列解耦

### 水平扩展
- 无状态设计
- 负载均衡支持
- 数据库分片准备

### 插件化
- 中间件扩展
- 处理器扩展
- 配置扩展

## 未来规划

### 短期目标
- 完善错误处理
- 添加单元测试
- 实现认证机制
- 优化性能

### 中期目标
- 添加监控指标
- 实现缓存策略
- 支持多链
- 完善文档

### 长期目标
- 微服务拆分
- 云原生部署
- 国际化支持
- 社区建设

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 文档: [Documentation]

## 总结

Bondly API 项目采用了现代化的 Go 开发实践，具有良好的架构设计和扩展性。项目为 Bondly 生态系统提供了可靠的后端服务支持，为未来的功能扩展和性能优化奠定了坚实的基础。 