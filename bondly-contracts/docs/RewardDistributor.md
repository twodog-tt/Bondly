# RewardDistributor 合约文档

## 概述

RewardDistributor 合约用于 Bondly 平台根据用户在 ReputationVault 中的声誉分数，按周期分配 BOND Token 奖励。支持项目方注入奖励资金、记录每一轮声誉快照、用户按比例领取奖励，并防止重复领取。所有合约地址通过 BondlyRegistry 动态获取，保持模块解耦。

- 基于 Ownable
- 支持项目方注入奖励资金（BOND Token）
- 每轮奖励可快照用户声誉分布
- 用户按声誉占比领取奖励，防止重复领取
- 所有合约地址通过 BondlyRegistry 动态获取

## 主要功能
- 项目方可注入奖励资金
- 每轮奖励可快照用户声誉分布
- 用户按声誉占比领取奖励，防止重复领取
- 支持查询当前轮可领取奖励
- 声誉数据从 ReputationVault 获取

## 合约接口

### 构造函数
```solidity
constructor(address registryAddress)
```
- **registryAddress**: BondlyRegistry 合约地址
- 部署时需指定注册表地址，便于集成

### 发起新一轮奖励快照
```solidity
function snapshot(address[] calldata users) external onlyOwner;
```
- **users**: 需要快照的用户地址数组（由前端/项目方传入活跃用户列表）
- 只有 owner 可调用
- 声誉数据从 ReputationVault 获取
- 记录每个用户的声誉快照和总声誉

### 注入奖励资金
```solidity
function depositReward(uint256 amount) external onlyOwner;
```
- **amount**: 注入金额（BOND Token）
- 需要提前 approve 足够的 BOND 给本合约
- 奖励池金额累加到当前轮

### 用户领取奖励
```solidity
function claimReward() external;
```
- 用户领取当前轮奖励，按声誉占比分配
- 每轮每用户只能领取一次

### 查询当前轮可领取奖励
```solidity
function getClaimable(address user) external view returns (uint256);
```
- **user**: 用户地址
- 返回当前轮该用户可领取奖励金额

## 事件

### Snapshot
```solidity
event Snapshot(uint256 indexed round, uint256 totalReputation, uint256 userCount);
```
- **round**: 奖励轮次
- **totalReputation**: 总声誉
- **userCount**: 快照用户数
- 每轮快照时触发

### RewardDeposited
```solidity
event RewardDeposited(uint256 indexed round, uint256 amount);
```
- **round**: 奖励轮次
- **amount**: 注入金额
- 每次注入奖励资金时触发

### RewardClaimed
```solidity
event RewardClaimed(uint256 indexed round, address indexed user, uint256 amount);
```
- **round**: 奖励轮次
- **user**: 用户地址
- **amount**: 领取金额
- 用户领取奖励时触发

## 用法示例

1. **项目方发起新一轮快照**
```solidity
rewardDistributor.snapshot(userList);
```

2. **项目方注入奖励资金**
```solidity
rewardDistributor.depositReward(10000 ether);
```

3. **用户领取奖励**
```solidity
rewardDistributor.claimReward();
```

4. **查询用户可领取奖励**
```solidity
uint256 claimable = rewardDistributor.getClaimable(user);
```

## 设计说明与安全性
- 每轮奖励分配基于快照时的声誉分布，防止后续声誉变动影响公平性
- 用户领取奖励后会被标记，防止重复领取
- 项目方可灵活配置奖励池和快照用户范围
- 所有合约地址通过 BondlyRegistry 动态获取，便于模块解耦和升级
- 事件追踪，便于前端监听和链上分析

## 扩展建议
- 支持多轮历史奖励查询、批量领取等
- 支持奖励池自动结算、剩余奖励回收等
- 可与内容、互动、成就等模块联动，实现更丰富的激励机制 