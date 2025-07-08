# Swagger 文档测试指南

## 🎯 测试步骤

### 1. 启动服务器
```bash
cd bondly-api
go run main.go
```

### 2. 访问 Swagger UI
打开浏览器访问：
```
http://localhost:8080/swagger/index.html
```

### 3. 测试API文档
- 查看所有API分组（认证管理、用户管理、区块链、内容管理、治理管理、系统监控）
- 展开各个API查看详细参数和响应格式
- 使用 "Try it out" 功能测试API

## 📋 API 分组总览

### 🔐 认证管理 (Authentication)
- `POST /auth/send-code` - 发送邮箱验证码
- `POST /auth/verify-code` - 验证邮箱验证码  
- `GET /auth/code-status` - 查询验证码状态

### 👤 用户管理 (User Management)
- `GET /users/{address}` - 获取用户详细信息
- `GET /users/{address}/balance` - 获取用户代币余额
- `GET /users/{address}/reputation` - 获取用户声誉值
- `POST /users` - 创建新用户

### ⛓️ 区块链 (Blockchain)
- `GET /blockchain/status` - 获取区块链连接状态
- `GET /blockchain/contract/{address}` - 获取智能合约信息

### 📄 内容管理 (Content)
- `GET /content` - 获取内容列表
- `GET /content/{id}` - 获取内容详情

### 🏛️ 治理管理 (Governance)
- `GET /governance/proposals` - 获取治理提案列表
- `GET /governance/proposals/{id}` - 获取提案详情

### 🔍 系统监控 (System)
- `GET /health` - 健康检查

## 🧪 样例请求

### 发送验证码
```bash
curl -X POST "http://localhost:8080/api/v1/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 验证验证码
```bash
curl -X POST "http://localhost:8080/api/v1/auth/verify-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### 查询验证码状态
```bash
curl "http://localhost:8080/api/v1/auth/code-status?email=test@example.com"
``` 