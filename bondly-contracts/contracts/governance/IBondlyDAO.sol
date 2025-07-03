// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBondlyDAO
 * @dev Bondly DAO 合约接口定义
 * @author Bondly Team
 */
interface IBondlyDAO {
    
    /**
     * @dev 检查提案是否处于活跃状态
     * @param proposalId 提案ID
     * @return 是否活跃
     */
    function isProposalActive(uint256 proposalId) external view returns (bool);
    
    /**
     * @dev 获取提案详情
     * @param proposalId 提案ID
     */
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
    
    /**
     * @dev 获取提案快照区块
     * @param proposalId 提案ID
     * @return 快照区块号
     */
    function getProposalSnapshotBlock(uint256 proposalId) external view returns (uint256);
    
    /**
     * @dev 获取提案投票截止时间
     * @param proposalId 提案ID
     * @return 投票截止时间
     */
    function getProposalVotingDeadline(uint256 proposalId) external view returns (uint256);
    
    /**
     * @dev 投票回调（由 Voting 合约调用）
     * @param proposalId 提案ID
     * @param voter 投票者
     * @param support 是否支持
     * @param weight 投票权重
     */
    function onVote(uint256 proposalId, address voter, bool support, uint256 weight) external;
} 