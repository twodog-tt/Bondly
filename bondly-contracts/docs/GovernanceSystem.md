# Bondly 治理系统设计文档

## 概述

Bondly 治理系统是一个去中心化的自治组织（DAO）系统，由三个核心合约组成：

1. **BondlyDAO** - 提案管理合约
2. **BondlyVoting** - 投票机制合约  
3. **BondlyTreasury** - 资金管理合约
4. **BondlyRegistry** - 合约寻址注册表（所有合约间寻址均通过 Registry）

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BondlyDAO     │    │  BondlyVoting   │    │ BondlyTreasury  │
│                 │    │                 │    │                 │
│ • 提案管理      │◄──►│ • 投票机制      │    │ • 资金管理      │
│ • 状态流转      │    │ • 权重快照      │    │ • 提案执行      │
│ • 权限控制      │    │ • 快照机制      │    │ • 安全控制      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ BondlyRegistry  │
                    │                 │
                    │ • 合约注册      │
                    │ • 地址管理      │
                    └─────────────────┘
```

## 核心合约

### 1. BondlyDAO 合约

**功能职责：**
- 提案的创建、激活、执行和状态管理
- 与 BondlyVoting 和 BondlyTreasury 合约的协调
- 权限控制和治理参数管理
- 激活提案时自动调用 Voting 合约的 startVoting，同步快照区块和截止时间
- 声誉投票时自动调用 Voting 合约的 recordReputationSnapshot 记录快照
- 执行提案时校验目标合约是否在 Registry 白名单
- 执行提案时使用 try/catch 捕获 revert reason 并链上记录

**主要功能：**
- `createProposal()` - 创建新提案
- `activateProposal()` - 激活提案开始投票（自动调用 Voting.startVoting）
- `executeProposal()` - 执行通过的提案（白名单校验+try/catch）
- `onVote()` - 接收投票回调
- `isProposalActive()` - 检查提案状态

**提案状态：**
- `Pending` (0) - 待激活
- `Active` (1) - 投票中
- `Executed` (2) - 已执行
- `Failed` (3) - 已失败

### 2. BondlyVoting 合约

**功能职责：**
- 用户投票机制
- 投票权重快照（Token 权重用 ERC20Votes.getPastVotes，Reputation 权重用合约快照，Mixed 支持灵活加权）
- 投票快照和防操纵机制
- 只允许 DAO 合约调用 startVoting、endVoting、recordReputationSnapshot、权重类型/比例变更、暂停/恢复
- 支持合约暂停（pause/unpause），暂停后所有投票与快照操作不可用

**主要功能：**
- `vote()` - 用户投票（基于快照区块的权重，支持 Token、Reputation、Mixed 三种模式）
- `startVoting()` - 开始投票（由 DAO 调用，记录快照区块和截止时间）
- `endVoting()` - 结束投票（由 DAO 调用）
- `getVotingWeightAtSnapshot()` - 获取快照权重（Token: ERC20Votes.getPastVotes, Reputation: reputationSnapshots, Mixed: 按权重比例加权）
- `recordReputationSnapshot()` - 记录单个用户声誉快照（由 DAO 调用）
- `recordReputationSnapshots()` - 批量记录活跃用户声誉快照（由 DAO 调用，前端可传入 voters 列表）
- `updateWeightType()`/`setWeightType()` - 仅 DAO 可变更权重类型（Token/Reputation/Mixed）
- `updateWeightConfig()` - 仅 DAO 可变更混合权重比例（如 70/30、50/50）
- `pause(string)`/`unpause()` - 仅 DAO 可暂停/恢复投票合约
- `getVotingWeightType()` - 查询当前权重类型

**权重类型与配置：**
- `Token` (0) - 基于 ERC20Votes 代币快照余额
- `Reputation` (1) - 基于声誉分数快照
- `Mixed` (2) - Token+Reputation 按百分比加权（WeightConfig，默认 50/50，可治理变更）
- 权重类型和比例均需 DAO 提案通过后方可变更，提升治理可信度

**安全与扩展：**
- 所有敏感操作（权重类型/比例变更、暂停、快照）均需 DAO 治理
- 支持批量快照，提升大规模治理效率
- 事件丰富，便于前端和链下追踪

### 3. BondlyTreasury 合约

**功能职责：**
- 资金管理和安全控制
- 提案资金执行（白名单校验）
- 参数变更提案执行（仅允许 setter 白名单函数）
- 紧急资金提取

**主要功能：**
- `executeProposal()` - 执行资金提案（目标合约白名单校验）
- `executeParameterChange()` - 执行参数变更提案（函数选择器白名单校验）
- `emergencyWithdraw()` - 紧急提取
- `getFundsStatus()` - 获取资金状态
- `updateFundsParameters()` - 更新资金参数

### 4. BondlyRegistry 合约
- 所有合约间寻址均通过 Registry
- 支持合约注册、更新、删除、白名单校验

## 治理流程

### 1. 提案创建
```
用户 → BondlyDAO.createProposal()
     ↓
