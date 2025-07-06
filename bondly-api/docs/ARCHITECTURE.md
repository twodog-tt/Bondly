# Bondly API 架构文档

## 概述

Bondly API 采用分层架构设计，遵循依赖注入和单一职责原则，提供高可维护性和可扩展性的后端服务。

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Handlers (HTTP 请求处理)                                    │
│  ├── handlers.go (基础处理器)                                │
│  ├── user_handlers.go (用户处理器)                           │
│  └── ... (其他业务处理器)                                    │
├─────────────────────────────────────────────────────────────┤
│  Services (业务逻辑层)                                       │
│  ├── user_service.go (用户业务逻辑)                          │
│  └── ... (其他业务服务)                                      │
├─────────────────────────────────────────────────────────────┤
│  Repositories (数据访问层)                                   │
│  ├── user_repository.go (用户数据访问)                       │
│  └── ... (其他数据访问)                                      │
├─────────────────────────────────────────────────────────────┤
│  Models (数据模型层)                                         │
│  ├── models.go (数据模型定义)                                │
│  └── ... (其他模型)                                          │
├─────────────────────────────────────────────────────────────┤
│  Database (数据存储层)                                       │
│  ├── PostgreSQL (主数据库)                                   │
│  ├── Redis (缓存)                                           │
│  └── Kafka (消息队列)                                        │
└─────────────────────────────────────────────────────────────┘
```

## 分层职责

### 1. Handlers 层
**职责**: HTTP 请求处理、参数验证、响应格式化

**特点**:
- 处理 HTTP 请求和响应
- 参数验证和绑定
- 调用 Service 层处理业务逻辑
- 统一的错误处理和响应格式

**示例**:
```go
func (h *UserHandlers) GetUserInfo(c *gin.Context) {
    address := c.Param("address")
    if address == "" {
        utils.BadRequest(c, "address parameter is required")
        return
    }
    
    user, err := h.userService.GetUserByAddress(address)
    if err != nil {
        utils.NotFound(c, "user not found")
        return
    }
    
    utils.Success(c, user)
}
```

### 2. Services 层
**职责**: 业务逻辑处理、数据验证、事务管理

**特点**:
- 实现核心业务逻辑
- 数据验证和业务规则检查
- 事务管理和协调
- 调用 Repository 层进行数据操作

**示例**:
```go
func (s *UserService) CreateUser(user *models.User) error {
    if user.Address == "" {
        return errors.New("user address cannot be empty")
    }
    
    // 检查用户是否已存在
    existingUser, _ := s.userRepo.GetByAddress(user.Address)
    if existingUser != nil {
        return errors.New("user already exists")
    }
    
    return s.userRepo.Create(user)
}
```

### 3. Repositories 层
**职责**: 数据访问封装、数据库操作

**特点**:
- 封装数据库操作
- 提供数据访问接口
- 处理数据库连接和事务
- 与具体数据库技术解耦

**示例**:
```go
func (r *UserRepository) GetByAddress(address string) (*models.User, error) {
    var user models.User
    err := r.db.Where("address = ?", address).First(&user).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}
