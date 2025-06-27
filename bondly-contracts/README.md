# Bondly Contracts (bondly-contracts)

> **去中心化社交价值网络的智能合约**

## 📋 项目概述

Bondly Contracts 是基于 Solidity 开发的智能合约集合，为 Bondly 社交平台提供去中心化的核心功能。包括用户管理、内容发布、社交互动、质押奖励、NFT 铸造等合约模块。

## 🚀 核心合约

### 用户管理合约
- **BondlyIdentity**: 用户身份管理，SBT 声誉系统
- **BondlyProfile**: 用户档案存储，链上数据管理
- **BondlyReputation**: 声誉值计算和更新机制

### 内容管理合约
- **BondlyContent**: 内容发布和存储，IPFS 哈希管理
- **BondlyTags**: 标签系统和分类管理
- **BondlyModeration**: 内容审核和举报处理

### 社交互动合约
- **BondlyInteraction**: 点赞、评论、分享功能
- **BondlyStaking**: 基于质押的互动机制
- **BondlyRewards**: 奖励分配和计算

### NFT 和代币合约
- **BondlyToken**: 平台代币 (BOND) 合约
- **BondlyNFT**: 内容 NFT 铸造和管理
- **BondlySBT**: 灵魂绑定代币，声誉标识

### 治理合约
- **BondlyDAO**: 去中心化自治组织
- **BondlyVoting**: 投票和提案系统
- **BondlyTreasury**: 资金管理和分配

## 🛠 技术栈

### 开发环境
- **Solidity**: 智能合约开发语言
- **Hardhat**: 开发框架和测试环境
- **OpenZeppelin**: 安全合约库
- **TypeScript**: 测试和部署脚本

### 测试和验证
- **Chai**: 测试断言库
- **Mocha**: 测试框架
- **Etherscan**: 合约验证
- **Slither**: 安全分析

### 部署和监控
- **Hardhat Deploy**: 部署管理
- **OpenZeppelin Defender**: 合约监控
- **Tenderly**: 交易分析

## 📁 项目结构

```
contracts/
├── core/                    # 核心合约
│   ├── BondlyIdentity.sol   # 身份管理
│   ├── BondlyProfile.sol    # 用户档案
│   ├── BondlyReputation.sol # 声誉系统
│   └── BondlyContent.sol    # 内容管理
├── social/                  # 社交合约
│   ├── BondlyInteraction.sol
│   ├── BondlyStaking.sol
│   └── BondlyRewards.sol
├── tokens/                  # 代币合约
│   ├── BondlyToken.sol      # 平台代币
│   ├── BondlyNFT.sol        # 内容 NFT
│   └── BondlySBT.sol        # 灵魂绑定代币
├── governance/              # 治理合约
│   ├── BondlyDAO.sol
│   ├── BondlyVoting.sol
│   └── BondlyTreasury.sol
├── interfaces/              # 接口定义
│   ├── IBondlyIdentity.sol
│   ├── IBondlyContent.sol
│   └── IBondlyToken.sol
├── libraries/               # 库合约
│   ├── BondlyMath.sol
│   ├── BondlyUtils.sol
│   └── BondlyValidation.sol
└── upgrades/                # 可升级合约
    ├── BondlyIdentityV2.sol
    └── BondlyContentV2.sol

scripts/                     # 部署脚本
├── deploy/
│   ├── 01_deploy_core.ts
│   ├── 02_deploy_social.ts
│   └── 03_deploy_tokens.ts
├── tasks/
│   ├── setup.ts
│   ├── verify.ts
│   └── upgrade.ts
└── utils/
    ├── constants.ts
    └── helpers.ts

test/                        # 测试文件
├── unit/
│   ├── BondlyIdentity.test.ts
│   ├── BondlyContent.test.ts
│   └── BondlyToken.test.ts
├── integration/
│   ├── SocialFlow.test.ts
│   └── GovernanceFlow.test.ts
└── fixtures/
    ├── users.ts
    └── content.ts
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### 安装依赖
```bash
cd bondly-contracts
npm install --legacy-peer-deps
```

### 环境配置
创建 `.env` 文件：
```env
# 网络配置
MAINNET_RPC_URL="https://mainnet.infura.io/v3/your_project_id"
GOERLI_RPC_URL="https://goerli.infura.io/v3/your_project_id"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your_project_id"
POLYGON_RPC_URL="https://polygon-rpc.com"
POLYGON_MUMBAI_RPC_URL="https://rpc-mumbai.maticvigil.com"

