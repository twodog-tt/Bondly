# Bondly Contracts

Bondly 是 Web3 去中心化社交平台的智能合约集合，包含内容 NFT、互动质押、成就 SBT、声誉、奖励分配等核心模块。

## 核心合约
- BondlyToken：平台代币
- ContentNFT：内容资产化 NFT
- InteractionStaking：互动质押
- AchievementNFT：成就 SBT
- ReputationVault：声誉分数
- RewardDistributor：奖励分配
- BondlyRegistry：合约注册表

## 目录结构
```
contracts/    # 合约源码
scripts/      # 部署与工具脚本
 test/         # 单元测试
 docs/         # 合约文档
```

## 快速开始
```bash
npm install --legacy-peer-deps
npx hardhat compile
npm test
```

更多合约接口与用法详见 docs/ 目录。 