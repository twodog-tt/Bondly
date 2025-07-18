# ETH Staking 文档

## 概述

ETH Staking 是 Bondly 平台的 ETH 质押合约，允许用户质押 ETH 并获得 BOND 代币奖励。该合约采用流动性挖矿模式，通过质押 ETH 来激励用户参与平台生态。

## 功能特性

### 核心功能
- **ETH 质押**：用户可质押任意数量的 ETH（最低 0.01 ETH）
- **BOND 奖励**：按质押比例分配 BOND 代币奖励
- **灵活操作**：支持质押、解除质押、领取奖励的组合操作
- **实时 APY**：动态计算和显示年化收益率
- **无锁定期**：用户可以随时解除质押

### 安全特性
- **重入攻击防护**：使用 ReentrancyGuard
- **暂停机制**：紧急情况下可暂停合约
- **角色权限管理**：基于 AccessControl 的权限控制
- **紧急提取**：管理员可在紧急情况下提取资金

## 合约架构

### 主要组件
```solidity
contract ETHStaking is AccessControl, Pausable, ReentrancyGuard {
    // 用户质押信息结构
    struct UserStake {
        uint256 stakedAmount;    // 质押金额 (ETH)
        uint256 rewardDebt;      // 奖励债务
        uint256 lastUpdateTime;  // 最后更新时间
    }
    
    // 核心状态变量
    mapping(address => UserStake) public userStakes;
    uint256 public totalStaked;
    uint256 public accRewardPerShare;
    uint256 public rewardRate;
    uint256 public rewardEndTime;
}
```

### 角色权限
- `DEFAULT_ADMIN_ROLE`：合约管理员，可执行紧急操作
- `REWARD_MANAGER_ROLE`：奖励管理员，可添加奖励
- `PAUSER_ROLE`：暂停管理员，可暂停/恢复合约

## 用户操作

### 1. 质押 ETH
```solidity
function stake() external payable
```
- **功能**：质押 ETH 到合约
- **参数**：通过 `msg.value` 发送 ETH
- **限制**：最低质押 0.01 ETH
- **效果**：增加用户质押金额，开始累积奖励

### 2. 解除质押
```solidity
function unstake(uint256 amount) external
```
- **功能**：解除质押并取回 ETH
- **参数**：`amount` - 解除质押的 ETH 数量
- **限制**：不能超过已质押金额
- **效果**：减少质押金额，ETH 返回用户钱包

### 3. 领取奖励
```solidity
function claim() external
```
- **功能**：领取累积的 BOND 奖励
- **限制**：必须有可领取的奖励
- **效果**：BOND 代币发送到用户钱包

### 4. 组合操作

#### 质押并领取奖励
```solidity
function stakeAndClaim() external payable
```
- **功能**：质押 ETH 的同时领取已有奖励
- **优势**：节省 Gas 费用，提升用户体验

#### 解除质押并领取奖励
```solidity
function unstakeAndClaim(uint256 amount) external
```
- **功能**：解除质押的同时领取奖励
- **优势**：一次交易完成两个操作

## 管理员操作

### 1. 添加奖励
```solidity
function addReward(uint256 amount, uint256 duration) external
```
- **功能**：向质押池添加 BOND 奖励
- **参数**：
  - `amount`：奖励金额（BOND）
  - `duration`：奖励持续时间（秒）
- **权限**：需要 `REWARD_MANAGER_ROLE`
- **效果**：设置奖励速率和结束时间

### 2. 紧急操作
```solidity
function emergencyWithdrawETH() external
function emergencyWithdrawBOND() external
```
- **功能**：紧急提取合约中的 ETH 或 BOND
- **权限**：需要 `DEFAULT_ADMIN_ROLE`
- **用途**：紧急情况下的资金保护

### 3. 合约管理
```solidity
function pause() external
function unpause() external
```
- **功能**：暂停/恢复合约操作
- **权限**：需要 `PAUSER_ROLE`