# 私钥配置
PRIVATE_KEY="your_private_key_here"
DEPLOYER_PRIVATE_KEY="deployer_private_key_here"

# API 密钥
ETHERSCAN_API_KEY="your_etherscan_api_key"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"
COINMARKETCAP_API_KEY="your_coinmarketcap_api_key"

# OpenZeppelin Defender
DEFENDER_API_KEY="your_defender_api_key"
DEFENDER_API_SECRET="your_defender_api_secret"

# 合约配置
BOND_TOKEN_NAME="Bondly Token"
BOND_TOKEN_SYMBOL="BOND"
INITIAL_SUPPLY="1000000000000000000000000" # 1M tokens

# Gas 报告
REPORT_GAS=true

# 网络配置
NETWORK_NAME="goerli"
```

### 编译合约
```bash
# 编译所有合约
npx hardhat compile

# 编译特定合约
npx hardhat compile --contracts contracts/core/BondlyIdentity.sol
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npx hardhat test test/unit/BondlyIdentity.test.ts

# 运行测试并生成覆盖率报告
npm run coverage
```

### 部署合约
```bash
# 部署到本地网络
npx hardhat node
npx hardhat run scripts/deploy/01_deploy_core.ts --network localhost

# 部署到测试网
npx hardhat run scripts/deploy/01_deploy_core.ts --network goerli

# 部署到主网
npx hardhat run scripts/deploy/01_deploy_core.ts --network mainnet
```

## ✅ 开发环境验证

### 已完成的配置
- ✅ **依赖安装**: 所有 Solidity 开发依赖已安装
- ✅ **编译测试**: 合约编译功能正常
- ✅ **控制台交互**: Hardhat 控制台可正常使用
- ✅ **合约大小分析**: 合约大小分析工具可用
- ✅ **多网络支持**: 本地、测试网、主网配置完成
- ✅ **代码质量工具**: Solhint、Prettier 配置完成
- ✅ **Gas 报告**: Gas 使用分析工具配置完成

### 测试命令
```bash
# 检查环境配置
npm run check-env

# 编译合约
npx hardhat compile

# 启动本地节点
npx hardhat node

# 进入控制台
npx hardhat console

# 查看合约大小
npx hardhat size-contracts

# 生成项目报告
npm run report
```

## 📚 合约文档

### BondlyIdentity 合约

用户身份管理合约，负责用户注册、SBT 声誉管理。

#### 主要功能
```solidity
// 用户注册
function registerUser(string memory username, string memory avatar) external;

// 更新声誉值
function updateReputation(address user, uint256 reputation) external;

// 获取用户信息
function getUserInfo(address user) external view returns (UserInfo memory);

// 铸造 SBT
function mintSBT(address user, uint256 tokenId, string memory metadata) external;
```

#### 事件
```solidity
event UserRegistered(address indexed user, string username, uint256 timestamp);
event ReputationUpdated(address indexed user, uint256 oldReputation, uint256 newReputation);
event SBTMinted(address indexed user, uint256 tokenId, string metadata);
```

### BondlyContent 合约

内容发布和管理合约，支持 IPFS 存储和内容验证。

#### 主要功能
```solidity
// 发布内容
function publishContent(
    string memory title,
    string memory contentHash,
    string[] memory tags,
    uint8 visibility
) external returns (uint256 contentId);

// 更新内容
function updateContent(uint256 contentId, string memory newContentHash) external;

// 删除内容
function deleteContent(uint256 contentId) external;

// 获取内容信息
function getContent(uint256 contentId) external view returns (Content memory);
```

#### 事件
```solidity
event ContentPublished(
    uint256 indexed contentId,
    address indexed author,
    string title,
    string contentHash,
    uint256 timestamp
);
event ContentUpdated(uint256 indexed contentId, string newContentHash);
event ContentDeleted(uint256 indexed contentId);
```

### BondlyStaking 合约

基于质押的社交互动合约，防止刷量行为。

#### 主要功能
```solidity
// 质押代币进行互动
function stakeForInteraction(uint256 amount) external;

