# Bondly 前端开发指南

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [IPFS集成](#ipfs集成)

---

## 🚀 项目概述

Bondly 前端是基于 React + TypeScript + Vite 构建的现代化 Web3 应用，提供完整的去中心化内容创作平台用户界面。

### 核心特性

- **现代化技术栈**: React 18 + TypeScript + Vite
- **Web3 集成**: Wagmi + Viem + RainbowKit
- **国际化支持**: i18next 多语言支持
- **响应式设计**: 移动端和桌面端完美适配
- **代码质量**: ESLint + Prettier + TypeScript 严格模式
- **性能优化**: 代码分割、懒加载、构建优化
- **质押管理**: 完整的质押流动性管理界面，支持管理员添加奖励

---

## 🛠️ 技术栈

### 核心技术
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Tailwind CSS** - 原子化CSS框架

### Web3技术
- **Wagmi** - React Hooks for Ethereum
- **Viem** - 以太坊客户端
- **RainbowKit** - 钱包连接组件
- **WalletConnect** - 多钱包支持

### 状态管理
- **Zustand** - 轻量级状态管理
- **React Context** - 全局状态共享

### 路由和导航
- **React Router** - 客户端路由
- **React Navigation** - 移动端导航

### 开发工具
- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查

---

## ⚡ 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd bondly-fe

# 安装依赖
npm install
```

### 环境配置

创建 `.env.local` 文件：

```env
# API配置
VITE_API_URL=http://localhost:8080

# Web3配置
VITE_WAGMI_PROJECT_ID=your_walletconnect_project_id

# IPFS配置
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix

# TypeScript 类型检查
npm run type-check

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### 启动开发服务器

```bash
# 必须进入bondly-fe目录
cd bondly-fe
npm run dev
```

服务器将在 `http://localhost:5173` 启动。

---

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   │   ├── Button.tsx
│   │   └── AutoSaveIndicator.tsx
│   ├── editor/         # 编辑器相关组件
│   │   ├── EditorToolbar.tsx
│   │   ├── MarkdownPreview.tsx
│   │   └── MediaUploader.tsx
│   ├── publish/        # 发布相关组件
│   │   ├── PublishModal.tsx
│   │   └── ScheduleModal.tsx
│   ├── CommentSection.tsx
│   ├── CommonNavbar.tsx
│   ├── ContentInteraction.tsx
│   ├── ContentInteractionSimple.tsx
│   ├── EditProfileModal.tsx
│   ├── FeaturedArticles.tsx
│   ├── FollowButton.tsx
│   ├── Footer.tsx
│   ├── GovernanceSection.tsx
│   ├── HeroSection.tsx
│   ├── Navbar.tsx
│   ├── NotificationProvider.tsx
│   ├── ReportModal.tsx
│   ├── StakeSection.tsx
│   ├── TipModal.tsx
│   ├── WalletAddressExample.tsx
│   ├── WalletBindingModal.tsx
│   ├── WalletChoiceModal.tsx
│   └── WalletConnect.tsx
├── pages/              # 页面组件
│   ├── BlogDetailPage.tsx
│   ├── BlogListPage.tsx
│   ├── DaoPage.tsx
│   ├── Drafts.tsx
│   ├── Editor.tsx
│   ├── Feed.tsx
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── StakePage.tsx
│   └── UserPublicProfilePage.tsx
├── hooks/              # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useBondBalance.ts
│   ├── useResponsive.ts
│   └── useStaking.ts
├── utils/              # 工具函数
│   ├── api.ts
│   ├── ripple.ts
│   └── token.ts
├── styles/             # 样式文件
│   ├── animations.css
│   └── global.css
├── config/             # 配置文件
│   ├── contracts.ts
│   ├── env.ts
│   └── wagmi.ts
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── WalletConnectContext.tsx
├── types/              # TypeScript 类型定义
│   └── global.d.ts
├── api/                # API接口
│   ├── comment.ts
│   ├── content.ts
│   ├── follow.ts
│   ├── request.ts
│   ├── upload.ts
│   └── user.ts
├── App.tsx             # 应用根组件
├── main.tsx            # 应用入口
└── vite-env.d.ts       # Vite类型定义
```

---

## 🎨 开发指南

### 样式系统

#### Tailwind CSS 配置

项目使用 Tailwind CSS 的 JIT (Just-In-Time) 引擎，支持任意值：

```tsx
// 支持任意值
<div className="bg-[#0b0c1a] text-gray-400 rounded-xl">
  <div className="border border-gray-700 px-6 py-10">
    <h1 className="text-xl font-bold text-white">标题</h1>
  </div>
</div>
```

#### 主题色彩

- **背景色**: `bg-[#0b0c1a]` (深色主题)
- **卡片背景**: `bg-[#151728]`
- **主文本**: `text-white`
- **次要文本**: `text-gray-400`
- **链接**: `text-blue-400 hover:underline`
- **边框**: `border border-gray-700`

#### 按钮样式

```tsx
// 主要按钮
<button className="bg-blue-600 text-white px-6 py-2 rounded-xl">
  主要按钮
</button>

// 次要按钮
<button className="border border-gray-600 text-white hover:bg-gray-700 px-6 py-2 rounded-xl">
  次要按钮
</button>
```

### 组件开发规范

#### 组件结构

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#151728] border border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {/* 组件内容 */}
    </div>
  );
};
```

#### 响应式设计

```tsx
import { useResponsive } from '@hooks/useResponsive';

