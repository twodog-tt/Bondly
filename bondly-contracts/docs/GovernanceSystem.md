# Bondly 治理系统设计文档

## 概述

Bondly 治理系统是一个去中心化的自治组织（DAO）系统，由三个核心合约组成：

1. **BondlyDAO** - 提案管理合约
2. **BondlyVoting** - 投票机制合约  
3. **BondlyTreasury** - 资金管理合约

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BondlyDAO     │    │  BondlyVoting   │    │ BondlyTreasury  │
│                 │    │                 │    │                 │
│ • 提案管理      │◄──►│ • 投票机制      │    │ • 资金管理      │
│ • 状态流转      │    │ • 权重计算      │    │ • 提案执行      │
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

**主要功能：**
- `createProposal()` - 创建新提案
- `activateProposal()` - 激活提案开始投票
- `executeProposal()` - 执行通过的提案
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
- 投票权重计算（基于代币余额或声誉分数）
- 投票快照和防操纵机制

**主要功能：**
- `vote()` - 用户投票
- `startVoting()` - 开始投票（由 DAO 调用）
- `endVoting()` - 结束投票（由 DAO 调用）
- `getVotingWeightAtSnapshot()` - 获取快照权重

**权重类型：**
- `Token` (0) - 基于 ERC20 代币余额
- `Reputation` (1) - 基于声誉分数

### 3. BondlyTreasury 合约

**功能职责：**
- 资金管理和安全控制
- 提案资金执行
- 紧急资金提取

**主要功能：**
- `executeProposal()` - 执行资金提案
- `emergencyWithdraw()` - 紧急提取
- `getFundsStatus()` - 获取资金状态
- `updateFundsParameters()` - 更新资金参数

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
通知 BondlyVoting 开始投票
```

### 3. 投票阶段
```
用户 → BondlyVoting.vote()
     ↓
检查投票资格和权重
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
执行提案操作
           ↓
更新提案状态（Executed/Failed）
```

## 安全机制

### 1. 提案完整性保护
- 使用 `proposalHash` 字段存储提案数据的哈希值
- 执行前验证数据完整性，防止篡改

### 2. 投票快照机制
- 在提案激活时记录快照区块
- 基于快照时的权重计算投票，防止操纵

### 3. 权限控制
- 只有授权执行者可以激活和执行提案
- 只有 DAO 合约可以调用投票回调
- 多重签名和时间锁机制

### 4. 资金安全
- 提案执行失败时自动回滚资金
- 紧急提取机制
- 资金限额控制

## 接口设计

### IBondlyDAO 接口
```solidity
interface IBondlyDAO {
    enum ProposalState { Pending, Active, Executed, Failed }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        address target;
        bytes data;
        bytes32 proposalHash;
        ProposalState state;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 snapshotBlock;
        uint256 votingDeadline;
        uint256 executionTime;
    }
    
    function isProposalActive(uint256 proposalId) external view returns (bool);
    function getProposal(uint256 proposalId) external view returns (Proposal memory);
    function getProposalSnapshotBlock(uint256 proposalId) external view returns (uint256);
    function getProposalVotingDeadline(uint256 proposalId) external view returns (uint256);
    function onVote(uint256 proposalId, address voter, bool support, uint256 weight) external;
}
```

### IBondlyVoting 接口
```solidity
interface IBondlyVoting {
    enum WeightType { Token, Reputation }
    
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
    function updateWeightType(WeightType newWeightType) external;
    function resetProposalVotes(uint256 proposalId) external;
    function getContractInfo() external view returns (address daoAddress, WeightType currentWeightType, address tokenAddress, address reputationAddress);
}
```

### IBondlyTreasury 接口
```solidity
interface IBondlyTreasury {
    function executeProposal(uint256 proposalId, address target, uint256 amount, bytes calldata data) external;
    function emergencyWithdraw(address recipient, uint256 amount, string calldata reason) external;
    function withdrawToken(address token, address recipient, uint256 amount) external;
    function getFundsStatus() external view returns (uint256 total, uint256 available, uint256 locked);
    function isProposalExecuted(uint256 proposalId) external view returns (bool);
    function isAuthorizedSpender(address spender) external view returns (bool);
    function updateDAOContract(address newDAOContract) external;
    function setAuthorizedSpender(address spender, bool authorized) external;
    function updateFundsParameters(uint256 _minProposalAmount, uint256 _maxProposalAmount) external;
    function getContractInfo() external view returns (address daoAddress, uint256 totalFunds_, uint256 availableFunds_, uint256 minAmount, uint256 maxAmount);
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
- 投票机制测试
- 声誉投票测试
- 资金库功能测试
- 权限控制测试
- 提案完整性验证

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