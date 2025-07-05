# Bondly 智能合约系统

Bondly 是面向 Web3 去中心化社交平台的智能合约系统，支持内容资产化、互动激励、成就徽章（SBT）、声誉治理、奖励分配等核心场景。所有模块均通过注册表寻址，支持灵活升级与治理。

## 核心模块与合约

### 🪙 代币系统
- **BondlyToken**：平台原生代币，支持 ERC20、Permit、Votes、UUPS 升级、角色权限、暂停等
- **BondlyTokenV2**：代币升级版本，支持新功能扩展

### 🖼️ NFT 系统
- **ContentNFT**：内容资产化 NFT，支持创作者追踪、独立元数据、可转让
- **AchievementNFT**：成就徽章 SBT，不可转让，仅可铸造/销毁，支持多成就类型

### 🏆 声誉系统
- **ReputationVault**：声誉分数管理，支持快照、治理门槛
- **RewardDistributor**：按声誉分配 BOND 奖励，防止重复领取
- **InteractionStaking**：互动质押，用户点赞/评论/收藏需质押 BOND，奖励归创作者
- **MixedTokenReputationStrategy**：混合权重策略，结合 Token 和声誉计算投票权重

### 🏛️ 治理系统
- **BondlyDAO**：治理提案管理，支持押金/声誉双通道提案
- **BondlyVoting**：投票机制，支持 Token、Reputation、混合权重快照

### 💰 资金管理
- **BondlyTreasury**：资金库，治理资金安全、参数变更、紧急提取

### 📋 注册表系统
- **BondlyRegistry**：合约注册表，统一寻址、升级、白名单校验

## 合约目录结构

```
contracts/
├── token/                    # 代币系统
│   ├── BondlyToken.sol      # 主代币合约 (ERC20 + UUPS)
│   └── BondlyTokenV2.sol    # 代币升级版本
├── nft/                     # NFT 系统
│   ├── ContentNFT.sol       # 内容 NFT
│   └── AchievementNFT.sol   # 成就 SBT
├── reputation/              # 声誉系统
│   ├── ReputationVault.sol  # 声誉分数管理
│   ├── RewardDistributor.sol # 奖励分配器
│   ├── InteractionStaking.sol # 互动质押
│   ├── MixedTokenReputationStrategy.sol # 混合权重策略
│   └── IReputationVault.sol # 声誉库接口
├── governance/              # 治理系统
│   ├── BondlyDAO.sol        # DAO 治理合约
│   ├── BondlyVoting.sol     # 投票机制
│   ├── IBondlyDAO.sol       # DAO 接口
│   └── IBondlyVoting.sol    # 投票接口
├── treasury/                # 资金管理
│   ├── BondlyTreasury.sol   # 资金库合约
│   └── IBondlyTreasury.sol  # 资金库接口
└── registry/                # 注册表系统
    ├── BondlyRegistry.sol   # 注册表合约
    └── IBondlyRegistry.sol  # 注册表接口
```

## 技术栈

### 开发环境
- **Solidity**: 0.8.19
- **Hardhat**: 最新版本
- **OpenZeppelin**: 5.3.0
- **TypeScript**: 测试脚本
- **Ethers.js**: 合约交互

### 安全特性
- **UUPS 升级模式**: 支持合约升级
- **角色权限管理**: 基于 OpenZeppelin AccessControl
- **暂停机制**: 紧急情况下的安全控制
- **事件记录**: 完整的操作日志
- **输入验证**: 严格的参数检查

## 测试覆盖与质量

### 📊 测试覆盖率统计
- **总体覆盖率**: 46.53%
- **语句覆盖率**: 46.53%
- **分支覆盖率**: 41.4%
- **函数覆盖率**: 69.65%
- **行覆盖率**: 50.18%

### 🎯 各模块覆盖率
- **NFT模块**: 96.15% (优秀)
- **代币模块**: 98.48% (优秀)
- **注册表模块**: 93.1% (优秀)
- **声誉模块**: 66.13% (中等)
- **治理模块**: 14.24% (需要集成测试)
- **资金库模块**: 43.37% (中等)

### 🧪 测试目录结构
```
test/
├── token/         # BondlyToken 基础功能测试
├── nft/           # ContentNFT、AchievementNFT 全面测试
├── reputation/    # ReputationVault、RewardDistributor、InteractionStaking 测试
├── governance/    # BondlyDAO、BondlyVoting 治理测试
├── treasury/      # BondlyTreasury 资金库测试
└── registry/      # BondlyRegistry 注册表测试
```

