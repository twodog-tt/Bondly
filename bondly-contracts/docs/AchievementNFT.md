# AchievementNFT 合约文档

## 概述

AchievementNFT 合约用于 Bondly 平台的成就激励体系，项目方可为用户颁发不可转让的成就 NFT（Soulbound Token），记录其在平台的活跃与成就。每类成就有唯一 ID，支持独立元数据，适合 Web3 社交平台、黑客松等场景。

- 基于 OpenZeppelin ERC721Enumerable、Ownable
- NFT 不可转让（Soulbound Token）
- owner 可为用户颁发不同类型的成就 NFT
- 每类成就有唯一 achievementId，同一地址不能重复领取
- 支持 tokenURI 设置每个成就 NFT 的元数据
- 集成 BondlyRegistry 统一寻址
- 支持查询用户所有成就 NFT 及其成就类型
- 每个 NFT 记录铸造时间戳

## 主要功能
- 颁发不可转让的成就 NFT，记录用户荣誉
- 每类成就有唯一 ID，支持多种成就类型
- 同一地址不能领取同一成就多次
- 支持为每个 NFT 设置独立的元数据 JSON 链接
- owner 可销毁 NFT
- 支持一次性查询用户所有成就 NFT 及类型
- 每个 NFT 记录铸造时间戳，便于成就历史追踪

## 合约接口

### 构造函数
```solidity
constructor(string memory name, string memory symbol, address initialOwner, address registryAddress)
```
- **name**: NFT 名称
- **symbol**: NFT 符号
- **initialOwner**: 初始 owner
- **registryAddress**: BondlyRegistry 合约地址
- 部署时需指定注册表地址，便于集成

### 颁发成就 NFT
```solidity
function mintAchievement(address to, uint256 achievementId, string memory tokenUri) external onlyOwner returns (uint256);
```
- **to**: 获得成就的用户地址
- **achievementId**: 成就类型ID（如 1=活跃作者，2=点赞达人）
- **tokenUri**: NFT 元数据 JSON 链接（如 IPFS JSON）
- 同一地址不能领取同一成就多次
- 铸造后触发 AchievementMinted 事件
- 返回新 NFT 的 tokenId
- 每个 tokenId 会记录铸造时间戳，可通过 mintedAt(tokenId) 查询

### 查询 NFT 的铸造时间戳
```solidity
mapping(uint256 => uint256) public mintedAt;
```
- **mintedAt[tokenId]**: 该 NFT 的铸造时间戳（秒）

### 查询用户所有成就 NFT 及类型
```solidity
function getUserAchievements(address user) external view returns (uint256[] memory tokenIds, uint256[] memory achievementIds);
```
- **user**: 用户地址
- 返回该用户所有 NFT 的 tokenId 数组和对应的 achievementId 数组
- 便于前端一次性查询所有成就

### 获取 NFT 的元数据 JSON 链接
```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory);
```
- **tokenId**: NFT ID
- 返回 mint 时设置的 JSON 链接

### 销毁成就 NFT（可选）
```solidity
function burn(uint256 tokenId) external onlyOwner;
```
- **tokenId**: NFT ID
- owner 可销毁 NFT，回收成就领取资格

### Soulbound 特性（不可转让）
- 所有转让、授权、批准相关方法均被禁止，NFT 只能铸造和销毁，不能转移

## 事件

### AchievementMinted
```solidity
event AchievementMinted(address indexed user, uint256 indexed achievementId, uint256 indexed tokenId);
```
- **user**: 获得成就的用户
- **achievementId**: 成就类型ID
- **tokenId**: NFT ID
- 每次铸造成就 NFT 时触发

## 用法示例

1. **颁发成就 NFT**
```solidity
achievementNFT.mintAchievement(user, 1, "ipfs://Qm.../active-author.json");
```

2. **查询 NFT 元数据**
```solidity
string memory uri = achievementNFT.tokenURI(tokenId);
```

3. **owner 销毁 NFT**
```solidity
achievementNFT.burn(tokenId);
```

4. **查询 NFT 铸造时间戳**
```solidity
uint256 ts = achievementNFT.mintedAt(tokenId);
```

5. **查询用户所有成就 NFT 及类型**
```solidity
(uint256[] memory tokenIds, uint256[] memory achievementIds) = achievementNFT.getUserAchievements(user);
```

## 设计说明与安全性
- NFT 不可转让，防止成就买卖，确保荣誉归属
- owner 可灵活颁发和销毁成就 NFT，适应多种激励场景
- 每个 NFT 支持独立元数据，便于丰富前端展示
- 通过 BondlyRegistry 统一寻址，便于合约间集成
- 事件追踪，便于前端监听和链上分析
- 支持成就历史追踪和前端批量查询

## 设计说明补充
AchievementNFT 是不可转让（Soulbound）的荣誉徽章：
- 所有转让和授权相关方法均被禁止，直接 revert("Soulbound: non-transferable")。
- 只有 MINTER_ROLE 可铸造，BURNER_ROLE 可销毁，合约支持暂停机制。
- 每个地址每种成就只能获得一次，mintAchievement 有 require 检查。
- 每次铸造会触发 AchievementMinted 和 AchievementGranted 事件，便于链上和前端追踪。
- 支持 setAchievementURI 为每个成就类型设置独立 URI，便于前端展示不同成就。

## 扩展建议
- 支持成就升级、批量颁发、链下数据同步等
- 可与内容、互动、声誉等模块联动
- 支持成就排行榜、成就展示墙等 Web3 社交玩法

- 所有注册表接口如有描述，统一为 getContractAddress(string memory name, string memory version)。
- MINTER_ROLE、BURNER_ROLE、PAUSER_ROLE 权限与合约一致。
- 事件、变量命名与合约一致。 