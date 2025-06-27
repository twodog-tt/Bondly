# Bondly Frontend

> **Bondly 前端应用** - 去中心化社交价值网络的 Web 界面

## 📋 项目简介

Bondly 前端是基于 React + TypeScript + Vite 构建的现代化 Web 应用，为用户提供直观友好的去中心化社交平台界面。支持中英文双语，具备响应式设计，适配桌面端和移动端。

## ✨ 功能特性

### 🏠 首页 (Home)
- **项目介绍**：展示 Bondly 的核心价值和愿景
- **项目亮点**：展示技术创新点和优势
- **路线图**：显示项目发展计划
- **用户创建**：三步式用户注册流程
  - 用户名输入与验证
  - 邮箱验证（6位验证码）
  - 头像上传（可选）
- **钱包连接**：Web3 钱包集成（MetaMask 等）

### 📱 动态页 (Feed)
- **内容展示**：用户发布的内容流
- **互动功能**：点赞、评论功能
- **用户信息**：显示用户声誉值和发布时间
- **骨架屏**：加载时的优雅过渡效果
- **统计信息**：活跃用户、新内容、NFT 铸造数据

### 👤 个人资料页 (Profile)
- **用户信息**：头像、用户名、声誉值
- **统计数据**：内容数量、互动数据、NFT 数量
- **成就展示**：用户等级和成就徽章
- **动画效果**：统计卡片进入动画

### 🌐 国际化支持
- **中英文切换**：完整的多语言支持
- **动态翻译**：基于 react-i18next
- **文化适配**：界面元素适配不同语言习惯

### 📱 响应式设计
- **桌面端**：传统导航栏，按钮平铺显示
- **移动端**：汉堡菜单，下拉式导航
- **自适应布局**：根据屏幕尺寸自动调整
- **触摸优化**：移动端触摸交互优化

### 🎨 用户体验
- **动画效果**：页面切换、按钮点击、元素进入动画
- **涟漪效果**：按钮点击的视觉反馈
- **毛玻璃效果**：模态框背景模糊
- **渐变背景**：现代化的视觉设计
- **骨架屏**：加载状态的优雅处理

## 🛠 技术栈

### 核心框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具

### 状态管理
- **React Hooks** - 组件状态管理
- **useState/useEffect** - 本地状态和副作用

### 样式方案
- **Inline Styles** - 组件级样式
- **CSS Animations** - 动画效果
- **CSS Media Queries** - 响应式设计

### 国际化
- **react-i18next** - 国际化框架
- **i18next** - 翻译引擎

### Web3 集成
- **wagmi** - React Hooks for Ethereum
- **RainbowKit** - 钱包连接 UI
- **WalletConnect** - 多钱包支持

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript** - 类型检查
- **Vite** - 开发服务器和构建

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd bondly-fe
npm install
```

### 开发模式
```bash
npm run dev
```
启动开发服务器，默认地址：`http://localhost:5173`

### 构建生产版本
```bash
npm run build
```
生成优化后的生产文件到 `dist` 目录

### 预览生产版本
```bash
npm run preview
```
本地预览构建后的应用

### 代码检查
```bash
npm run lint
```
运行 ESLint 检查代码质量

## 📁 项目结构

```
bondly-fe/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   └── WalletConnect.tsx
│   ├── config/            # 配置文件
│   │   └── wagmi.ts
│   ├── locales/           # 国际化文件
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── zh/
│   │       └── translation.json
│   ├── pages/             # 页面组件
│   │   ├── Home.tsx       # 首页
│   │   ├── Feed.tsx       # 动态页
│   │   └── Profile.tsx    # 个人资料页
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── i18n.ts            # 国际化配置
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 🎯 核心功能详解

### 用户创建流程
1. **用户名输入**：实时验证用户名格式
2. **邮箱验证**：发送6位验证码到邮箱
3. **头像上传**：支持上传或跳过头像设置
4. **成功反馈**：创建成功后的确认界面

### 响应式导航
- **桌面端**：水平排列的导航按钮
- **移动端**：汉堡菜单 + 下拉导航
- **语言切换**：右上角的语言选择按钮

### 页面切换动画
- **淡入淡出**：页面切换的平滑过渡
- **滑动效果**：内容区域的进入动画
- **涟漪效果**：按钮交互的视觉反馈

## 🔧 配置说明

### 环境变量
```bash
# WalletConnect 项目 ID（需要注册获取）
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 国际化配置
- 支持语言：中文 (zh)、英文 (en)
- 默认语言：中文
- 动态切换：无需刷新页面

### 响应式断点
- 移动端：<= 768px
- 桌面端：> 768px

## 🐛 常见问题

### Q: 钱包连接不工作？
A: 需要设置有效的 WalletConnect Project ID，或暂时注释掉钱包连接组件。

### Q: 移动端菜单不显示？
A: 确保窗口宽度 <= 768px，或检查 z-index 设置。

### Q: 国际化不生效？
A: 检查 `src/locales` 目录下的翻译文件是否完整。

### Q: 构建失败？
A: 检查 Node.js 版本和依赖安装是否完整。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [Bondly 项目主页](../README.md)
- [技术文档](../docs/)
- [API 文档](../docs/api.md)

---

**Bondly Frontend** - 连接你信任的人，分享你创造的价值 🚀 