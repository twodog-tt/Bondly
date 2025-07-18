# Bondly 智能合约系统指南

## 📋 目录

- [系统架构总览](#系统架构总览)
- [合约部署指南](#合约部署指南)
- [测试指南](#测试指南)
- [脚本工具](#脚本工具)
- [各模块详细文档](#各模块详细文档)

---

## 🏗️ 系统架构总览

Bondly 是一个完整的去中心化内容创作平台智能合约系统，支持内容资产化、社区治理、互动激励、声誉建设、成就徽章等核心功能。所有模块通过统一的注册表系统进行管理，支持灵活升级与去中心化治理。

### 核心模块

#### 🪙 代币系统 (Token)
- **BondlyTokenV2**: 平台原生代币，支持 ERC20、Permit、Votes、UUPS 升级、角色权限管理
- **BondlyToken**: 代币初始版本，提供基础代币功能

#### 🖼️ NFT 系统 (NFT)
- **ContentNFT**: 内容资产化 NFT，支持创作者追踪、独立元数据、IPFS 存储
- **AchievementNFT**: 成就徽章 SBT，不可转让，记录用户荣誉和贡献

#### 🏆 声誉系统 (Reputation)
- **ReputationVault**: 声誉分数管理，支持快照和治理权重计算
- **InteractionStaking**: 互动质押机制，用户互动需质押 BOND，奖励归创作者
- **RewardDistributor**: 基于声誉的奖励分配系统
- **GeneralStaking**: 通用质押合约，支持多种质押场景
- **ETHStaking**: ETH 质押合约，用户质押 ETH 获得 BOND 奖励
- **MixedTokenReputationStrategy**: 混合权重策略，结合代币和声誉计算投票权重

#### 🏛️ 治理系统 (Governance)
- **BondlyDAO**: 去中心化治理合约，支持提案创建、投票、执行
- **BondlyVoting**: 投票机制，支持多种权重计算方式

#### 💰 资金库系统 (Treasury)
- **BondlyTreasury**: 多币种资金管理，支持 ETH 和 BOND 代币，集成 DAO 治理

#### 📋 注册表系统 (Registry)
- **BondlyRegistry**: 统一合约地址管理，支持版本控制和升级

### 合约目录结构

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

---

## 🚀 合约部署指南

### 环境准备

#### 1. 安装依赖
```bash
npm install
```

#### 2. 配置环境变量
复制环境变量模板：
```bash
cp env.example .env
```

配置必要的环境变量：
```env
# 网络配置
NETWORK=sepolia
PRIVATE_KEY=your-private-key

# 部署配置
BOND_TOKEN_ADDRESS=0x...
REGISTRY_ADDRESS=0x...
```

### 部署流程

#### 1. 完整部署
```bash
# 部署所有合约
npx hardhat run scripts/deploy/deploy.ts --network sepolia
```

#### 2. 分步部署
```bash
# 部署代币合约
npx hardhat run scripts/deploy/token.ts --network sepolia

# 部署注册表
npx hardhat run scripts/deploy/registry.ts --network sepolia

# 部署治理系统
npx hardhat run scripts/deploy/governance.ts --network sepolia
```

#### 3. 质押系统部署
```bash
# 部署ETH质押合约
npx hardhat run scripts/deploy-staking-only.ts --network sepolia

# 部署互动质押合约
npx hardhat run scripts/deploy-interaction-staking.ts --network sepolia
```

### 部署验证

#### 1. 检查部署状态
```bash
# 检查已部署的合约
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

#### 2. 验证合约
```bash
# 验证合约代码
npx hardhat run scripts/utils/verify.ts --network sepolia
```

### 部署后配置

#### 1. 设置权限
```bash
# 检查管理员权限
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

#### 2. 初始化质押奖励
```bash
# 设置质押奖励
npx hardhat run scripts/setup-staking-with-rewards.ts --network sepolia
```

---

## 🧪 测试指南

### 测试覆盖率

#### 总体覆盖率
- **总体覆盖率**: 46.53%
- **语句覆盖率**: 46.53%
- **分支覆盖率**: 41.4%
- **函数覆盖率**: 69.65%
- **行覆盖率**: 50.18%

#### 各模块覆盖率
- **NFT模块**: 96.15% (优秀)
- **代币模块**: 98.48% (优秀)
- **注册表模块**: 93.1% (优秀)
- **声誉模块**: 66.13% (中等)
- **治理模块**: 14.24% (需要集成测试)
- **资金库模块**: 43.37% (中等)

### 运行测试

#### 1. 运行所有测试
```bash
npm test
```

#### 2. 运行特定模块测试
```bash
# 测试代币合约
npx hardhat test test/token/BondlyTokenUpgradeable.basic.test.ts

# 测试NFT合约
npx hardhat test test/nft/ContentNFT.test.ts

# 测试声誉合约
npx hardhat test test/reputation/ReputationVault.test.ts
```

#### 3. 运行覆盖率测试
```bash
npm run coverage
```

### 测试文件结构

```
test/
├── governace/           # 治理系统测试
│   ├── BondlyDAO.test.ts
│   └── BondlyVoting.test.ts
├── nft/                # NFT系统测试
│   ├── AchievementNFT.comprehensive.test.ts
│   └── ContentNFT.test.ts
├── registry/           # 注册表测试
│   └── BondlyRegistry.test.ts
├── reputation/         # 声誉系统测试
│   ├── InteractionStaking.test.ts
│   ├── MixedTokenReputationStrategy.test.ts
│   ├── ReputationVault.test.ts
│   └── RewardDistributor.test.ts
├── token/              # 代币测试
│   └── BondlyTokenUpgradeable.basic.test.ts
└── treasury/           # 资金库测试
    └── BondlyTreasury.test.ts
```

---

## 🛠️ 脚本工具

### 部署脚本

#### 主要部署脚本
- `scripts/deploy/deploy.ts` - 完整部署脚本
- `scripts/deploy/token.ts` - 代币部署脚本
- `scripts/deploy/governance.ts` - 治理系统部署脚本
- `scripts/deploy-staking-only.ts` - ETH质押部署脚本
- `scripts/deploy-interaction-staking.ts` - 互动质押部署脚本

#### 工具脚本
- `scripts/check-deployed-contracts.ts` - 检查部署状态
- `scripts/check-admin-permissions.ts` - 检查管理员权限
- `scripts/check-balance.ts` - 检查余额
- `scripts/check-staking-rewards.ts` - 检查质押奖励

### 管理脚本

#### 质押管理
- `scripts/setup-staking-with-rewards.ts` - 设置质押奖励
- `scripts/activate-staking-rewards.ts` - 激活质押奖励
- `scripts/adjust-apy.ts` - 调整APY
- `scripts/reset-rewards.ts` - 重置奖励

#### 代币管理
- `scripts/mint-to-relay.ts` - 向中转钱包铸币
- `scripts/mint-v2.ts` - V2代币铸币
- `scripts/transfer-v2.ts` - V2代币转账

#### 调试脚本
- `scripts/debug-registry.ts` - 调试注册表
- `scripts/debug-staking-rewards.ts` - 调试质押奖励
- `scripts/fix-registry.ts` - 修复注册表

### 脚本使用示例

#### 检查部署状态
```bash
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

#### 检查管理员权限
```bash
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

#### 设置质押奖励
```bash
npx hardhat run scripts/setup-staking-with-rewards.ts --network sepolia
```

---

## 📚 各模块详细文档

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

---

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

---

**文档版本**: v1.0 | **最后更新**: 2024年12月 