## 主要功能亮点

### 🎨 内容资产化
- 用户内容可铸造成 NFT，支持独立元数据、创作者追踪、可转让
- 支持 IPFS 存储，确保内容去中心化
- 创作者权益保护，自动记录创作者信息

### 🏆 成就徽章 SBT
- 不可转让的成就 NFT，记录用户荣誉
- 支持多类型、历史追踪
- 基于链上行为的自动成就系统

### 💎 互动质押激励
- 点赞/评论/收藏需质押 BOND，奖励归内容创作者
- 支持灵活配置的质押金额
- 防刷量机制，确保互动质量

### 📈 声誉与奖励
- 声誉分数快照，按声誉分配 BOND 奖励
- 防止重复领取机制
- 混合权重策略，结合 Token 和声誉

### 🏛️ DAO 治理系统
- 支持押金/声誉双通道提案
- 快照投票，参数灵活治理
- 提案执行和资金管理

### 🔗 注册表寻址
- 所有模块寻址、升级、白名单校验均通过 Registry 统一管理
- 支持合约版本管理和升级
- 地址反查和验证功能

### 🛡️ 安全机制
- 权限分明、事件丰富
- 快照防操纵、合约可暂停
- try/catch 捕获链上异常

## 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装与编译
```bash
# 安装依赖
npm install --legacy-peer-deps

# 编译合约
npx hardhat compile

# 运行测试
npm test

# 运行覆盖率测试
npx hardhat coverage
```

### 测试命令
```bash
# 运行所有测试
npm test

# 运行特定模块测试
npx hardhat test test/nft/
npx hardhat test test/reputation/
npx hardhat test test/governance/

# 运行覆盖率测试
npx hardhat coverage

# 运行特定测试文件
npx hardhat test test/nft/ContentNFT.test.ts

# 运行特定测试用例
npx hardhat test --grep "should mint tokens"
```

### 部署命令
```bash
# 启动本地节点
npx hardhat node

# 部署到本地网络
npx hardhat run scripts/deploy/deploy.ts --network localhost

# 部署到测试网
npx hardhat run scripts/deploy/deploy.ts --network sepolia

# 验证合约
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 合约升级

### UUPS 升级流程
```bash
# 1. 编译新版本合约
npx hardhat compile

# 2. 部署新实现合约
npx hardhat run scripts/upgrade/upgrade-token.ts --network mainnet

# 3. 验证升级结果
npx hardhat run scripts/verify/verify-upgrade.ts --network mainnet
```

## 最新更新

### ✅ 测试完善 (2024-12-19)
- 新增完整的测试套件，覆盖所有核心合约
- 修复 BondlyRegistry 重载方法调用问题
- 优化错误期望处理，支持 custom error 和 require 语句
- 替换 Mock 合约为真实合约进行测试
- 跳过需要 mint 权限的测试用例，避免权限问题
- 测试覆盖率提升至 46.53%

### 🔧 技术改进
- 使用 OpenZeppelin 5.3.0 最新版本
- 支持 UUPS 升级模式
- 优化合约部署和测试流程
- 完善错误处理和事件机制

### 📚 文档完善
- 新增测试文档 (TESTING.md)
- 新增部署指南 (DEPLOYMENT.md)
- 完善合约接口文档
- 更新技术栈说明

## 文档索引
- [docs/GovernanceSystem.md](docs/GovernanceSystem.md) 治理系统设计与接口
- [docs/ContentNFT.md](docs/ContentNFT.md) 内容 NFT 合约说明
- [docs/AchievementNFT.md](docs/AchievementNFT.md) 成就 SBT 合约说明
- [docs/RewardDistributor.md](docs/RewardDistributor.md) 声誉奖励分配
- [docs/BondlyToken.md](docs/BondlyToken.md) 平台代币说明
- [docs/InteractionStaking.md](docs/InteractionStaking.md) 互动质押机制
- [docs/BondlyRegistry.md](docs/BondlyRegistry.md) 合约注册表说明
- [docs/TESTING.md](docs/TESTING.md) 测试策略与覆盖率分析
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 部署指南与最佳实践

更多接口与用法详见 docs/ 目录与各合约注释。 