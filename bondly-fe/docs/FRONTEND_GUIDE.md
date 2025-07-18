# Bondly Frontend Development Guide

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [IPFS Integration](#ipfs-integration)

---

## 🚀 Project Overview

Bondly frontend is a modern Web3 application built with React + TypeScript + Vite, providing a complete user interface for the decentralized content creation platform.

### Core Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite
- **Web3 Integration**: Wagmi + Viem + RainbowKit
- **Internationalization**: i18next multi-language support
- **Responsive Design**: Perfect adaptation for mobile and desktop
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Performance Optimization**: Code splitting, lazy loading, build optimization
- **Staking Management**: Complete staking liquidity management interface, supports admin reward addition

---

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - User interface framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Atomic CSS framework

### Web3 Technologies
- **Wagmi** - React Hooks for Ethereum
- **Viem** - Ethereum client
- **RainbowKit** - Wallet connection components
- **WalletConnect** - Multi-wallet support

### State Management
- **Zustand** - Lightweight state management
- **React Context** - Global state sharing

### Routing and Navigation
- **React Router** - Client-side routing
- **React Navigation** - Mobile navigation

### Development Tools
- **ESLint** - Code specification checking
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## ⚡ Quick Start

### Environment Requirements

- Node.js 18+
- npm or yarn
- Git

### Install Dependencies

```bash
# Clone project
git clone <repository-url>
cd bondly-fe

# Install dependencies
npm install
```

### Environment Configuration

Create `.env.local` file:

```env
# API configuration
VITE_API_URL=http://localhost:8080

# Web3 configuration
VITE_WAGMI_PROJECT_ID=your_walletconnect_project_id

# IPFS configuration
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Development Commands

```bash
# Start development server
npm run dev

# Build production version
npm run build

# Preview build results
npm run preview

# Code checking
npm run lint

# Auto-fix code format
npm run lint:fix

# TypeScript type checking
npm run type-check

# Format code
npm run format

# Check code format
npm run format:check
```

### Start Development Server

```bash
# Must enter bondly-fe directory
cd bondly-fe
npm run dev
```

Server will start at `http://localhost:5173`.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common components
│   │   ├── Button.tsx
│   │   └── AutoSaveIndicator.tsx
│   ├── editor/         # Editor related components
│   │   ├── EditorToolbar.tsx
│   │   ├── MarkdownPreview.tsx
│   │   └── MediaUploader.tsx
│   ├── publish/        # Publish related components
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
├── pages/              # Page components
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
├── hooks/              # Custom Hooks
│   ├── useAuth.ts
│   ├── useBondBalance.ts
│   ├── useResponsive.ts
│   └── useStaking.ts
├── utils/              # Utility functions
│   ├── api.ts
│   ├── ripple.ts
│   └── token.ts
├── styles/             # Style files
│   ├── animations.css
│   └── global.css
├── config/             # Configuration files
│   ├── contracts.ts
│   ├── env.ts
│   └── wagmi.ts
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── WalletConnectContext.tsx
├── types/              # TypeScript type definitions
│   └── global.d.ts
├── api/                # API interfaces
│   ├── comment.ts
│   ├── content.ts
│   ├── follow.ts
│   ├── request.ts
│   ├── upload.ts
│   └── user.ts
├── App.tsx             # Application root component
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite type definitions
```

---

## 🎨 Development Guide

### Style System

#### Tailwind CSS Configuration

Project uses Tailwind CSS's JIT (Just-In-Time) engine, supports arbitrary values:

```tsx
// Supports arbitrary values
<div className="bg-[#0b0c1a] text-gray-400 rounded-xl">
  <div className="border border-gray-700 px-6 py-10">
    <h1 className="text-xl font-bold text-white">Title</h1>
  </div>
</div>
```

#### Theme Colors

- **Background**: `bg-[#0b0c1a]` (Dark theme)
- **Card Background**: `bg-[#151728]`
- **Main Text**: `text-white`
- **Secondary Text**: `text-gray-400`
- **Links**: `text-blue-400 hover:underline`
- **Borders**: `border border-gray-700`

#### Button Styles

```tsx
// Primary button
<button className="bg-blue-600 text-white px-6 py-2 rounded-xl">
  Primary button
</button>

// Secondary button
<button className="border border-gray-600 text-white hover:bg-gray-700 px-6 py-2 rounded-xl">
  Secondary button
</button>
```

### Component Development Standards

#### Component Structure

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
      {/* Component content */}
    </div>
  );
};
```

#### Responsive Design

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
      {/* Content */}
    </div>
  );
};
```

