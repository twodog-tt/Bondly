# Bondly 智能合约部署指南

## 概述

本文档详细说明 Bondly 智能合约系统的部署流程、配置选项和最佳实践。

## 环境准备

### 1. 依赖安装
```bash
# 安装 Node.js 依赖
npm install --legacy-peer-deps

# 安装 Hardhat 插件
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @openzeppelin/hardhat-upgrades
npm install --save-dev solidity-coverage
```

### 2. 环境配置
复制环境变量模板并配置：
```bash
cp env.example .env
```

配置 `.env` 文件：
```env
# 网络配置
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# 合约配置
BONDLY_TOKEN_NAME="Bondly Token"
BONDLY_TOKEN_SYMBOL="BOND"
BONDLY_TOKEN_DECIMALS=18
BONDLY_TOKEN_MAX_SUPPLY=2000000000000000000000000000

# 治理配置
DAO_ADDRESS=your_dao_address
TREASURY_ADDRESS=your_treasury_address
```

## 部署流程

### 1. 编译合约
```bash
# 清理并重新编译
npx hardhat clean
npx hardhat compile
```

### 2. 部署顺序

#### 第一步：部署 BondlyRegistry
```bash
npx hardhat run scripts/deploy/deploy.ts --network mainnet
```

Registry 是核心注册表，其他合约都需要通过它进行寻址。

#### 第二步：部署 BondlyToken
```bash
npx hardhat run scripts/deploy/token.ts --network mainnet
```

代币合约使用 UUPS 升级模式，需要部署代理合约。

#### 第三步：部署 NFT 合约
```bash
npx hardhat run scripts/deploy/nft.ts --network mainnet
```

部署 ContentNFT 和 AchievementNFT 合约。

#### 第四步：部署声誉系统
```bash
npx hardhat run scripts/deploy/reputation.ts --network mainnet
```

部署 ReputationVault、RewardDistributor、InteractionStaking 等合约。

#### 第五步：部署治理系统
```bash
npx hardhat run scripts/deploy/governance.ts --network mainnet
```

部署 BondlyDAO 和 BondlyVoting 合约。

#### 第六步：部署资金库
```bash
npx hardhat run scripts/deploy/treasury.ts --network mainnet
```

部署 BondlyTreasury 合约。

### 3. 合约初始化

部署完成后，需要初始化合约间的依赖关系：

```bash
# 注册合约地址到 Registry
npx hardhat run scripts/init/register-contracts.ts --network mainnet

# 设置合约权限
npx hardhat run scripts/init/setup-permissions.ts --network mainnet

# 初始化治理参数
npx hardhat run scripts/init/setup-governance.ts --network mainnet
```

## 网络配置

### 主网部署
```javascript
// hardhat.config.ts
module.exports = {
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
    },
  },
};
```

### 测试网部署
```javascript
// hardhat.config.ts
module.exports = {
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
    },
  },
};
```

## 合约验证

### 1. Etherscan 验证
```bash
# 验证主合约
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# 验证代理合约
npx hardhat verify --network mainnet PROXY_ADDRESS

# 验证带参数的合约
npx hardhat verify --network mainnet CONTRACT_ADDRESS "param1" "param2"
```

### 2. 验证脚本
```bash
# 批量验证所有合约
npx hardhat run scripts/verify/verify-all.ts --network mainnet
```

## 安全检查清单

### 部署前检查
- [ ] 合约已通过所有测试
- [ ] 测试覆盖率达到要求
- [ ] 代码已通过安全审计
- [ ] 环境变量配置正确
- [ ] 私钥安全存储

### 部署后检查
- [ ] 所有合约部署成功
- [ ] 合约地址正确注册到 Registry
- [ ] 权限设置正确
- [ ] 合约功能测试通过
- [ ] Etherscan 验证完成

### 生产环境检查
- [ ] 多签钱包配置
- [ ] 紧急暂停机制测试
- [ ] 升级机制验证
- [ ] 监控系统部署
- [ ] 备份和恢复计划

## 升级流程

### 1. 准备升级
```bash
# 编译新版本合约
npx hardhat compile

# 运行升级测试
npx hardhat test test/upgrade/
```

### 2. 执行升级
```bash
# 升级代理合约
npx hardhat run scripts/upgrade/upgrade-token.ts --network mainnet

# 验证升级结果
npx hardhat run scripts/verify/verify-upgrade.ts --network mainnet
```

### 3. 升级后验证
- [ ] 合约功能正常
- [ ] 数据完整性检查
- [ ] 用户余额验证
- [ ] 事件日志检查

## 监控和维护

### 1. 事件监控
```javascript
// 监控重要事件
const events = [
  'TokensMinted',
  'TokensBurned', 
  'ContentMinted',
  'InteractionStaked',
  'RewardClaimed',
  'ProposalCreated',
  'VoteCast'
];
```

### 2. 状态检查
```bash
# 检查合约状态
npx hardhat run scripts/monitor/check-status.ts --network mainnet

# 检查用户余额
npx hardhat run scripts/monitor/check-balances.ts --network mainnet
```

### 3. 性能监控
- Gas 消耗监控
- 交易成功率
- 合约调用频率
- 错误率统计

## 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查网络连接
npx hardhat node

# 检查 Gas 价格
npx hardhat run scripts/utils/check-gas.ts --network mainnet
```

#### 2. 验证失败
```bash
# 手动验证
npx hardhat verify --network mainnet CONTRACT_ADDRESS --constructor-args args.js

# 检查编译设置
npx hardhat compile --force
```

#### 3. 权限错误
```bash
# 检查角色设置
npx hardhat run scripts/utils/check-roles.ts --network mainnet

# 重置权限
npx hardhat run scripts/utils/reset-permissions.ts --network mainnet
```

## 最佳实践

### 1. 部署策略
- 使用多签钱包进行部署
- 分阶段部署和测试
- 保留回滚方案
- 记录部署日志

### 2. 安全措施
- 私钥离线存储
- 使用硬件钱包
- 定期备份配置
- 监控异常活动

### 3. 维护计划
- 定期更新依赖
- 监控合约状态
- 备份重要数据
- 制定应急响应计划

## 联系支持

如遇到部署问题，请联系：
- 技术文档：查看 docs/ 目录
- 测试问题：运行 `npm test` 检查
- 部署问题：检查网络配置和权限
- 安全建议：参考安全审计报告 