# Bondly 前端应用

基于 React + TypeScript + Vite 构建的现代化 Web3 应用前端。

## 🆕 最新更新 (2024年12月)

### Interaction Staking Hook 重构 ✅
- **数据读取与操作分离**: 创建 `useInteractionStakingData` 用于合约读取，优化 `useInteractionStaking` 用于操作
- **真实合约数据**: 使用 `useReadContract` 替换mock数据，实现真实合约调用
- **事件驱动更新**: 添加 `useWatchContractEvent` 实时合约事件监听
- **性能优化**: 实现memoization和条件查询
- **增强错误处理**: 改进错误消息和状态管理

**变更文件:**
- `src/hooks/useInteractionStakingData.ts` (新增)
- `src/hooks/useInteractionStaking.ts` (重构)
- `src/components/InteractionStakingSection.tsx` (更新)

**详细文档:** 参见 `INTERACTION_STAKING_REFACTOR.md`

## 🚀 特性

- **现代化技术栈**: React 18 + TypeScript + Vite
- **Web3 集成**: Wagmi + Viem + RainbowKit
- **国际化支持**: i18next 多语言支持
- **响应式设计**: 移动端和桌面端完美适配
- **代码质量**: ESLint + Prettier + TypeScript 严格模式
- **性能优化**: 代码分割、懒加载、构建优化
- **质押管理**: 完整的质押流动性管理界面，支持管理员添加奖励

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

支持中英文切换，所有用户界面元素都已本地化：

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const message = t('key');
```

### 界面语言

- **质押流动性管理**: 完全英文化界面，包括权限检查、状态显示、操作表单等
- **错误和成功消息**: 所有提示信息都已本地化
- **管理员功能**: 管理员权限验证和管理操作界面

## 🚀 性能优化

- **代码分割**: 按路由和组件分割
- **懒加载**: 路由和组件懒加载
- **构建优化**: 压缩、Tree Shaking
- **缓存策略**: 静态资源缓存

## 🐛 调试

### 前端调试

- 开发模式下的热重载
- 错误边界捕获 React 错误
- 控制台错误日志
- 网络请求监控

### 质押流动性管理

项目提供了完整的质押流动性管理功能，支持管理员通过前端界面添加奖励：

#### 🔐 管理员权限验证

- **权限检查**: 自动验证当前钱包地址是否具有 `REWARD_MANAGER_ROLE` 权限
- **权限状态显示**: 实时显示权限验证状态和当前地址
- **权限不足提示**: 友好的权限不足提示界面

#### 💰 质押状态监控

- **当前APY**: 实时显示质押年化收益率
- **奖励池余额**: 显示当前奖励池中的 BOND 代币余额
- **总质押量**: 显示平台总质押量
- **奖励结束时间**: 显示当前奖励发放的结束时间

#### 🚀 流动性管理操作

- **奖励金额设置**: 输入要添加的 BOND 代币数量
- **持续时间设置**: 设置奖励发放的持续时间（天数）
- **余额检查**: 自动检查管理员账户的可用余额
- **一键添加**: 自动处理授权和添加奖励的完整流程

#### 🎨 用户界面特性

- **响应式设计**: 完美适配移动端和桌面端
- **实时状态更新**: 操作后自动刷新状态信息
- **错误处理**: 完善的错误提示和异常处理
- **操作反馈**: 清晰的操作状态和结果反馈

### 合约调试脚本

项目提供了多个有用的调试脚本，位于 `bondly-contracts/scripts/` 目录下：

#### 🔐 权限检查脚本

```bash
# 检查当前钱包的管理员权限
cd bondly-contracts
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

**作用**: 检查当前连接的钱包地址是否具有质押合约的管理员权限，包括：
- `DEFAULT_ADMIN_ROLE`: 完全管理员权限
- `REWARD_MANAGER_ROLE`: 奖励管理权限
- `PAUSER_ROLE`: 暂停合约权限

#### 💰 余额检查脚本

```bash
# 检查 BOND 代币余额
npx hardhat run scripts/check-balance.ts --network sepolia
```

**作用**: 检查指定账户的 BOND 代币余额和 ETH 余额，提供：
- 代币合约信息
- 账户余额详情
- 添加代币到钱包的指导
- Etherscan 链接

#### 🚀 添加质押流动性脚本

```bash
# 为质押合约添加奖励流动性
npx hardhat run scripts/add-staking-liquidity.ts --network sepolia
```

**作用**: 为质押合约添加 BOND 代币作为奖励，包括：
- 自动授权代币使用
- 设置奖励金额和持续时间
- 计算和显示 APY
- 验证操作结果

#### 📋 合约部署检查脚本

```bash
# 检查已部署的合约状态
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

**作用**: 检查所有已部署合约的状态和配置，包括：
- 合约地址列表
- 合约基本信息
- 权限配置
- 网络连接状态

#### 🏗️ 部署脚本

```bash
# 部署质押合约
npx hardhat run scripts/deploy-staking-only.ts --network sepolia

# 部署完整系统
npx hardhat run scripts/deploy-v2.ts --network sepolia

# 简单部署
npx hardhat run scripts/deploy-simple.ts --network sepolia
```

**作用**: 不同场景下的合约部署脚本

#### 🎯 代币操作脚本

```bash
# 铸造 BOND 代币
npx hardhat run scripts/mint-v2.ts --network sepolia

# 转移代币
npx hardhat run scripts/transfer-v2.ts --network sepolia

# 铸造代币到中继地址
npx hardhat run scripts/mint-to-relay.ts --network sepolia
```

**作用**: 代币相关的操作脚本

#### 🛠️ 工具脚本

```bash
# 检查环境配置
node scripts/utils/check-env.js

# 生成文档
node scripts/generate-docs.js

# 生成报告
node scripts/utils/generate-report.js
```

**作用**: 
- `check-env.js`: 检查环境变量配置、Node.js 版本、依赖安装等
- `generate-docs.js`: 自动生成合约文档
- `generate-report.js`: 生成部署和测试报告
- `verify.ts`: 合约验证工具函数

#### 🏛️ 治理部署脚本

```bash
# 部署治理合约
npx hardhat run scripts/deploy/governance.ts --network sepolia

# 完整部署
npx hardhat run scripts/deploy/deploy.ts --network sepolia
```

**作用**: 治理系统相关的部署脚本

### 调试脚本使用指南

1. **环境准备**:
   ```bash
   cd bondly-contracts
   npm install
   cp env.example .env
   # 编辑 .env 文件，填入正确的私钥和网络配置
   ```

2. **网络配置**:
   - 确保 `hardhat.config.ts` 中配置了正确的网络
   - 确保账户有足够的 ETH 支付 gas 费用

3. **权限检查**:
   - 运行权限检查脚本确认当前账户的权限
   - 只有具有相应权限的账户才能执行管理操作

4. **操作顺序**:
   - 先检查合约状态和权限
   - 确认余额充足
   - 执行具体操作
   - 验证操作结果

### 常见问题排查

1. **权限不足**:
   ```bash
   npx hardhat run scripts/check-admin-permissions.ts --network sepolia
   ```

2. **余额不足**:
   ```bash
   npx hardhat run scripts/check-balance.ts --network sepolia
   ```

3. **合约状态异常**:
   ```bash
   npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
   ```

4. **质押奖励问题**:
   ```bash
   npx hardhat run scripts/add-staking-liquidity.ts --network sepolia
   ```

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