### Web3 Integration

#### Wallet Connection

```tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <span>Connected: {address}</span>
        <button onClick={() => disconnect()}>Disconnect</button>
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
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
};
```

#### Contract Interaction

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
      <span>BOND Balance: {balance?.toString() || '0'}</span>
    </div>
  );
};
```

### Internationalization

#### Configuring Translations

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
      <button onClick={() => changeLanguage('zh')}>Chinese</button>
    </div>
  );
};
```

#### Translation File Structure

```
locales/
├── en/
│   └── translation.json
└── zh/
    └── translation.json
```

### State Management

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

## 🚀 Deployment Guide

### Build Production Version

```bash
# Build production version
npm run build

# Preview build results
npm run preview
```

### Docker Deployment

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

### Environment Variable Configuration

#### Production Environment

```env
# API configuration
VITE_API_URL=https://api.bondly.com

# Web3 configuration
VITE_WAGMI_PROJECT_ID=your_production_project_id

# IPFS configuration
VITE_PINATA_JWT=your_production_pinata_jwt
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 🌐 IPFS Integration

### Pinata Configuration

Project uses Pinata as the IPFS service provider, supporting content upload and storage.

#### Environment Variables

```env
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

#### Uploading Files

```tsx
import { uploadToIPFS } from '@utils/ipfs';

const uploadFile = async (file: File) => {
  try {
    const hash = await uploadToIPFS(file);
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    return url;
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw error;
  }
};
```

#### Uploading JSON Metadata

```tsx
const uploadMetadata = async (metadata: any) => {
  try {
    const jsonString = JSON.stringify(metadata);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    
    const hash = await uploadToIPFS(file);
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  } catch (error) {
    console.error('Metadata upload failed:', error);
    throw error;
  }
};
```

### NFT Metadata Standard

#### Content NFT Metadata

```json
{
  "name": "Article Title",
  "description": "Article description",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "attributes": [
    {
      "trait_type": "Author",
      "value": "0x..."
    },
    {
      "trait_type": "Creation Time",
      "value": "2024-12-01T00:00:00Z"
    },
    {
      "trait_type": "Content Type",
      "value": "article"
    }
  ],
  "external_url": "https://bondly.com/article/123",
  "animation_url": "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

#### Achievement NFT Metadata

```json
{
  "name": "Achievement Badge",
  "description": "Description of achievement earned by user",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "attributes": [
    {
      "trait_type": "Achievement Type",
      "value": "content_creator"
    },
    {
      "trait_type": "Earned Time",
      "value": "2024-12-01T00:00:00Z"
    },
    {
      "trait_type": "Rarity",
      "value": "rare"
    }
  ]
}
```

---

## 🐛 Debugging Guide

### Development Debugging

#### Frontend Debugging

- Hot reloading in development mode
- Error boundaries for React errors
- Console error logs
- Network request monitoring

#### Web3 Debugging

```tsx
// Enable Wagmi debugging
import { createConfig } from 'wagmi';

const config = createConfig({
  // ... other configurations
  logger: {
    warn: (message) => console.warn(message),
  },
});
```

#### Network Request Debugging

```tsx
// API request debugging
import { api } from '@utils/api';

const fetchData = async () => {
  try {
    const response = await api.get('/users/profile');
    console.log('API response:', response);
  } catch (error) {
    console.error('API error:', error);
  }
};
```

### Performance Optimization

#### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

#### Image Optimization

```tsx
// Use WebP format
<img 
  src="image.webp" 
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

#### Caching Strategy

```tsx
// Optimize components using React.memo
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

---

## 📱 Responsive Design

### Breakpoint Configuration

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small screens */
md: 768px   /* Medium screens */
lg: 1024px  /* Large screens */
xl: 1280px  /* Extra-large screens */
2xl: 1536px /* Double extra-large screens */
```

### Mobile Adaptation

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
      {/* Content */}
    </div>
  );
};
```

### Touch Optimization

```tsx
// Touch-friendly buttons
<button className="
  min-h-[44px] 
  min-w-[44px] 
  touch-manipulation
  active:scale-95
  transition-transform
">
  Button
</button>
```

---

**Documentation Version**: v1.0 | **Last Updated**: December 2024 