# Pinata IPFS 配置指南

## 为什么选择Pinata？

### 优势
- **免费额度**：1GB存储，每天100次请求
- **简单易用**：API接口清晰，文档完善
- **稳定可靠**：专业的IPFS服务提供商
- **无需复杂配置**：只需要API Key和Secret Key

### 限制
- 免费版每天限制100次请求
- 存储空间限制1GB
- 适合个人项目和小型应用

## 配置步骤

### 1. 注册Pinata账户

1. 访问 [Pinata官网](https://pinata.cloud/)
2. 点击 "Sign Up" 注册账户
3. 验证邮箱地址

### 2. 获取API凭据

1. 登录Pinata控制台
2. 点击右上角的用户头像
3. 选择 "API Keys"
4. 点击 "New Key" 创建新的API Key
5. 复制以下信息：
   - **API Key**
   - **Secret API Key**

### 3. 配置环境变量

在 `bondly-fe/.env.local` 文件中添加：

```bash
# Pinata IPFS配置
VITE_PINATA_API_KEY=你的pinata_api_key
VITE_PINATA_SECRET_API_KEY=你的pinata_secret_api_key

# 可选：使用Pinata网关
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud
```

### 4. 重启服务器

```bash
cd bondly-fe
npm run dev
```

## 测试配置

### 方法1: 使用测试页面

访问：`http://localhost:5173/?page=ipfs-test`

点击以下按钮测试：
- **🔐 认证测试** - 测试Pinata连接
- **⚙️ 当前配置测试** - 详细诊断配置

### 方法2: 使用控制台

在浏览器控制台中运行：

```javascript
// 检查Pinata状态
getPinataStatus()

// 测试Pinata连接
testIPFSConnectionUnified()
```

## 代码使用

### 使用统一IPFS服务

```javascript
import { ipfsService, uploadToIPFSUnified } from '../utils/ipfs-service';

// 上传内容
const hash = await uploadToIPFSUnified('Hello World', 'test.txt');

// 获取服务状态
const status = ipfsService.getStatus();
console.log('Current provider:', status.currentProvider);

// 测试连接
const testResult = await ipfsService.testConnection();
```

### 直接使用Pinata

```javascript
import { uploadToPinataAPI } from '../utils/ipfs-pinata';

// 使用Pinata API上传
const hash = await uploadToPinataAPI('Hello World', 'test.txt');
```

## 常见问题

### Q: 如何查看使用量？
A: 在Pinata控制台的 "Dashboard" 页面可以看到当前使用量。

### Q: 超出免费额度怎么办？
A: 可以升级到付费计划，或者切换到Infura IPFS。

### Q: 上传失败怎么办？
A: 检查API Key是否正确，网络连接是否正常。

### Q: 如何删除上传的文件？
A: 在Pinata控制台的 "Files" 页面可以管理已上传的文件。

## 与Infura对比

| 特性 | Pinata | Infura |
|------|--------|--------|
| 免费额度 | 1GB存储，100次/天 | 5GB存储，1000次/天 |
| 认证方式 | API Key | Project ID + Secret |
| 配置复杂度 | 简单 | 中等 |
| 稳定性 | 高 | 高 |
| 推荐场景 | 个人项目，小规模应用 | 企业级应用 |

## 迁移指南

如果你之前使用Infura，想要迁移到Pinata：

1. 获取Pinata API凭据
2. 更新 `.env.local` 文件
3. 重启服务器
4. 运行测试确认配置正确

代码会自动检测并使用可用的IPFS提供商，无需修改现有代码。 