```

### 4. Models 层
**职责**: 数据模型定义、ORM 映射

**特点**:
- 定义数据结构
- GORM 标签配置
- 数据验证规则
- 关联关系定义

**示例**:
```go
type User struct {
    ID         uint           `json:"id" gorm:"primaryKey"`
    Address    string         `json:"address" gorm:"uniqueIndex;not null"`
    Username   string         `json:"username"`
    Reputation int64          `json:"reputation" gorm:"default:0"`
    CreatedAt  time.Time      `json:"created_at"`
    UpdatedAt  time.Time      `json:"updated_at"`
    DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
```

## 依赖注入

项目使用依赖注入模式，提高代码的可测试性和可维护性：

```go
// 在 server.go 中初始化依赖
func NewServer(cfg *config.Config, db *gorm.DB, logger *logger.Logger) *Server {
    // 初始化依赖
    userRepo := repositories.NewUserRepository(db)
    userService := services.NewUserService(userRepo)
    userHandlers := handlers.NewUserHandlers(userService)
    
    // 注入依赖
    server := &Server{
        config:       cfg,
        db:           db,
        logger:       logger,
        userHandlers: userHandlers,
    }
    
    return server
}
```

## 统一响应格式

所有 API 都使用统一的响应格式：

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "address": "0x1234567890abcdef",
    "username": "testuser"
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "address parameter is required"
}
```

### 响应工具函数
```go
// 成功响应
utils.Success(c, data)

// 错误响应
utils.BadRequest(c, "错误信息")
utils.NotFound(c, "资源不存在")
utils.InternalError(c, "服务器内部错误")
utils.ValidationError(c, "验证失败")
```

## 错误处理策略

### 1. 分层错误处理
- **Handlers 层**: 处理 HTTP 相关错误
- **Services 层**: 处理业务逻辑错误
- **Repositories 层**: 处理数据访问错误

### 2. 错误传播
```go
// Repository 层返回原始错误
func (r *UserRepository) GetByAddress(address string) (*models.User, error) {
    var user models.User
    err := r.db.Where("address = ?", address).First(&user).Error
    if err != nil {
        return nil, err // 返回原始数据库错误
    }
    return &user, nil
}

// Service 层处理业务错误
func (s *UserService) GetUserByAddress(address string) (*models.User, error) {
    if address == "" {
        return nil, errors.New("address cannot be empty") // 业务错误
    }
    
    user, err := s.userRepo.GetByAddress(address)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("user not found") // 转换为业务错误
        }
        return nil, err // 其他错误直接传播
    }
    
    return user, nil
}

// Handler 层统一响应
func (h *UserHandlers) GetUserInfo(c *gin.Context) {
    user, err := h.userService.GetUserByAddress(address)
    if err != nil {
        if err.Error() == "user not found" {
            utils.NotFound(c, err.Error())
        } else {
            utils.InternalError(c, "failed to get user")
        }
        return
    }
    
    utils.Success(c, user)
}
```

## 开发最佳实践

### 1. 添加新业务模块的步骤

1. **定义数据模型** (`internal/models/`)
2. **创建数据访问层** (`internal/repositories/`)
3. **实现业务逻辑** (`internal/services/`)
4. **添加 HTTP 处理器** (`internal/handlers/`)
5. **注册路由** (`internal/server/server.go`)

### 2. 命名规范

- **文件命名**: 使用下划线分隔，如 `user_handlers.go`
- **结构体命名**: 使用大驼峰，如 `UserService`
- **方法命名**: 使用大驼峰，如 `GetUserByAddress`
- **变量命名**: 使用小驼峰，如 `userAddress`

### 3. 测试策略

- **单元测试**: 为每层编写独立的单元测试
- **集成测试**: 测试 API 端点的完整功能
- **Mock 测试**: 使用依赖注入便于 Mock 测试

### 4. 性能优化

- **数据库索引**: 为常用查询字段添加索引
- **连接池**: 配置数据库连接池参数
- **缓存策略**: 使用 Redis 缓存热点数据
- **分页查询**: 大数据量查询使用分页

## 技术栈

- **Web 框架**: Gin
- **ORM**: GORM
- **数据库**: PostgreSQL
- **缓存**: Redis
- **消息队列**: Kafka
- **日志**: Logrus
- **配置管理**: godotenv
- **容器化**: Docker + Docker Compose

## 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   API Gateway   │    │   Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Bondly API     │    │   PostgreSQL    │    │     Redis       │
│  (Multiple)     │    │   Database      │    │     Cache       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Kafka       │    │   Zookeeper     │    │   Log Storage   │
│  Message Queue  │    │   (Kafka Dep)   │    │   (ELK Stack)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

这个架构设计确保了系统的可扩展性、可维护性和高性能。 