# Bondly 智能合约系统

Bondly 是一个完整的去中心化内容创作平台智能合约系统，支持内容资产化、社区治理、互动激励、声誉建设、成就徽章等核心功能。所有模块通过统一的注册表系统进行管理，支持灵活升级与去中心化治理。

## 🏗️ 系统架构总览

Bondly 合约系统采用模块化设计，包含以下核心模块：

### 🪙 代币系统 (Token)
- **BondlyTokenV2**: 平台原生代币，支持 ERC20、Permit、Votes、UUPS 升级、角色权限管理
- **BondlyToken**: 代币初始版本，提供基础代币功能

### 🖼️ NFT 系统 (NFT)
- **ContentNFT**: 内容资产化 NFT，支持创作者追踪、独立元数据、IPFS 存储
- **AchievementNFT**: 成就徽章 SBT，不可转让，记录用户荣誉和贡献

### 🏆 声誉系统 (Reputation)
- **ReputationVault**: 声誉分数管理，支持快照和治理权重计算
- **InteractionStaking**: 互动质押机制，用户互动需质押 BOND，奖励归创作者
- **RewardDistributor**: 基于声誉的奖励分配系统
- **GeneralStaking**: 通用质押合约，支持多种质押场景
- **ETHStaking**: ETH 质押合约，用户质押 ETH 获得 BOND 奖励
- **MixedTokenReputationStrategy**: 混合权重策略，结合代币和声誉计算投票权重

### 🏛️ 治理系统 (Governance)
- **BondlyDAO**: 去中心化治理合约，支持提案创建、投票、执行
- **BondlyVoting**: 投票机制，支持多种权重计算方式

### 💰 资金库系统 (Treasury)
- **BondlyTreasury**: 多币种资金管理，支持 ETH 和 BOND 代币，集成 DAO 治理

### 📋 注册表系统 (Registry)
- **BondlyRegistry**: 统一合约地址管理，支持版本控制和升级

## 📁 合约目录结构

```
contracts/
├── token/                    # 代币系统
│   ├── BondlyToken.sol      # 主代币合约 (ERC20 + UUPS)
│   └── BondlyTokenV2.sol    # 代币升级版本 (支持多重铸币权限)
├── nft/                     # NFT 系统
│   ├── ContentNFT.sol       # 内容 NFT (创作者追踪 + IPFS)
│   └── AchievementNFT.sol   # 成就 SBT (不可转让)
├── reputation/              # 声誉系统
│   ├── ReputationVault.sol  # 声誉分数管理
│   ├── RewardDistributor.sol # 奖励分配器
│   ├── InteractionStaking.sol # 互动质押 (点赞/评论/收藏)
│   ├── GeneralStaking.sol   # 通用质押合约
│   ├── ETHStaking.sol       # ETH 质押合约
│   ├── MixedTokenReputationStrategy.sol # 混合权重策略
│   └── IReputationVault.sol # 声誉库接口
├── governance/              # 治理系统
│   ├── BondlyDAO.sol        # DAO 治理合约 (提案管理)
│   ├── BondlyVoting.sol     # 投票机制 (多种权重)
│   ├── IBondlyDAO.sol       # DAO 接口
│   └── IBondlyVoting.sol    # 投票接口
├── treasury/                # 资金管理
│   ├── BondlyTreasury.sol   # 资金库合约 (多币种管理)
│   └── IBondlyTreasury.sol  # 资金库接口
└── registry/                # 注册表系统
    ├── BondlyRegistry.sol   # 注册表合约 (统一寻址)
    └── IBondlyRegistry.sol  # 注册表接口
```

## 🎯 核心功能详解

### 🪙 代币系统 (BondlyTokenV2)

**主要特性：**
- ✅ **ERC20 标准代币** - 完全兼容 ERC20 标准
- ✅ **可升级合约** - 使用 UUPS 代理模式，支持合约升级
- ✅ **多重铸币权限** - 支持 MINTER_ROLE 和 DAO 地址铸币
- ✅ **批量铸币** - 一次性为多个地址铸造代币
- ✅ **代币销毁** - 支持强制销毁和用户自助销毁
- ✅ **投票权重** - 集成 ERC20Votes，用于治理投票
- ✅ **暂停机制** - 紧急情况下可暂停合约操作
- ✅ **权限管理** - 基于 AccessControl 的角色权限系统

**关键功能：**
```solidity
// 铸币功能 - 支持 MINTER_ROLE 或 DAO
function mint(address to, uint256 amount, string memory reason)

// 批量铸币
function batchMint(address[] memory recipients, uint256[] memory amounts, string memory reason)

// 代币销毁
function burn(address from, uint256 amount, string memory reason)
function selfBurn(uint256 amount, string memory reason)
```

### 🖼️ NFT 系统

**ContentNFT - 内容资产化：**
- ✅ **内容 NFT 化** - 将用户创作内容铸造为 NFT
- ✅ **元数据管理** - 标题、摘要、封面图、IPFS 链接
- ✅ **创作者追踪** - 自动记录内容创作者地址
- ✅ **IPFS 集成** - 支持去中心化内容存储
- ✅ **权限控制** - 仅授权地址可铸造 NFT

**AchievementNFT - 成就徽章：**
- ✅ **不可转让 SBT** - 灵魂绑定代币，记录用户成就
- ✅ **多类型成就** - 支持不同类型的成就徽章
- ✅ **历史追踪** - 记录用户获得成就的时间线

### 🏆 声誉系统

**InteractionStaking - 互动质押：**
- ✅ **互动质押** - 点赞、评论、收藏需质押 BOND 代币
- ✅ **奖励分配** - 质押金额作为奖励分配给内容创作者
- ✅ **质押撤回** - 用户可撤回未结算的质押
- ✅ **防重复互动** - 每个用户对每个内容只能互动一次
- ✅ **灵活配置** - 不同互动类型的质押金额可配置