检查押金、参数有效性
     ↓
创建提案记录（状态：Pending）
     ↓
记录提案哈希（防篡改）
```

### 2. 提案激活
```
授权执行者 → BondlyDAO.activateProposal()
           ↓
设置快照区块和投票截止时间
           ↓
更新提案状态（状态：Active）
           ↓
调用 BondlyVoting.startVoting 同步快照区块/截止时间
           ↓
如为声誉投票，调用 Voting.recordReputationSnapshot 记录快照
```

### 3. 投票阶段
```
用户 → BondlyVoting.vote()
     ↓
检查投票资格和权重（基于快照区块）
     ↓
记录投票（防重复投票）
     ↓
回调 BondlyDAO.onVote()
     ↓
更新提案投票统计
```

### 4. 提案执行
```
授权执行者 → BondlyDAO.executeProposal()
           ↓
检查投票结果和截止时间
           ↓
验证提案数据完整性
           ↓
校验目标合约是否在 Registry 白名单
           ↓
执行提案操作（try/catch 捕获 revert reason 并链上记录）
           ↓
更新提案状态（Executed/Failed）
```

## 安全机制

### 1. 提案完整性保护
- 使用 `proposalHash` 字段存储提案数据的哈希值
- 执行前验证数据完整性，防止篡改

### 2. 投票快照机制
- 在提案激活时记录快照区块
- 基于快照时的权重计算投票（Token: ERC20Votes.getPastVotes, Reputation: 合约快照），防止操纵

### 3. 权限控制
- 只有授权执行者可以激活和执行提案
- 只有 DAO 合约可以调用投票回调、快照记录
- 多重签名和时间锁机制

### 4. 资金安全
- 提案执行失败时自动回滚资金
- 紧急提取机制
- 资金限额控制
- 目标合约和 setter 函数选择器白名单

### 5. 合约寻址安全
- 所有合约寻址均通过 Registry
- Registry 支持合约白名单校验

## 接口设计

### IBondlyDAO 接口
```solidity
interface IBondlyDAO {
    function isProposalActive(uint256 proposalId) external view returns (bool);
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        address target,
        bytes memory data,
        bytes32 proposalHash,
        uint8 state,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 snapshotBlock,
        uint256 votingDeadline,
        uint256 executionTime
    );
    function getProposalSnapshotBlock(uint256 proposalId) external view returns (uint256);
    function getProposalVotingDeadline(uint256 proposalId) external view returns (uint256);
    function onVote(uint256 proposalId, address voter, bool support, uint256 weight) external;
}
```

### IBondlyVoting 接口
```solidity
interface IBondlyVoting {
    function vote(uint256 proposalId, bool support) external;
    function startVoting(uint256 proposalId, uint256 snapshotBlock, uint256 votingDeadline) external;
    function endVoting(uint256 proposalId) external;
    function getVotingWeightAtSnapshot(address user, uint256 proposalId) external view returns (uint256);
    function getCurrentVotingWeight(address user) external view returns (uint256);
    function getSnapshotWeight(address user, uint256 proposalId) external view returns (uint256);
    function hasUserVoted(address user, uint256 proposalId) external view returns (bool);
    function getVoteStats(uint256 proposalId) external view returns (uint256 yesVotes, uint256 noVotes, bool passed);
    function getUserVote(address user, uint256 proposalId) external view returns (bool hasVoted_, uint256 weight);
    function getProposalVotingInfo(uint256 proposalId) external view returns (uint256 snapshotBlock, uint256 votingDeadline, bool isActive, bool votingEnded);
    function updateDAOContract(address newDAOContract) external;
    function setWeightType(WeightType newType) external;
    function updateWeightConfig(uint256 tokenPercent, uint256 repPercent) external;
    function pause(string memory reason) external;
    function unpause() external;
    function getVotingWeightType() external view returns (WeightType);
    function resetProposalVotes(uint256 proposalId) external;
    function getContractInfo() external view returns (address daoAddress, uint8 currentWeightType, address tokenAddress, address reputationAddress);
    function recordReputationSnapshot(uint256 proposalId, address user, uint256 reputation) external;
    function recordReputationSnapshots(uint256 proposalId, address[] calldata voters) external;
}
```

### IBondlyTreasury 接口
```solidity
interface IBondlyTreasury {
    function executeProposal(uint256 proposalId, address target, uint256 amount, bytes calldata data) external;
    function executeParameterChange(uint256 proposalId, address target, bytes calldata data) external;
    function emergencyWithdraw(address recipient, uint256 amount, string calldata reason) external;
    function withdrawToken(address token, address recipient, uint256 amount) external;
    function getFundsStatus() external view returns (uint256 total, uint256 available, uint256 locked);
    function isProposalExecuted(uint256 proposalId) external view returns (bool);
    function isAuthorizedSpender(address spender) external view returns (bool);
    function updateDAOContract(address newDAOContract) external;
    function setAuthorizedSpender(address spender, bool authorized) external;
    function updateFundsParameters(uint256 _minProposalAmount, uint256 _maxProposalAmount) external;
    function getContractInfo() external view returns (address daoAddress, uint256 totalFunds_, uint256 availableFunds_, uint256 minAmount, uint256 maxAmount);
    function setAllowedSetter(bytes4 functionSelector, bool allowed) external;
    function setAllowedSetters(bytes4[] calldata functionSelectors, bool allowed) external;
    function isAllowedSetter(bytes4 functionSelector) external view returns (bool);
}
```

## 部署和配置

### 部署顺序
1. 部署 BondlyRegistry
2. 部署 BondlyToken 和 ReputationVault
3. 部署 BondlyDAO、BondlyVoting、BondlyTreasury
4. 配置合约间关系
5. 注册合约到 Registry
6. 设置授权执行者

### 配置参数
- **最小提案押金**: 100 BOND
- **最小投票期**: 3 天
- **最大投票期**: 7 天
- **最小提案金额**: 1 BOND
- **最大提案金额**: 100,000 BOND

## 测试覆盖

### 单元测试
- 合约部署和配置验证
- 提案生命周期测试
- 投票机制测试（快照权重、重复投票、快照区块）
- 声誉投票测试（快照存储与读取）
- 资金库功能测试（白名单、setter 校验）
- 权限控制测试
- 提案完整性验证
- try/catch revert reason 事件链上验证

### 集成测试
- 完整治理流程测试
- 合约间交互测试
- 边界条件测试
- 异常情况处理

## 扩展性设计

### 1. 模块化架构
- 合约职责分离，便于升级和维护
- 接口标准化，支持合约替换

### 2. 参数化配置
- 治理参数可调整
- 支持不同权重类型
- 灵活的资金管理策略

### 3. 事件系统
- 完整的事件记录
- 便于前端集成和监控
- 支持链下数据分析

## 总结

Bondly 治理系统采用模块化、安全、可扩展的设计，提供了完整的 DAO 治理功能。通过严格的权限控制、投票快照机制和提案完整性保护，确保治理过程的安全性和公平性。系统支持基于代币和声誉的投票权重，满足不同场景的需求。

# BondlyDAOUpgradeable

BondlyDAOUpgradeable 是 Bondly 平台的核心治理合约，基于 OpenZeppelin UUPS 可升级标准，支持提案、投票、执行、权限管理、合约注册表集成等功能。

## 合约特性 Features

- **UUPS 可升级（Upgradeable, UUPS）**：支持合约逻辑升级，数据不变，升级权限由 onlyOwner 控制。
- **提案治理**：支持提案创建、激活、投票、执行、失败等全流程。
- **多合约集成**：通过 Registry 动态集成 Voting、Treasury、Reputation 等模块。
- **权限管理**：支持 onlyOwner、onlyAuthorizedExecutor、onlyVotingContract 等多级权限。
- **暂停机制**：紧急情况下可暂停所有治理操作。
- **事件丰富**：全流程事件追踪，便于前端和链上分析。

---

## 初始化 Initialization

```solidity
function initialize(address initialOwner, address registryAddress) public initializer
```
- 仅可调用一次（UUPS 标准）。
- 设置初始 owner。
- 绑定 Registry 地址。
- 初始化治理参数（押金、投票期等）。

---

## 主要结构体 Structs

- `Proposal`：提案结构，包含 id、proposer、title、description、target、data、proposalHash、state、yesVotes、noVotes、snapshotBlock、votingDeadline、executionTime。

---

## 主要事件 Events

- `ProposalCreated(uint256 id, address proposer, string title, address target, bytes data, bytes32 proposalHash)`
- `ProposalActivated(uint256 id, uint256 snapshotBlock, uint256 votingDeadline)`
- `ProposalExecuted(uint256 id, bool success, uint256 executionTime)`
- `ProposalFailed(uint256 id)`
- `ProposalVoted(uint256 id, address voter, bool support, uint256 weight)`
- `VotingContractUpdated(address oldVoting, address newVoting)`
- `TreasuryContractUpdated(address oldTreasury, address newTreasury)`
- `ProposalFailedWithReason(uint256 proposalId, string reason)`
- `ContractPaused(address account, string reason)`
- `ContractUnpaused(address account)`

---

## 主要函数 Functions

### 提案治理 Proposal Management
- `createProposal(string title, string description, address target, bytes data, uint256 votingPeriod)`
- `activateProposal(uint256 proposalId, uint256 votingPeriod)`
- `executeProposal(uint256 proposalId)`
- `onVote(uint256 proposalId, address voter, bool support, uint256 weight)`
- `getProposal(uint256 proposalId)`
- `getUserProposals(address user)`
- `canExecute(uint256 proposalId)`
- `getVoteResult(uint256 proposalId)`
- `verifyProposalIntegrity(uint256 proposalId)`

### 合约集成与管理
- `updateVotingContract(address newVotingContract)`
- `updateTreasuryContract(address newTreasuryContract)`
- `setAuthorizedExecutor(address executor, bool authorized)`
- `updateGovernanceParameters(uint256 minDeposit, uint256 minVoting, uint256 maxVoting)`
- `pause(string reason)`
- `unpause()`
- `withdrawETH(uint256 amount)`

### UUPS 升级
- `_authorizeUpgrade(address newImplementation)`：仅 owner 可升级。

---

## 升级说明 Upgradeability

- 本合约采用 UUPS 升级模式，需通过 Proxy 部署。
- 升级权限由 onlyOwner 控制，建议 owner 为多签或 DAO。
- 升级流程：部署新实现合约 → 通过 Proxy 调用 upgradeTo → Registry 记录新版本。

---

## 典型用法 Usage

1. 通过 Hardhat + OpenZeppelin Upgrades 插件部署 UUPS Proxy。
2. 初始化时传入初始 owner 和 Registry 地址。
3. 通过 Registry 管理多版本 Proxy 地址。
4. 通过权限安全管理提案、投票、执行、升级。

---

## 重要安全提示 Security Notes

- 升级权限建议交由多签或 DAO。
- 所有敏感操作均有权限控制。
- 合约升级前请充分测试和审计。

---

## English Summary

BondlyDAOUpgradeable is an upgradable (UUPS) governance contract for the Bondly platform, supporting proposal lifecycle, voting, execution, registry integration, and role-based access control. All upgrade logic is protected by onlyOwner. Use with a proxy and manage versions via BondlyRegistry. 