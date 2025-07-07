# Bondly 前端应用

基于 React + TypeScript + Vite 构建的现代化 Web3 应用前端。

## 🚀 特性

- **现代化技术栈**: React 18 + TypeScript + Vite
- **Web3 集成**: Wagmi + Viem + RainbowKit
- **国际化支持**: i18next 多语言支持
- **响应式设计**: 移动端和桌面端完美适配
- **代码质量**: ESLint + Prettier + TypeScript 严格模式
- **性能优化**: 代码分割、懒加载、构建优化

## 📦 安装依赖

```bash
npm install
```

## 🛠️ 开发命令

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

## 🏗️ 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── editor/         # 编辑器相关组件
│   └── publish/        # 发布相关组件
├── pages/              # 页面组件
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
├── styles/             # 样式文件
├── config/             # 配置文件
├── locales/            # 国际化文件
└── types/              # TypeScript 类型定义
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:8080
VITE_WAGMI_PROJECT_ID=your_walletconnect_project_id
```

### 路径别名

项目配置了路径别名，方便导入：

```typescript
import { Button } from '@components/common/Button';
import { useResponsive } from '@hooks/useResponsive';
import { createRipple } from '@utils/ripple';
```

## 🎨 样式系统

- 使用 CSS 变量管理主题色彩
- 响应式设计，支持移动端和桌面端
- 统一的动画效果和交互反馈
- 模块化样式组织

## 🔒 代码质量

- **ESLint**: 代码规范和错误检查
- **Prettier**: 代码格式化
- **TypeScript**: 严格类型检查
- **错误边界**: 全局错误处理

## 📱 响应式设计

- 移动端优先的设计理念
- 断点：768px (平板), 1024px (桌面)
- 使用 `useResponsive` Hook 检测设备类型

## 🌐 国际化

支持中英文切换：

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const message = t('key');
```

## 🚀 性能优化

- **代码分割**: 按路由和组件分割
- **懒加载**: 路由和组件懒加载
- **构建优化**: 压缩、Tree Shaking
- **缓存策略**: 静态资源缓存

## 🐛 调试

- 开发模式下的热重载
- 错误边界捕获 React 错误
- 控制台错误日志
- 网络请求监控

## 📦 部署

### 构建

```bash
npm run build
```

### Docker 部署

```bash
docker build -t bondly-fe .
docker run -p 80:80 bondly-fe
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## �� 许可证

MIT License
