# Bondly 智能合约系统

Bondly 是面向 Web3 去中心化社交平台的智能合约系统，支持内容资产化、互动激励、成就徽章（SBT）、声誉治理、奖励分配等核心场景。所有模块均通过注册表寻址，支持灵活升级与治理。

## 核心模块与合约

- **BondlyToken**：平台原生代币，支持 ERC20、Permit、Votes、UUPS 升级、角色权限、暂停等
- **ContentNFT**：内容资产化 NFT，支持创作者追踪、独立元数据、可转让
- **AchievementNFT**：成就徽章 SBT，不可转让，仅可铸造/销毁，支持多成就类型
- **InteractionStaking**：互动质押，用户点赞/评论/收藏需质押 BOND，奖励归创作者
- **ReputationVault**：声誉分数管理，支持快照、治理门槛
- **RewardDistributor**：按声誉分配 BOND 奖励，防止重复领取
- **BondlyDAO**：治理提案管理，支持押金/声誉双通道提案
- **BondlyVoting**：投票机制，支持 Token、Reputation、混合权重快照
- **BondlyTreasury**：资金库，治理资金安全、参数变更、紧急提取
- **BondlyRegistry**：合约注册表，统一寻址、升级、白名单校验

## 合约目录结构

```
contracts/
  token/         # BondlyToken 平台代币
  nft/           # ContentNFT、AchievementNFT（内容 NFT、成就 SBT）
  reputation/    # ReputationVault、RewardDistributor、InteractionStaking 等
  governance/    # BondlyDAO、BondlyVoting（治理提案与投票）
  treasury/      # BondlyTreasury（资金库）
  registry/      # BondlyRegistry（注册表）
```

## 主要功能亮点
- **内容资产化**：用户内容可铸造成 NFT，支持独立元数据、创作者追踪、可转让
- **成就徽章 SBT**：不可转让的成就 NFT，记录用户荣誉，支持多类型、历史追踪
- **互动质押激励**：点赞/评论/收藏需质押 BOND，奖励归内容创作者，支持灵活配置
- **声誉与奖励**：声誉分数快照，按声誉分配 BOND 奖励，防止重复领取
- **DAO 治理系统**：支持押金/声誉双通道提案，快照投票，参数灵活治理
- **注册表寻址**：所有模块寻址、升级、白名单校验均通过 Registry 统一管理
- **安全机制**：权限分明、事件丰富、快照防操纵、合约可暂停、try/catch 捕获链上异常

## 快速开始
```bash
npm install --legacy-peer-deps
npx hardhat compile
npm test
```

## 文档索引
- [docs/GovernanceSystem.md](docs/GovernanceSystem.md) 治理系统设计与接口
- [docs/ContentNFT.md](docs/ContentNFT.md) 内容 NFT 合约说明
- [docs/AchievementNFT.md](docs/AchievementNFT.md) 成就 SBT 合约说明
- [docs/RewardDistributor.md](docs/RewardDistributor.md) 声誉奖励分配
- [docs/BondlyToken.md](docs/BondlyToken.md) 平台代币说明
- [docs/InteractionStaking.md](docs/InteractionStaking.md) 互动质押机制
- [docs/BondlyRegistry.md](docs/BondlyRegistry.md) 合约注册表说明

更多接口与用法详见 docs/ 目录与各合约注释。 