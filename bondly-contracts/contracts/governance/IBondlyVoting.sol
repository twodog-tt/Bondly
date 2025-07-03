// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBondlyVoting
 * @dev Bondly Voting 合约接口定义
 * @author Bondly Team
 */
interface IBondlyVoting {
    
    enum WeightType { Token, Reputation, Mixed }
    
    /**
     * @dev 用户投票
     * @param proposalId 提案ID
     * @param support 是否支持（true=赞成，false=反对）
     */
    function vote(uint256 proposalId, bool support) external;
    
    /**
     * @dev 开始投票（由 DAO 合约调用）
     * @param proposalId 提案ID
     * @param snapshotBlock 快照区块
     * @param votingDeadline 投票截止时间
     */
    function startVoting(uint256 proposalId, uint256 snapshotBlock, uint256 votingDeadline) external;
    
    /**
     * @dev 结束投票（由 DAO 合约调用）
     * @param proposalId 提案ID
     */
    function endVoting(uint256 proposalId) external;
    
    /**
     * @dev 获取用户投票权重（基于快照）
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getVotingWeightAtSnapshot(address user, uint256 proposalId) external view returns (uint256);
    
    /**
     * @dev 获取用户当前投票权重（实时）
     * @param user 用户地址
     */
    function getCurrentVotingWeight(address user) external view returns (uint256);
    
    /**
     * @dev 获取用户快照权重
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getSnapshotWeight(address user, uint256 proposalId) external view returns (uint256);
    
    /**
     * @dev 检查用户是否已投票
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function hasUserVoted(address user, uint256 proposalId) external view returns (bool);
    
    /**
     * @dev 获取提案投票统计
     * @param proposalId 提案ID
     */
    function getVoteStats(uint256 proposalId) external view returns (uint256 yesVotes, uint256 noVotes, bool passed);
    
    /**
     * @dev 获取用户对提案的投票详情
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getUserVote(address user, uint256 proposalId) external view returns (bool hasVoted_, uint256 weight);
    
    /**
     * @dev 获取提案投票信息
     * @param proposalId 提案ID
     */
    function getProposalVotingInfo(uint256 proposalId) external view returns (
        uint256 snapshotBlock,
        uint256 votingDeadline,
        bool isActive,
        bool votingEnded
    );
    
    /**
     * @dev 更新 DAO 合约地址
     * @param newDAOContract 新的 DAO 合约地址
     */
    function updateDAOContract(address newDAOContract) external;
    
    /**
     * @dev 更新权重类型
     * @param newWeightType 新的权重类型
     */
    function updateWeightType(uint8 newWeightType) external;
    
    /**
     * @dev 重置提案投票数据（紧急情况使用）
     * @param proposalId 提案ID
     */
    function resetProposalVotes(uint256 proposalId) external;
    
    /**
     * @dev 获取合约信息
     */
    function getContractInfo() external view returns (
        address daoAddress,
        uint8 currentWeightType,
        address tokenAddress,
        address reputationAddress
    );
    
    /**
     * @dev 记录用户声誉快照
     * @param proposalId 提案ID
     * @param user 用户地址
     * @param reputation 声誉值
     */
    function recordReputationSnapshot(uint256 proposalId, address user, uint256 reputation) external;
    
    /**
     * @dev 记录多个用户声誉快照
     * @param proposalId 提案ID
     * @param users 用户地址数组
     * @param reputations 声誉值数组
     */
    function recordReputationSnapshots(uint256 proposalId, address[] calldata users, uint256[] calldata reputations) external;
    
    /**
     * @dev 设置权重类型
     * @param newType 新的权重类型
     */
    function setWeightType(WeightType newType) external;
} 