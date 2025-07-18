# IPFS 配置指南

## 问题解决步骤

### 1. 检查当前状态

在浏览器控制台中运行以下命令来检查IPFS状态：

```javascript
// 检查IPFS状态
IPFSDebug.getStatus()

// 显示环境变量
IPFSDebug.showEnvVars()

// 测试IPFS连接
IPFSDebug.testConnection()
```

### 2. 配置Infura IPFS

#### 步骤1: 创建Infura账户
1. 访问 [Infura](https://infura.io/)
2. 注册账户并登录
3. 创建新项目
4. 在项目设置中启用IPFS服务

#### 步骤2: 获取IPFS凭据
1. 在Infura项目页面，找到IPFS部分
2. 复制Project ID和Project Secret
3. 这些凭据用于访问Infura的IPFS服务

#### 步骤3: 创建环境变量文件
在`bondly-fe`目录下创建`.env.local`文件：

```bash
# IPFS Configuration
VITE_INFURA_IPFS_PROJECT_ID=your_infura_ipfs_project_id
VITE_INFURA_IPFS_PROJECT_SECRET=your_infura_ipfs_project_secret

# Alternative IPFS Gateway (optional)
VITE_IPFS_GATEWAY=https://ipfs.io
```

### 3. 重启开发服务器

```bash
cd bondly-fe
npm run dev
```

### 4. 验证配置

在浏览器控制台中运行：

```javascript
IPFSDebug.testConnection()
```

如果看到"✅ IPFS client ready"，说明配置成功。

## 常见问题

### 问题1: "Missing IPFS credentials"
**原因**: 环境变量未设置
**解决**: 按照步骤2配置环境变量

### 问题2: "IPFS client error"
**原因**: IPFS客户端创建失败
**解决**: 
1. 检查网络连接
2. 验证Infura凭据是否正确
3. 尝试重置IPFS客户端：`IPFSDebug.reset()`

### 问题3: 模块加载错误
**原因**: IPFS依赖问题
**解决**:
```bash
cd bondly-fe
npm install ipfs-http-client@latest
```

## 调试命令

在浏览器控制台中可用的调试命令：

- `IPFSDebug.getStatus()` - 获取IPFS状态
- `IPFSDebug.reset()` - 重置IPFS客户端
- `IPFSDebug.testConnection()` - 测试IPFS连接
- `IPFSDebug.showEnvVars()` - 显示环境变量

## 降级方案

如果IPFS配置失败，系统会自动使用模拟hash，确保应用正常运行。但NFT功能将无法真正上传到IPFS。 