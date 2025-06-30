# Bondly Frontend (bondly-fe)

> **去中心化社交价值网络的前端应用**

## 📋 项目概述

Bondly Frontend 是基于 React + TypeScript + Vite 构建的现代化 Web3 社交平台前端应用。支持渐进式登录、内容创作、社交互动、NFT 铸造等核心功能。

## 🚀 核心功能

### 用户系统

- **渐进式登录**: 支持邮箱/社交账户登录，逐步引导至 Web3 钱包
- **钱包连接**: 集成 Web3Auth，支持多种钱包类型
- **用户档案**: 链上声誉系统，SBT 身份展示

### 内容系统

- **富文本编辑器**: 支持 Markdown、图片、视频、代码块
- **多媒体支持**: 图片上传、视频嵌入、代码高亮
- **草稿管理**: 自动保存、版本控制
- **发布系统**: 定时发布、多语言支持

### 社交互动

- **点赞/评论**: 基于质押的互动机制
- **回复系统**: 嵌套评论、@用户功能
- **举报机制**: 内容审核、社区治理
- **打赏系统**: 支持 Token、NFT、SBT 打赏

### 通知系统

- **实时通知**: 互动提醒、系统消息
- **全局通知**: Toast 消息、状态提示

## 🛠 技术栈

### 核心框架

- **React 18**: 现代化 UI 框架
- **TypeScript**: 类型安全开发
- **Vite**: 快速构建工具
- **React Router**: 路由管理

### UI 组件

- **Tailwind CSS**: 原子化 CSS 框架
- **Headless UI**: 无样式组件库
- **Lucide React**: 图标库

### Web3 集成

- **Wagmi**: React Hooks for Ethereum
- **Web3Auth**: 渐进式登录解决方案
- **Ethers.js**: 以太坊交互

### 国际化

- **i18next**: 多语言支持
- **React i18next**: React 集成

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件
│   ├── editor/         # 编辑器组件
│   ├── publish/        # 发布相关组件
│   └── ...            # 其他功能组件
├── pages/              # 页面组件
│   ├── Home.tsx       # 首页
│   ├── Feed.tsx       # 内容流
│   ├── Editor.tsx     # 编辑器
│   ├── Profile.tsx    # 用户档案
│   └── Drafts.tsx     # 草稿管理
├── config/            # 配置文件
├── locales/           # 国际化文件
└── main.tsx          # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
cd bondly-fe
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
VITE_RPC_URL=your_ethereum_rpc_url
VITE_CHAIN_ID=1
```

### 钱包配置

在 `src/config/wagmi.ts` 中配置：

- 支持的链网络
- RPC 端点
- 钱包连接器

## 🌐 国际化

支持中文和英文两种语言：

- 中文翻译: `src/locales/zh/translation.json`
- 英文翻译: `src/locales/en/translation.json`

## 📦 部署

### Docker 部署

```bash
docker build -t bondly-fe .
docker run -p 3000:80 bondly-fe
```

### 静态部署

构建后的文件位于 `dist/` 目录，可直接部署到任何静态文件服务器。

## 🔄 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks

### 组件开发

- 组件文件使用 PascalCase 命名
- Props 接口定义在组件文件顶部
- 使用 Tailwind CSS 进行样式开发

### Git 提交

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [项目主页](https://bondly.io)
- [API 文档](../bondly-api/README.md)
- [智能合约](../bondly-contracts/README.md)
- [技术文档](../docs/README.md)
