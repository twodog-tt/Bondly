// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBondlyRegistry.sol";
import "../reputation/interfaces/IReputationVault.sol";
import "./interfaces/IBondlyDAO.sol";
import "./interfaces/IBondlyVoting.sol";

/**
 * @title BondlyVoting
 * @dev Bondly 平台的投票合约，为提案提供投票功能，支持权重快照
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract BondlyVoting is IBondlyVoting, Ownable, ReentrancyGuard {
    
    // ============ 状态枚举 ============
    
    enum WeightType { 
        Token,      // 基于代币余额
        Reputation, // 基于声誉分数
        Mixed       // 混合权重（Token+Reputation）
    }
    
    // ============ 状态变量 ============
    
    IBondlyRegistry public immutable registry;
    IBondlyDAO public daoContract;
    WeightType public weightType;
    
    // proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    // proposalId => voter => weightSnapshot
    mapping(uint256 => mapping(address => uint256)) public voteWeightSnapshot;
    // proposalId => totalYesVotes
    mapping(uint256 => uint256) public totalYesVotes;
    // proposalId => totalNoVotes
    mapping(uint256 => uint256) public totalNoVotes;
    // proposalId => snapshotBlock
    mapping(uint256 => uint256) public proposalSnapshotBlocks;
    // proposalId => votingDeadline
    mapping(uint256 => uint256) public proposalVotingDeadlines;
    
    // 快照存储结构
    // proposalId => user => reputationSnapshot
    mapping(uint256 => mapping(address => uint256)) public reputationSnapshots;
    // proposalId => user => tokenSnapshot
    mapping(uint256 => mapping(address => uint256)) public tokenSnapshots;
    // proposalId => user => MixedSnapshot
    struct MixedSnapshot {
        uint256 tokenWeight;
        uint256 reputationWeight;
    }
    mapping(uint256 => mapping(address => MixedSnapshot)) public mixedSnapshots;
    
    // ============ 事件 ============
    
    event Voted(
        uint256 indexed proposalId, 
        address indexed voter, 
        bool support, 
        uint256 weight
    );
    
    event VotingStarted(uint256 indexed proposalId, uint256 snapshotBlock, uint256 votingDeadline);
    event VotingEnded(uint256 indexed proposalId, uint256 yesVotes, uint256 noVotes, bool passed);
    
    event DAOContractUpdated(address indexed oldDAO, address indexed newDAO);
    event WeightTypeUpdated(WeightType oldType, WeightType newType);
    event SnapshotRecorded(uint256 indexed proposalId, address indexed user, uint256 weight);
    
    // ============ 修饰符 ============
    
    modifier onlyDAOContract() {
        require(msg.sender == address(daoContract), "Voting: Only DAO contract");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(daoContract.isProposalActive(proposalId), "Voting: Proposal not active");
        _;
    }
    
    modifier votingNotEnded(uint256 proposalId) {
        require(block.timestamp <= proposalVotingDeadlines[proposalId], "Voting: Voting period ended");
        _;
    }
    
    // ============ 构造函数 ============
    
    /**
     * @dev 构造函数
     * @param initialOwner 初始所有者
     * @param registryAddress BondlyRegistry 合约地址
     * @param weightType_ 权重类型
     */
    constructor(
        address initialOwner, 
        address registryAddress, 
        WeightType weightType_
    ) Ownable(initialOwner) {
        require(registryAddress != address(0), "Voting: Invalid registry address");
        registry = IBondlyRegistry(registryAddress);
        weightType = weightType_;
    }
    
    // ============ 核心功能 ============
    
    /**
     * @dev 用户投票
     * @param proposalId 提案ID
     * @param support 是否支持（true=赞成，false=反对）
     */
    function vote(uint256 proposalId, bool support) external override nonReentrant proposalActive(proposalId) votingNotEnded(proposalId) {
        require(!hasVoted[proposalId][msg.sender], "Voting: Already voted");
        require(daoContract != IBondlyDAO(address(0)), "Voting: DAO contract not set");
        uint256 weight;
        if (weightType == WeightType.Mixed) {
            MixedSnapshot memory snap = mixedSnapshots[proposalId][msg.sender];
            weight = snap.tokenWeight + snap.reputationWeight;
        } else {
            weight = getVotingWeightAtSnapshot(msg.sender, proposalId);
        }
        require(weight > 0, "Voting: No voting power");
        hasVoted[proposalId][msg.sender] = true;
        voteWeightSnapshot[proposalId][msg.sender] = weight;
        if (support) {
            totalYesVotes[proposalId] += weight;
        } else {
            totalNoVotes[proposalId] += weight;
        }
        daoContract.onVote(proposalId, msg.sender, support, weight);
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev 开始投票（由 DAO 合约调用）
     * @param proposalId 提案ID
     * @param snapshotBlock 快照区块
     * @param votingDeadline 投票截止时间
     */
    function startVoting(uint256 proposalId, uint256 snapshotBlock, uint256 votingDeadline) external override onlyDAOContract {
        proposalSnapshotBlocks[proposalId] = snapshotBlock;
        proposalVotingDeadlines[proposalId] = votingDeadline;
        if (weightType == WeightType.Token) {
            _recordTokenSnapshot(proposalId, snapshotBlock);
        } else if (weightType == WeightType.Reputation) {
            _recordReputationSnapshot(proposalId);
        } else if (weightType == WeightType.Mixed) {
            _recordTokenSnapshot(proposalId, snapshotBlock);
            _recordReputationSnapshot(proposalId);
            // 记录混合快照
            address token = registry.getContractAddress("BondlyToken", "v1");
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            for (uint256 i = 0; i < 50; i++) { // TODO: 替换为实际活跃用户列表
                address user = address(uint160(i+1)); // 占位示例
                uint256 tokenW = 0;
                uint256 repW = 0;
                if (token != address(0)) {
                    try ERC20Votes(token).getPastVotes(user, snapshotBlock) returns (uint256 balance) { tokenW = balance; }
                    catch { try IERC20(token).balanceOf(user) returns (uint256 balance) { tokenW = balance; } catch {} }
                }
                if (reputationVault != address(0)) {
                    try IReputationVault(reputationVault).getReputation(user) returns (uint256 rep) { repW = rep; } catch {}
                }
                mixedSnapshots[proposalId][user] = MixedSnapshot(tokenW, repW);
            }
        }
        emit VotingStarted(proposalId, snapshotBlock, votingDeadline);
    }
    
    /**
     * @dev 结束投票（由 DAO 合约调用）
     * @param proposalId 提案ID
     */
    function endVoting(uint256 proposalId) external override onlyDAOContract {
        uint256 yesVotes = totalYesVotes[proposalId];
        uint256 noVotes = totalNoVotes[proposalId];
        bool passed = yesVotes > noVotes;
        
        emit VotingEnded(proposalId, yesVotes, noVotes, passed);
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取用户投票权重（基于快照）
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getVotingWeightAtSnapshot(address user, uint256 proposalId) public view override returns (uint256) {
        uint256 snapshotBlock = proposalSnapshotBlocks[proposalId];
        if (snapshotBlock == 0) return 0;
        
        if (weightType == WeightType.Token) {
            // 使用 ERC20Votes 的 getPastVotes 获取快照时的代币余额
            address token = registry.getContractAddress("BondlyToken", "v1");
            if (token == address(0)) return 0;
            
            try ERC20Votes(token).getPastVotes(user, snapshotBlock) returns (uint256 balance) {
                return balance;
            } catch {
                // 如果 ERC20Votes 不可用，回退到普通 ERC20
                try IERC20(token).balanceOf(user) returns (uint256 balance) {
                    return balance;
                } catch {
                    return 0;
                }
            }
        } else {
            // 使用声誉快照
            return reputationSnapshots[proposalId][user];
        }
    }
    
    /**
     * @dev 获取用户当前投票权重（实时）
     * @param user 用户地址
     */
    function getCurrentVotingWeight(address user) external view override returns (uint256) {
        if (weightType == WeightType.Token) {
            address token = registry.getContractAddress("BondlyToken", "v1");
            if (token == address(0)) return 0;
            return IERC20(token).balanceOf(user);
        } else {
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            if (reputationVault == address(0)) return 0;
            return IReputationVault(reputationVault).getReputation(user);
        }
    }
    
    /**
     * @dev 获取用户快照权重
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getSnapshotWeight(address user, uint256 proposalId) external view override returns (uint256) {
        return voteWeightSnapshot[proposalId][user];
    }
    
    /**
     * @dev 检查用户是否已投票
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function hasUserVoted(address user, uint256 proposalId) external view override returns (bool) {
        return hasVoted[proposalId][user];
    }
    
    /**
     * @dev 获取提案投票统计
     * @param proposalId 提案ID
     */
    function getVoteStats(uint256 proposalId) external view override returns (uint256 yesVotes, uint256 noVotes, bool passed) {
        yesVotes = totalYesVotes[proposalId];
        noVotes = totalNoVotes[proposalId];
        passed = yesVotes > noVotes;
    }
    
    /**
     * @dev 获取用户对提案的投票详情
     * @param user 用户地址
     * @param proposalId 提案ID
     */
    function getUserVote(address user, uint256 proposalId) external view override returns (bool hasVoted_, uint256 weight) {
        hasVoted_ = hasVoted[proposalId][user];
        weight = voteWeightSnapshot[proposalId][user];
    }
    
    /**
     * @dev 获取提案投票信息
     * @param proposalId 提案ID
     */
    function getProposalVotingInfo(uint256 proposalId) external view override returns (
        uint256 snapshotBlock,
        uint256 votingDeadline,
        bool isActive,
        bool votingEnded
    ) {
        snapshotBlock = proposalSnapshotBlocks[proposalId];
        votingDeadline = proposalVotingDeadlines[proposalId];
        isActive = daoContract.isProposalActive(proposalId);
        votingEnded = block.timestamp > votingDeadline;
    }
    
    // ============ 快照管理函数 ============
    
    /**
     * @dev 记录用户声誉快照（由 DAO 合约调用）
     * @param proposalId 提案ID
     * @param user 用户地址
     * @param reputation 声誉分数
     */
    function recordReputationSnapshot(uint256 proposalId, address user, uint256 reputation) external override onlyDAOContract {
        reputationSnapshots[proposalId][user] = reputation;
        emit SnapshotRecorded(proposalId, user, reputation);
    }
    
    /**
     * @dev 批量记录声誉快照（由 DAO 合约调用）
     * @param proposalId 提案ID
     * @param users 用户地址数组
     * @param reputations 声誉分数数组
     */
    function recordReputationSnapshots(uint256 proposalId, address[] calldata users, uint256[] calldata reputations) external override onlyDAOContract {
        require(users.length == reputations.length, "Voting: Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            reputationSnapshots[proposalId][users[i]] = reputations[i];
            emit SnapshotRecorded(proposalId, users[i], reputations[i]);
        }
    }
    
    /**
     * @dev 获取用户声誉快照
     * @param proposalId 提案ID
     * @param user 用户地址
     */
    function getReputationSnapshot(uint256 proposalId, address user) external view returns (uint256) {
        return reputationSnapshots[proposalId][user];
    }
    
    // ============ 管理函数 ============
    
    /**
     * @dev 更新 DAO 合约地址
     * @param newDAOContract 新的 DAO 合约地址
     */
    function updateDAOContract(address newDAOContract) external override onlyOwner {
        require(newDAOContract != address(0), "Voting: Invalid DAO contract");
        address oldDAO = address(daoContract);
        daoContract = IBondlyDAO(newDAOContract);
        emit DAOContractUpdated(oldDAO, newDAOContract);
    }
    
    /**
     * @dev 更新权重类型
     * @param newWeightType 新的权重类型
     */
    function updateWeightType(uint8 newWeightType) external override onlyOwner {
        WeightType oldType = weightType;
        weightType = WeightType(newWeightType);
        emit WeightTypeUpdated(oldType, weightType);
    }
    
    /**
     * @dev 重置提案投票数据（紧急情况使用）
     * @param proposalId 提案ID
     */
    function resetProposalVotes(uint256 proposalId) external override onlyOwner {
        totalYesVotes[proposalId] = 0;
        totalNoVotes[proposalId] = 0;
    }
    
    /**
     * @dev 获取合约信息
     */
    function getContractInfo() external view override returns (
        address daoAddress,
        uint8 currentWeightType,
        address tokenAddress,
        address reputationAddress
    ) {
        daoAddress = address(daoContract);
        currentWeightType = uint8(weightType);
        tokenAddress = registry.getContractAddress("BondlyToken", "v1");
        reputationAddress = registry.getContractAddress("ReputationVault", "v1");
    }
    
    // ============ 内部函数 ============
    
    // 内部函数：记录 Token 快照
    function _recordTokenSnapshot(uint256 proposalId, uint256 snapshotBlock) internal {
        address token = registry.getContractAddress("BondlyToken", "v1");
        if (token == address(0)) return;
        for (uint256 i = 0; i < 50; i++) { // TODO: 替换为实际活跃用户列表
            address user = address(uint160(i+1)); // 占位示例
            uint256 tokenW = 0;
            try ERC20Votes(token).getPastVotes(user, snapshotBlock) returns (uint256 balance) { tokenW = balance; }
            catch { try IERC20(token).balanceOf(user) returns (uint256 balance) { tokenW = balance; } catch {} }
            tokenSnapshots[proposalId][user] = tokenW;
        }
    }
    // 内部函数：记录 Reputation 快照
    function _recordReputationSnapshot(uint256 proposalId) internal {
        address reputationVault = registry.getContractAddress("ReputationVault", "v1");
        if (reputationVault == address(0)) return;
        for (uint256 i = 0; i < 50; i++) { // TODO: 替换为实际活跃用户列表
            address user = address(uint160(i+1)); // 占位示例
            uint256 repW = 0;
            try IReputationVault(reputationVault).getReputation(user) returns (uint256 rep) { repW = rep; } catch {}
            reputationSnapshots[proposalId][user] = repW;
        }
    }
} 