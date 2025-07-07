# Bondly 首页组件重构

## 概述

将 `Home.tsx` 页面拆分为多个可复用的组件，提高代码的可维护性和可重用性。

## 组件结构

```
components/
  ├── Navbar.tsx           # 导航栏组件
  ├── HeroSection.tsx      # 英雄区域组件
  ├── FeaturedArticles.tsx # 特色文章组件
  ├── StakeSection.tsx     # 质押区域组件
  ├── GovernanceSection.tsx # 治理区域组件
  └── Footer.tsx           # 页脚组件
```

## 组件详情

### 1. Navbar.tsx
- **功能**: 顶部导航栏，包含logo、导航链接和登录/连接钱包按钮
- **Props**: 
  - `isMobile: boolean` - 是否为移动端
  - `onLoginClick: () => void` - 登录按钮点击回调
  - `onPageChange?: (newPage: string) => void` - 页面切换回调

### 2. HeroSection.tsx
- **功能**: 首页英雄区域，包含主标题、副标题和行动按钮
- **Props**:
  - `isMobile: boolean` - 是否为移动端
  - `onPageChange?: (newPage: string) => void` - 页面切换回调

### 3. FeaturedArticles.tsx
- **功能**: 特色文章展示区域，包含文章卡片和操作按钮
- **Props**:
  - `isMobile: boolean` - 是否为移动端
- **特性**: 使用模拟数据渲染文章列表

### 4. StakeSection.tsx
- **功能**: 质押和代币信息展示区域
- **Props**:
  - `isMobile: boolean` - 是否为移动端

### 5. GovernanceSection.tsx
- **功能**: 社区治理提案展示区域
- **Props**:
  - `isMobile: boolean` - 是否为移动端

### 6. Footer.tsx
- **功能**: 页脚信息展示
- **Props**:
  - `isMobile: boolean` - 是否为移动端

## 重构特点

### 1. 函数式组件
- 所有组件都使用 `React.FC` 类型
- 采用函数式组件写法，符合现代React最佳实践

### 2. 保留原有样式
- 完全保留原有的 Tailwind CSS 样式
- 保持视觉一致性和用户体验

### 3. 组件复用性
- 每个组件都是独立的，可以在其他页面中复用
- 通过 Props 传递配置和回调函数

### 4. 响应式设计
- 所有组件都支持移动端适配
- 通过 `isMobile` 属性控制布局

### 5. 类型安全
- 使用 TypeScript 接口定义 Props
- 提供完整的类型检查和智能提示

## 使用方式

在 `Home.tsx` 中的使用示例：

```tsx
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedArticles from '../components/FeaturedArticles';
import StakeSection from '../components/StakeSection';
import GovernanceSection from '../components/GovernanceSection';
import Footer from '../components/Footer';

// 在组件中渲染
<Navbar 
  isMobile={isMobile} 
  onLoginClick={handleLoginClick}
  onPageChange={onPageChange}
/>

<HeroSection 
  isMobile={isMobile}
  onPageChange={onPageChange}
/>

<FeaturedArticles isMobile={isMobile} />
<StakeSection isMobile={isMobile} />
<GovernanceSection isMobile={isMobile} />
<Footer isMobile={isMobile} />
```

## 优势

1. **代码组织**: 将大型组件拆分为更小、更专注的组件
2. **可维护性**: 每个组件职责单一，易于维护和测试
3. **可重用性**: 组件可以在其他页面中复用
4. **团队协作**: 不同开发者可以并行开发不同组件
5. **性能优化**: 可以针对特定组件进行优化

## 后续改进

1. 可以考虑将模拟数据提取到独立的配置文件
2. 添加组件单元测试
3. 实现组件懒加载
4. 添加组件文档和Storybook 