const Component = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className={`
      ${isMobile ? 'px-4' : 'px-6'}
      ${isDesktop ? 'max-w-5xl' : 'max-w-full'}
      mx-auto
    `}>
      {/* 内容 */}
    </div>
  );
};
```

### Web3 集成

#### 钱包连接

```tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <span>已连接: {address}</span>
        <button onClick={() => disconnect()}>断开连接</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          连接 {connector.name}
        </button>
      ))}
    </div>
  );
};
```

#### 合约交互

```tsx
import { useContractRead, useContractWrite } from 'wagmi';
import { bondTokenABI } from '@config/contracts';

const BondBalance = () => {
  const { address } = useAccount();
  
  const { data: balance } = useContractRead({
    address: bondTokenAddress,
    abi: bondTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return (
    <div>
      <span>BOND 余额: {balance?.toString() || '0'}</span>
    </div>
  );
};
```

### 国际化

#### 配置翻译

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('zh')}>中文</button>
    </div>
  );
};
```

#### 翻译文件结构

```
locales/
├── en/
│   └── translation.json
└── zh/
    └── translation.json
```

### 状态管理

#### Zustand Store

```tsx
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

#### React Context

```tsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🚀 部署指南

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### Docker 部署

#### Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 环境变量配置

#### 生产环境

```env
# API配置
VITE_API_URL=https://api.bondly.com

# Web3配置
VITE_WAGMI_PROJECT_ID=your_production_project_id

# IPFS配置
VITE_PINATA_JWT=your_production_pinata_jwt
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 🌐 IPFS集成

### Pinata 配置

项目使用 Pinata 作为 IPFS 服务提供商，支持内容上传和存储。

#### 环境变量

```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

#### 上传文件

```tsx
import { uploadToIPFS } from '@utils/ipfs';

const uploadFile = async (file: File) => {
  try {
    const hash = await uploadToIPFS(file);
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    return url;
  } catch (error) {
    console.error('IPFS上传失败:', error);
    throw error;
  }
};
```

#### 上传JSON元数据

```tsx
const uploadMetadata = async (metadata: any) => {
  try {
    const jsonString = JSON.stringify(metadata);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    
    const hash = await uploadToIPFS(file);
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  } catch (error) {
    console.error('元数据上传失败:', error);
    throw error;
  }
};
```

### NFT 元数据标准

#### 内容NFT元数据

```json
{
  "name": "文章标题",
  "description": "文章描述",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "attributes": [
    {
      "trait_type": "作者",
      "value": "0x..."
    },
    {
      "trait_type": "创建时间",
      "value": "2024-12-01T00:00:00Z"
    },
    {
      "trait_type": "内容类型",
      "value": "article"
    }
  ],
  "external_url": "https://bondly.com/article/123",
  "animation_url": "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

#### 成就NFT元数据

```json
{
  "name": "成就徽章",
  "description": "用户获得的成就描述",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "attributes": [
    {
      "trait_type": "成就类型",
      "value": "content_creator"
    },
    {
      "trait_type": "获得时间",
      "value": "2024-12-01T00:00:00Z"
    },
    {
      "trait_type": "稀有度",
      "value": "rare"
    }
  ]
}
```

---

## 🐛 调试指南

### 开发调试

#### 前端调试

- 开发模式下的热重载
- 错误边界捕获 React 错误
- 控制台错误日志
- 网络请求监控

#### Web3调试

```tsx
// 启用Wagmi调试
import { createConfig } from 'wagmi';

const config = createConfig({
  // ... 其他配置
  logger: {
    warn: (message) => console.warn(message),
  },
});
```

#### 网络请求调试

```tsx
// API请求调试
import { api } from '@utils/api';

const fetchData = async () => {
  try {
    const response = await api.get('/users/profile');
    console.log('API响应:', response);
  } catch (error) {
    console.error('API错误:', error);
  }
};
```

### 性能优化

#### 代码分割

```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>加载中...</div>}>
    <LazyComponent />
  </Suspense>
);
```

#### 图片优化

```tsx
// 使用WebP格式
<img 
  src="image.webp" 
  alt="描述"
  loading="lazy"
  className="w-full h-auto"
/>
```

#### 缓存策略

```tsx
// 使用React.memo优化组件
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

---

## 📱 响应式设计

### 断点配置

```css
/* Tailwind 默认断点 */
sm: 640px   /* 小屏幕 */
md: 768px   /* 中等屏幕 */
lg: 1024px  /* 大屏幕 */
xl: 1280px  /* 超大屏幕 */
2xl: 1536px /* 2倍超大屏幕 */
```

### 移动端适配

```tsx
import { useResponsive } from '@hooks/useResponsive';

const Component = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className={`
      ${isMobile ? 'px-4 text-sm' : 'px-6 text-base'}
      ${isDesktop ? 'max-w-5xl' : 'max-w-full'}
      mx-auto
    `}>
      {/* 内容 */}
    </div>
  );
};
```

### 触摸优化

```tsx
// 触摸友好的按钮
<button className="
  min-h-[44px] 
  min-w-[44px] 
  touch-manipulation
  active:scale-95
  transition-transform
">
  按钮
</button>
```

---

**文档版本**: v1.0 | **最后更新**: 2024年12月 