## 奖励机制

### 奖励计算
```solidity
function _calculateReward(address user) internal view returns (uint256)
```
- **算法**：基于用户质押比例和全局奖励累积
- **公式**：`(用户质押金额 × 全局奖励累积) / 1e18 - 用户奖励债务`

### APY 计算
```solidity
function calculateAPY() external view returns (uint256)
```
- **公式**：`(年化奖励 / 总质押金额) × 100`
- **更新**：实时计算，动态显示

## 查询功能

### 用户信息查询
```solidity
function getUserInfo(address user) external view returns (
    uint256 stakedAmount,
    uint256 pendingReward,
    uint256 userLastUpdateTime
)
```

### 合约状态查询
```solidity
function getContractETHBalance() external view returns (uint256)
function getContractBONDBalance() external view returns (uint256)
function getStaked(address user) external view returns (uint256)
function getReward(address user) external view returns (uint256)
```

## 事件

### 用户操作事件
- `Staked(address indexed user, uint256 amount)`：质押事件
- `Unstaked(address indexed user, uint256 amount)`：解除质押事件
- `RewardClaimed(address indexed user, uint256 amount)`：领取奖励事件

### 管理员操作事件
- `RewardAdded(uint256 amount, uint256 duration)`：添加奖励事件

## 部署配置

### 构造函数参数
```solidity
constructor(address registryAddress, address initialOwner)
```
- `registryAddress`：BondlyRegistry 合约地址
- `initialOwner`：初始管理员地址

### 环境变量
```bash
# 部署时需要的环境变量
REGISTRY_ADDRESS=0x...  # BondlyRegistry 合约地址
ETH_STAKING_OWNER=0x... # ETH Staking 合约管理员地址
```

## 前端集成

### Hook 使用
```typescript
import { useETHStaking } from '../hooks/useETHStaking';

const {
  stakedAmount,
  pendingReward,
  totalStaked,
  apy,
  stake,
  unstake,
  claim,
  stakeAndClaim,
  unstakeAndClaim,
  refreshAllData
} = useETHStaking();
```

### 组件集成
```typescript
import ETHStakingManager from '../components/ETHStakingManager';

<ETHStakingManager isMobile={isMobile} />
```

## 安全考虑

### 风险提示
1. **智能合约风险**：代码可能存在漏洞
2. **市场风险**：ETH 和 BOND 价格波动
3. **流动性风险**：大量用户同时解除质押
4. **管理风险**：管理员权限集中

### 安全措施
1. **代码审计**：建议进行专业安全审计
2. **权限分散**：关键操作需要多重签名
3. **紧急机制**：暂停功能和紧急提取
4. **监控告警**：异常操作监控

## 测试指南

### 单元测试
```bash
# 运行 ETH Staking 测试
npx hardhat test test/reputation/ETHStaking.test.ts
```

### 集成测试
```bash
# 部署测试环境
npx hardhat run scripts/deploy-eth-staking.ts --network localhost

# 测试用户操作
npx hardhat run scripts/test-eth-staking-simple.ts --network localhost
```

## 常见问题

### Q: 最小质押金额是多少？
A: 0.01 ETH

### Q: 质押有锁定期吗？
A: 没有锁定期，可以随时解除质押

### Q: 奖励如何计算？
A: 基于质押比例和全局奖励累积计算

### Q: 管理员可以提取用户的 ETH 吗？
A: 可以，但需要主动调用紧急提取函数

### Q: 如何添加奖励？
A: 管理员调用 `addReward` 函数，需要预先授权 BOND 代币

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 支持 ETH 质押和 BOND 奖励
- 实现组合操作功能
- 添加管理员权限控制
- 集成前端组件和 Hook

## 技术支持

如有问题或建议，请联系：
- 技术文档：[GitHub Repository](https://github.com/bondly/contracts)
- 社区讨论：[Discord](https://discord.gg/bondly)
- 安全报告：security@bondly.com 