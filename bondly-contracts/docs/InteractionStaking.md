# InteractionStaking 合约文档

## 概述

InteractionStaking 合约用于 Bondly 平台内容互动激励场景，用户在点赞、评论、收藏等互动时需质押 BondlyToken，质押奖励归内容创作者所有。支持多种互动类型、质押金额灵活配置、用户撤回、奖励领取等功能。

- 基于 Ownable
- 支持多种互动类型（点赞、评论、收藏）
- 用户互动需质押 BondlyToken，不同类型金额可配置
- 记录每个用户对每个内容 NFT 的质押明细
- 支持用户撤回未结算质押
- 内容创作者可领取互动奖励
- 通过 BondlyRegistry 获取 BondlyToken、ContentNFT 地址
- 通过 IContentNFT 接口获取内容创作者

## 主要功能
- 用户互动需质押 BOND，不同类型金额不同
- 记录用户对每个内容 NFT 的质押明细
- 用户可撤回未结算质押（奖励未被领取前）
- 创作者可领取互动奖励（通过 getContentMeta 获取 creator）
- 支持多种互动类型，灵活扩展
- 防止奖励重复领取和已结算质押被撤回

## 相关接口说明

### IContentNFT 接口
合约通过如下接口与 ContentNFT 交互，获取内容元数据和创作者：
```solidity
interface IContentNFT {
    struct ContentMeta {
        string title;
        string summary;
        string coverImage;
        string ipfsLink;
        address creator;
    }
    function getContentMeta(uint256 tokenId) external view returns (ContentMeta memory);
}
```
- **creator** 字段用于判定内容创作者归属

## 合约接口

### 构造函数
```solidity
constructor(address registryAddress)
```
- **registryAddress**: BondlyRegistry 合约地址
- 部署时指定注册表地址，便于集成

### 设置互动类型质押金额
```solidity
function setStakeAmount(InteractionType interactionType, uint256 amount) external onlyOwner;
```
- **interactionType**: 互动类型（Like/Comment/Favorite）
- **amount**: 质押金额（单位：wei）
- 仅 owner 可调用

### 用户进行互动并质押
```solidity
function stakeInteraction(uint256 tokenId, InteractionType interactionType) external;
```
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- 用户需提前 approve 足够的 BOND 给本合约
- tokenId 必须存在，且不能重复互动

### 用户撤回未结算质押
```solidity
function withdrawInteraction(uint256 tokenId, InteractionType interactionType) external;
```
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- 仅未被创作者领取奖励前可撤回
- 若 rewardClaimed[tokenId][interactionType] 为 true，则不能撤回

### 创作者领取互动奖励
```solidity
function claimReward(uint256 tokenId, InteractionType interactionType) external;
```
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- 只有内容创作者（通过 ContentNFT.getContentMeta 获取）可领取
- 领取后 rewardClaimed[tokenId][interactionType] 置为 true，防止重复领取

### 查询用户质押明细
```solidity
function getUserStake(address user, uint256 tokenId, InteractionType interactionType) external view returns (uint256);
```
- **user**: 用户地址
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- 返回该用户对该内容的质押金额

### 查询内容累计质押总额
```solidity
function getTotalStaked(uint256 tokenId, InteractionType interactionType) external view returns (uint256);
```
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- 返回该内容该类型互动的累计质押总额

### 查询奖励是否已领取
```solidity
mapping(uint256 => mapping(InteractionType => bool)) public rewardClaimed;
```
- **rewardClaimed[tokenId][interactionType]**: 是否已领取奖励
- 领取后为 true，不能再撤回质押或重复领取

## 事件

### InteractionStaked
```solidity
event InteractionStaked(address indexed user, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);
```
- **user**: 互动用户
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- **amount**: 质押金额
- 用户互动并质押时触发

### InteractionWithdrawn
```solidity
event InteractionWithdrawn(address indexed user, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);
```
- **user**: 互动用户
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- **amount**: 撤回金额
- 用户撤回质押时触发

### RewardClaimed
```solidity
event RewardClaimed(address indexed creator, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);
```
- **creator**: 创作者地址
- **tokenId**: 内容 NFT ID
- **interactionType**: 互动类型
- **amount**: 领取金额
- 创作者领取奖励时触发

## 用法示例

1. **用户点赞内容并质押**
```solidity
interactionStaking.stakeInteraction(tokenId, InteractionStaking.InteractionType.Like);
```

2. **用户撤回点赞质押**
```solidity
interactionStaking.withdrawInteraction(tokenId, InteractionStaking.InteractionType.Like);
// 若 rewardClaimed[tokenId][Like] == true，则撤回会失败
```

3. **创作者领取点赞奖励**
```solidity
interactionStaking.claimReward(tokenId, InteractionStaking.InteractionType.Like);
// 只有 ContentNFT.getContentMeta(tokenId).creator 可领取
```

4. **查询用户对内容的质押金额**
```solidity
uint256 stake = interactionStaking.getUserStake(user, tokenId, InteractionStaking.InteractionType.Like);
```

5. **查询内容累计点赞质押总额**
```solidity
uint256 total = interactionStaking.getTotalStaked(tokenId, InteractionStaking.InteractionType.Like);
```

6. **查询奖励是否已领取**
```solidity
bool claimed = interactionStaking.rewardClaimed(tokenId, InteractionStaking.InteractionType.Like);
```

## 设计说明与安全性
- 互动类型和质押金额 owner 可灵活配置，适应不同激励策略
- 用户质押需先授权，合约安全转账
- 互动、撤回、奖励领取均有事件追踪，便于前端监听和链上分析
- 通过 BondlyRegistry 统一寻址，便于合约间集成
- 通过 ContentNFT.getContentMeta 获取创作者，安全防止 NFT 转让后领取归属混乱
- 领取奖励后 rewardClaimed 置 true，防止重复领取和已结算质押被撤回
- 可扩展更多互动类型和复杂结算逻辑

## 扩展建议
- 支持批量互动、批量奖励结算
- 支持互动积分、排行榜等 gamification 机制
- 可与内容声誉、NFT 等模块联动 