**ReputationVault - 声誉管理：**
- ✅ **声誉分数** - 基于用户行为计算声誉分数
- ✅ **快照机制** - 支持声誉快照，用于治理投票
- ✅ **治理权重** - 声誉分数影响治理投票权重

**RewardDistributor - 奖励分配：**
- ✅ **声誉奖励** - 基于声誉分数分配 BOND 奖励
- ✅ **防重复领取** - 防止用户重复领取奖励
- ✅ **多代币支持** - 支持多种代币的奖励分配

**ETHStaking - ETH 质押：**
- ✅ **ETH 质押** - 用户可质押 ETH 获得 BOND 奖励
- ✅ **实时 APY** - 动态计算和显示年化收益率
- ✅ **组合操作** - 支持质押并领取、解除质押并领取
- ✅ **无锁定期** - 用户可以随时解除质押
- ✅ **奖励管理** - 管理员可添加奖励流动性
- ✅ **安全机制** - 重入保护、暂停机制、紧急提取

### 🏛️ 治理系统

**BondlyDAO - 去中心化治理：**
- ✅ **提案管理** - 创建、激活、执行治理提案
- ✅ **双通道提案** - 支持押金提案和声誉提案
- ✅ **投票机制** - 支持赞成/反对投票
- ✅ **权限控制** - 仅授权执行者可执行提案
- ✅ **函数白名单** - 限制可调用的合约函数

**BondlyVoting - 投票机制：**
- ✅ **多种权重** - 支持代币权重、声誉权重、混合权重
- ✅ **投票记录** - 防止重复投票
- ✅ **快照投票** - 基于快照的投票权重计算

### 💰 资金库系统

**BondlyTreasury - 多币种资金管理：**
- ✅ **多币种支持** - 同时管理 ETH 和 BOND 代币
- ✅ **DAO 集成** - 与治理系统深度集成
- ✅ **提案执行** - 执行 DAO 批准的提案
- ✅ **权限分级** - viewer、operator 不同权限级别
- ✅ **紧急提取** - 紧急情况下可提取资金
- ✅ **参数管理** - 动态调整提案金额限制

### 📋 注册表系统

**BondlyRegistry - 统一地址管理：**
- ✅ **合约寻址** - 统一管理所有合约地址
- ✅ **版本控制** - 支持合约版本管理
- ✅ **地址查询** - 通过名称查询合约地址
- ✅ **升级支持** - 支持合约升级和地址更新

## 🛡️ 安全特性

### 权限管理
- **角色权限** - 基于 OpenZeppelin AccessControl
- **权限分级** - 不同角色拥有不同权限
- **权限验证** - 严格的权限检查机制

### 安全机制
- **暂停机制** - 紧急情况下可暂停合约
- **重入保护** - 防止重入攻击
- **输入验证** - 严格的参数验证
- **事件记录** - 完整的操作日志

### 可升级性
- **UUPS 代理** - 支持合约升级
- **版本管理** - 支持合约版本迭代
- **升级控制** - 只有授权地址可升级

## 🧪 测试覆盖与质量

### 📊 测试覆盖率
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

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装与编译
```bash
# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 运行测试
npm test

# 运行覆盖率测试
npx hardhat coverage
```

### 部署命令
```bash
# 启动本地节点
npx hardhat node

# 部署到本地网络
npx hardhat run scripts/deploy/deploy.ts --network localhost

# 部署到测试网
npx hardhat run scripts/deploy/deploy.ts --network sepolia

# 部署 V2 代币合约
npx hardhat run scripts/deploy-v2.ts --network sepolia

# 验证合约
npx hardhat verify --network sepolia CONTRACT_ADDRESS
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
```

## 📚 文档索引

- [docs/GovernanceSystem.md](docs/GovernanceSystem.md) - 治理系统设计与接口
- [docs/ContentNFT.md](docs/ContentNFT.md) - 内容 NFT 合约说明
- [docs/AchievementNFT.md](docs/AchievementNFT.md) - 成就 SBT 合约说明
- [docs/RewardDistributor.md](docs/RewardDistributor.md) - 声誉奖励分配
- [docs/BondlyToken.md](docs/BondlyToken.md) - 平台代币说明
- [docs/InteractionStaking.md](docs/InteractionStaking.md) - 互动质押机制
- [docs/ETHStaking.md](docs/ETHStaking.md) - ETH 质押合约说明
- [docs/BondlyRegistry.md](docs/BondlyRegistry.md) - 合约注册表说明
- [docs/TESTING.md](docs/TESTING.md) - 测试策略与覆盖率分析
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - 部署指南与最佳实践
- [ETH_STAKING_DEPLOYMENT.md](ETH_STAKING_DEPLOYMENT.md) - ETH 质押快速部署指南

## 🎯 业务场景支持

1. **内容创作激励** - 用户创作内容获得 NFT 和奖励
2. **社区治理** - 代币持有者参与平台决策
3. **互动经济** - 用户互动获得奖励，创作者获得收益
4. **声誉建设** - 用户通过贡献建立声誉
5. **ETH 质押激励** - 用户质押 ETH 获得 BOND 奖励，增加平台流动性
6. **资金管理** - 平台资金透明管理和分配

## 🔗 技术栈

- **Solidity**: 0.8.19
- **Hardhat**: 最新版本
- **OpenZeppelin**: 5.3.0
- **TypeScript**: 测试脚本
- **Ethers.js**: 合约交互

更多接口与用法详见 docs/ 目录与各合约注释。 