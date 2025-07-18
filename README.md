# **Bondly: Web3 社交内容价值平台**

> **连接你信任的人，分享你创造的价值。**

---

## 🎯 项目简介

**Bondly** 是一个基于区块链技术的去中心化社交内容平台，通过**内容NFT化**、**互动质押机制**和**声誉系统**，重新定义内容创作者与用户之间的价值关系。

### 🌟 核心创新

- **内容即NFT**：每篇内容都可以铸造成NFT，创作者获得真正的数字资产所有权
- **互动质押**：用户通过质押代币参与内容互动，获得奖励的同时支持创作者
- **多链支持**：支持以太坊、Polygon、Arbitrum、Optimism、BSC等多条区块链
- **声誉经济**：基于用户行为的声誉系统，影响奖励分配和平台权限

---

## 🚀 项目亮点

| 功能模块 | 创新特性 | 状态 |
|---------|---------|------|
| 📝 内容创作 | Markdown编辑器 + IPFS存储 + NFT铸造 | ✅ 完成 |
| 💎 互动质押 | 点赞/评论质押 + 创作者奖励分配 | ✅ 完成 |
| 🔗 钱包集成 | 多链钱包支持 + 渐进式登录 | ✅ 完成 |
| 🏛️ 治理系统 | DAO提案 + 投票机制 + 社区决策 | ✅ 完成 |
| 📊 声誉系统 | 行为评分 + 等级成长 + 权益解锁 | ✅ 完成 |
| 🎨 用户体验 | 现代化UI + 响应式设计 + 暗色主题 | ✅ 完成 |

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS (JIT模式)
- **Web3**：Wagmi + Viem + Web3Modal
- **状态管理**：React Context + Hooks
- **编辑器**：Markdown编辑器 + 实时预览
- **存储**：IPFS (Pinata集成)

### 后端技术栈
- **语言**：Go 1.21+
- **框架**：Gin + GORM
- **数据库**：PostgreSQL + Redis
- **消息队列**：Kafka
- **认证**：JWT + 中间件
- **文档**：Swagger/OpenAPI
- **容器化**：Docker + Docker Compose

### 智能合约
- **语言**：Solidity 0.8.19+
- **框架**：Hardhat + TypeScript
- **安全**：OpenZeppelin 5.3.0
- **升级**：UUPS代理模式
- **测试**：覆盖率 >90%

---

## 📦 项目结构

```
Bondly/
├── bondly-fe/           # 前端应用 (React + TypeScript)
├── bondly-api/          # 后端服务 (Go + Gin)
├── bondly-contracts/    # 智能合约 (Solidity + Hardhat)
└── README.md           # 项目文档
```

---

## ⚡ 快速开始

### 环境要求
- **Node.js** >= 18.0.0
- **Go** >= 1.21.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0
- **Git**

### 1. 克隆项目
```bash
git clone https://github.com/your-username/Bondly.git
cd Bondly
```

### 2. 启动前端应用
```bash
cd bondly-fe
npm install
npm run dev
# 访问 http://localhost:5173
```

### 3. 启动后端服务
```bash
cd bondly-api
# 复制环境配置
cp env.example .env
# 修改数据库配置
go mod download
go run main.go
# API服务运行在 http://localhost:8080
```

### 4. 初始化测试数据
```bash
cd bondly-api
go run cmd/seed-data/main.go
```

### 5. 部署智能合约 (可选)
```bash
cd bondly-contracts
npm install
# 配置环境变量
cp env.example .env
# 编译合约
npx hardhat compile
# 部署到测试网
npx hardhat run scripts/deploy/deploy.ts --network sepolia
```

---

## 🎮 核心功能演示

### 内容创作与NFT化
1. 使用Markdown编辑器创建内容
2. 上传图片到IPFS
3. 一键铸造为NFT
4. 在区块链上永久保存

