# Bondly API 文档

## 概述

Bondly API 提供了与 Bondly 智能合约交互的 RESTful 接口。所有接口都返回 JSON 格式的数据。

## 基础信息

- **Base URL**: `http://localhost:8080`
- **API 版本**: `v1`
- **内容类型**: `application/json`

## 认证

目前 API 不需要认证，但建议在生产环境中实现适当的认证机制。

## 响应格式

所有 API 响应都遵循以下格式：

```json
{
  "status": "success|error",
  "message": "响应消息",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 错误处理

错误响应格式：

```json
{
  "status": "error",
  "message": "错误描述",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## API 端点

### 健康检查

#### GET /health

检查服务健康状态。

**响应示例：**
```json
{
  "status": "ok",
  "message": "Bondly API is running",
  "version": "1.0.0"
}
```

### 区块链相关

#### GET /api/v1/blockchain/status

获取区块链连接状态。

**响应示例：**
```json
{
  "status": "connected",
  "network": "ethereum",
  "message": "Blockchain connection status"
}
```

#### GET /api/v1/blockchain/contract/:address

获取指定合约的信息。

**参数：**
- `address` (string): 合约地址

**响应示例：**
```json
{
  "address": "0x1234567890abcdef...",
  "status": "active",
  "message": "Contract information"
}
```

### 用户相关

#### GET /api/v1/users/:address

获取用户信息。

**参数：**
- `address` (string): 用户钱包地址

**响应示例：**
```json
{
  "address": "0x1234567890abcdef...",
  "message": "User information"
}
```

#### GET /api/v1/users/:address/balance

获取用户余额。

**参数：**
- `address` (string): 用户钱包地址

**响应示例：**
```json
{
  "address": "0x1234567890abcdef...",
  "balance": "1000000000000000000",
  "message": "User balance"
}
```

### 内容相关

#### GET /api/v1/content/

获取内容列表。

**查询参数：**
- `page` (int): 页码，默认 1
- `limit` (int): 每页数量，默认 10
- `type` (string): 内容类型 (article, post, comment)

**响应示例：**
```json
{
  "content": [],
  "message": "Content list"
}
```

#### GET /api/v1/content/:id

获取内容详情。

**参数：**
- `id` (int): 内容ID

**响应示例：**
```json
{
  "id": 1,
  "message": "Content detail"
}
```

### 治理相关

#### GET /api/v1/governance/proposals

获取提案列表。

**查询参数：**
- `page` (int): 页码，默认 1
- `limit` (int): 每页数量，默认 10
- `status` (string): 提案状态 (active, passed, rejected, executed)

**响应示例：**
```json
{
  "proposals": [],
  "message": "Proposals list"
}
```

#### GET /api/v1/governance/proposals/:id

获取提案详情。

**参数：**
- `id` (int): 提案ID

**响应示例：**
```json
{
  "id": 1,
  "message": "Proposal detail"
}
```

## 状态码

- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 速率限制

目前没有实现速率限制，但建议在生产环境中添加适当的限制。

## 版本控制

API 版本通过 URL 路径控制，当前版本为 `v1`。未来版本将使用 `v2`、`v3` 等。

## 更新日志

### v1.0.0
- 初始版本
- 基础的健康检查接口
- 区块链状态查询接口
- 用户信息查询接口
- 内容管理接口
- 治理提案接口 