// 点赞内容
function likeContent(uint256 contentId) external;

// 评论内容
function commentContent(uint256 contentId, string memory comment) external;

// 取回质押
function withdrawStake() external;

// 获取质押信息
function getStakeInfo(address user) external view returns (StakeInfo memory);
```

#### 事件
```solidity
event Staked(address indexed user, uint256 amount, uint256 timestamp);
event InteractionPerformed(
    address indexed user,
    uint256 indexed contentId,
    InteractionType interactionType
);
event StakeWithdrawn(address indexed user, uint256 amount);
```

### BondlyToken 合约

平台代币合约，支持质押、奖励、治理等功能。

#### 主要功能
```solidity
// 铸造代币
function mint(address to, uint256 amount) external onlyMinter;

// 销毁代币
function burn(uint256 amount) external;

// 质押代币
function stake(uint256 amount) external;

// 解除质押
function unstake(uint256 amount) external;

// 获取质押奖励
function claimRewards() external;
```

#### 事件
```solidity
event TokensMinted(address indexed to, uint256 amount);
event TokensBurned(address indexed from, uint256 amount);
event Staked(address indexed user, uint256 amount);
event Unstaked(address indexed user, uint256 amount);
event RewardsClaimed(address indexed user, uint256 amount);
```

## 🔧 配置说明

### 网络配置
在 `hardhat.config.ts` 中配置：
- 以太坊网络 RPC 端点
- 智能合约地址
- Gas 价格策略

### 合约验证
```bash
# 验证合约
npx hardhat verify --network goerli CONTRACT_ADDRESS "constructor_arg1" "constructor_arg2"

# 批量验证
npx hardhat run scripts/tasks/verify.ts --network goerli
```

### Gas 优化
- 使用批量操作减少交易次数
- 优化存储布局减少 Gas 消耗
- 使用事件替代存储状态
- 实现 Gas 预估功能

## 🔄 开发规范

### 代码风格
- 遵循 Solidity 官方风格指南
- 使用 Prettier 格式化
- 添加详细的 NatSpec 注释

### 安全实践
- 使用 OpenZeppelin 安全合约
- 进行全面的安全审计
- 实现访问控制机制
- 添加重入攻击防护

### 测试策略
- 单元测试覆盖率 > 90%
- 集成测试覆盖主要流程
- 模糊测试发现边界情况
- 压力测试验证性能

### 升级策略
- 使用代理模式实现可升级
- 版本控制和迁移脚本
- 向后兼容性保证
- 紧急暂停机制

## 📦 部署流程

### 1. 准备阶段
```bash
# 检查环境配置
npm run check-env

# 运行完整测试
npm run test:all

# 生成部署报告
npm run report
```

### 2. 部署阶段
```bash
# 部署核心合约
npx hardhat run scripts/deploy/01_deploy_core.ts --network goerli

# 部署社交合约
npx hardhat run scripts/deploy/02_deploy_social.ts --network goerli

# 部署代币合约
npx hardhat run scripts/deploy/03_deploy_tokens.ts --network goerli
```

### 3. 验证阶段
```bash
# 验证所有合约
npx hardhat run scripts/tasks/verify.ts --network goerli

# 运行部署后测试
npm run test:post-deploy
```

### 4. 监控阶段
```bash
# 启动监控脚本
npx hardhat run scripts/monitor/start.ts --network goerli
```

## 🔍 安全审计

### 审计范围
- 智能合约代码审查
- 经济模型分析
- 攻击向量识别
- 风险评估报告

### 审计工具
- **Slither**: 静态分析
- **Mythril**: 符号执行
- **Echidna**: 模糊测试
- **Manticore**: 动态分析

### 审计流程
1. 代码审查和静态分析
2. 动态测试和模糊测试
3. 手动代码审计
4. 经济模型验证
5. 最终报告和修复建议

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [前端项目](../bondly-fe/README.md)
- [后端 API](../bondly-api/README.md)
- [技术文档](../docs/README.md)
- [合约地址](https://etherscan.io/address/0x...) 