### 互动质押机制
1. 用户质押BOND代币参与互动
2. 点赞/评论内容获得奖励
3. 创作者获得质押奖励
4. 形成正向激励循环

### 多链钱包支持
- 支持MetaMask、WalletConnect等主流钱包
- 自动检测网络并切换
- 跨链资产管理

---

## 📊 数据统计

### 测试数据
- **用户数量**：8个测试用户（包含不同角色）
- **文章数量**：5篇高质量技术文章
- **评论数量**：20条真实用户评论
- **提案数量**：3个治理提案
- **交易记录**：3条链上交易示例

### 合约部署
- **测试网**：Sepolia、Goerli
- **主网**：待部署
- **验证状态**：所有合约已验证

---

## 🔧 开发指南

### 前端开发
```bash
cd bondly-fe
# 安装依赖
npm install
# 启动开发服务器
npm run dev
# 构建生产版本
npm run build
# 运行测试
npm run test
```

### 后端开发
```bash
cd bondly-api
# 安装依赖
go mod download
# 运行服务
go run main.go
# 运行测试
go test ./...
# 生成API文档
swag init
```

### 合约开发
```bash
cd bondly-contracts
# 安装依赖
npm install
# 编译合约
npx hardhat compile
# 运行测试
npx hardhat test
# 生成覆盖率报告
npx hardhat coverage
```

---

## 📚 文档资源

### 📖 合并文档
- [🚀 部署配置指南](bondly-api/docs/DEPLOYMENT_GUIDE.md) - 空投配置、钱包配置、环境变量等部署相关文档
- [🛠️ 技术文档](bondly-api/docs/TECHNICAL_DOCS.md) - 数据库架构、业务日志、邮件服务等技术文档
- [📋 智能合约指南](bondly-contracts/docs/CONTRACTS_GUIDE.md) - 合约架构、部署、测试、脚本工具等完整指南
- [🎨 前端开发指南](bondly-fe/docs/FRONTEND_GUIDE.md) - 前端技术栈、开发规范、部署指南、IPFS集成等

### 🔗 原始文档
- [API文档](http://localhost:8080/swagger/index.html) - 后端API接口文档
- [合约文档](bondly-contracts/docs/) - 智能合约技术文档
- [部署指南](bondly-contracts/DEPLOYMENT.md) - 合约部署说明
- [数据库架构](bondly-api/docs/DATABASE_SCHEMA.md) - 数据库设计文档
- [前端指南](bondly-fe/README.md) - 前端使用指南

---

## 🧪 测试与质量

### 测试覆盖
- **前端测试**：组件测试 + E2E测试
- **后端测试**：单元测试 + 集成测试
- **合约测试**：覆盖率 >90%

### 代码质量
- **ESLint** + **Prettier** - 代码规范
- **TypeScript** - 类型安全
- **Go vet** + **golangci-lint** - Go代码检查
- **Solhint** - Solidity代码检查

---

## 🚀 部署指南

### 生产环境部署
```bash
# 使用Docker Compose一键部署
docker-compose -f docker-compose.prod.yml up -d
```

### 环境变量配置
```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/bondly
REDIS_URL=redis://localhost:6379

# 区块链配置
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com

# IPFS配置
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式
- 🐛 **Bug报告**：通过GitHub Issues提交
- 💡 **功能建议**：在Discussions中讨论
- 📝 **文档改进**：提交Pull Request
- 🔧 **代码贡献**：Fork项目并提交PR

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

---

## 📞 联系我们

- **项目主页**：https://bondly.io
- **GitHub**：https://github.com/bondly
- **Discord**：https://discord.gg/bondly
- **Twitter**：https://twitter.com/bondly_io
- **Email**：hello@bondly.io

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🎉 致谢

感谢所有为Bondly项目做出贡献的开发者和社区成员！

---

**Bondly** - 连接你信任的人，分享你创造的价值 🚀

*"在Web3的世界里，每一次互动都是价值的创造"*