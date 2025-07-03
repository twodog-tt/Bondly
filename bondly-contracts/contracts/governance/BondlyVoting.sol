// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../registry/IBondlyRegistry.sol";
import "../reputation/IReputationVault.sol";
import "./IBondlyDAO.sol";
import "./IBondlyVoting.sol";

// 权重策略接口，需在合约外部定义
interface IVotingWeightStrategy {
    function getVotingWeightAt(address voter, uint256 proposalId, uint256 snapshotBlock) external view returns (uint256);
    function getTokenAt(address voter, uint256 snapshotBlock) external view returns (uint256);
    function getReputationAt(address voter, uint256 snapshotBlock) external view returns (uint256);
}

/**
 * @title BondlyVoting
 * @dev Bondly 平台的投票合约，为提案提供投票功能，支持权重快照
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract BondlyVoting is IBondlyVoting, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    
    // ============ 状态变量 ============
    
    IBondlyRegistry public registry;
    IBondlyVoting.WeightType public weightType;
    IBondlyDAO public daoContract;
    
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
    /**
     * @dev 混合权重快照结构体
     * @param tokenWeight 该用户在快照时刻的代币权重
     * @param reputationWeight 该用户在快照时刻的声誉权重
     */
    struct MixedSnapshot {
        uint256 tokenWeight;        ///< @notice 代币权重 (Token weight at snapshot)
        uint256 reputationWeight;   ///< @notice 声誉权重 (Reputation weight at snapshot)
    }
    mapping(uint256 => mapping(address => MixedSnapshot)) public mixedSnapshots;
    
    /**
     * @dev 混合权重配置结构体
     * @param tokenWeight 代币权重百分比（0~100）
     * @param reputationWeight 声誉权重百分比（0~100）
     */
    struct WeightConfig {
        uint256 tokenWeight;        ///< @notice 代币权重百分比 (0~100)
        uint256 reputationWeight;   ///< @notice 声誉权重百分比 (0~100)
    }
    WeightConfig public weightConfig = WeightConfig(50, 50);
    
    /// @dev Hybrid 权重中 token 占比（0~100），默认 50
    uint256 public tokenWeightRatio = 50;
    
    /// @dev 权重策略合约地址
    address public weightStrategy;

    /// @dev 设置权重策略（仅 owner 或 DAO）
    function setWeightStrategy(address strategy) external {
        require(msg.sender == owner() || msg.sender == address(daoContract), "Not authorized");
        require(strategy != address(0), "Zero address");
        weightStrategy = strategy;
    }
    
    // ============ 事件 ============
    
    /**
     * @dev 投票事件
     * @param proposalId 提案ID
     * @param voter 投票者地址
     * @param support 是否支持（true=赞成，false=反对）
     * @param weight 投票权重
     */
    event Voted(
        uint256 indexed proposalId, 
        address indexed voter, 
        bool support, 
        uint256 weight
    );
    
    /**
     * @dev 投票开始事件
     * @param proposalId 提案ID
     * @param snapshotBlock 快照区块号
     * @param votingDeadline 投票截止时间戳
     */
    event VotingStarted(uint256 indexed proposalId, uint256 snapshotBlock, uint256 votingDeadline);
    /**
     * @dev 投票结束事件
     * @param proposalId 提案ID
     * @param yesVotes 赞成票数
     * @param noVotes 反对票数
     * @param passed 是否通过
     */
    event VotingEnded(uint256 indexed proposalId, uint256 yesVotes, uint256 noVotes, bool passed);
    
    /**
     * @dev 权重类型变更事件
     * @param oldType 旧权重类型
     * @param newType 新权重类型
     */
    event WeightTypeUpdated(IBondlyVoting.WeightType oldType, IBondlyVoting.WeightType newType);
    /**
     * @dev 权重快照记录事件
     * @param proposalId 提案ID
     * @param user 用户地址
     * @param weight 快照权重
     */
    event SnapshotRecorded(uint256 indexed proposalId, address indexed user, uint256 weight);
    
    /**
     * @dev 混合权重配置变更事件
     * @param tokenPercent 新的代币权重百分比
     * @param repPercent 新的声誉权重百分比
     */
    event WeightConfigUpdated(uint256 tokenPercent, uint256 repPercent);
    
    /**
     * @dev 合约暂停事件
     * @param account 操作账户
     * @param reason 暂停原因
     */
    event ContractPaused(address indexed account, string reason);
    /**
     * @dev 合约恢复事件
     * @param account 操作账户
     */
    event ContractUnpaused(address indexed account);
    
    /**
     * @dev DAO 合约地址变更事件
     * @param oldDAO 旧 DAO 地址
     * @param newDAO 新 DAO 地址
     */
    event DAOContractUpdated(address indexed oldDAO, address indexed newDAO);
    
    // ============ 修饰符 ============
    
    /// @dev 仅 Registry 查询到的 DAO 合约可调用
    modifier registryDAOOnly() {
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(msg.sender == daoAddr, "Voting: Only DAO contract");
        _;
    }

    modifier proposalActive(uint256 proposalId) {
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(IBondlyDAO(daoAddr).isProposalActive(proposalId), "Voting: Proposal not active");
        _;
    }
    
    modifier votingNotEnded(uint256 proposalId) {
        require(block.timestamp <= proposalVotingDeadlines[proposalId], "Voting: Voting period ended");
        _;
    }
    
    // ============ 构造函数 ============
    
    /**
     * @dev 初始化函数，替代构造函数
     * @param initialOwner 初始所有者
     * @param registryAddress BondlyRegistry 合约地址
     */
    function initialize(address initialOwner, address registryAddress) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        require(registryAddress != address(0), "Invalid registry");
        registry = IBondlyRegistry(registryAddress);
        transferOwnership(initialOwner);
        daoContract = IBondlyDAO(address(0));
    }
    
    // ============ 核心功能 ============
    
    /**
     * @dev 用户投票
     * @param proposalId 提案ID
     * @param support 是否支持（true=赞成，false=反对）
     */
    function vote(uint256 proposalId, bool support) external override nonReentrant proposalActive(proposalId) votingNotEnded(proposalId) whenNotPaused {
        require(!hasVoted[proposalId][msg.sender], "Voting: Already voted");
        require(weightStrategy != address(0), "Voting: No strategy");
        uint256 snapshotBlock = proposalSnapshotBlocks[proposalId];
        uint256 weight = IVotingWeightStrategy(weightStrategy).getVotingWeightAt(msg.sender, proposalId, snapshotBlock);
        require(weight > 0, "Voting: No voting power");
        // 门槛校验（可根据策略类型扩展）
        if (minTokenThreshold > 0 || minReputationThreshold > 0) {
            // 假设策略合约有 getTokenAt/getReputationAt
            uint256 tokenBal = 0;
            uint256 repBal = 0;
            try IVotingWeightStrategy(weightStrategy).getTokenAt(msg.sender, snapshotBlock) returns (uint256 t) { tokenBal = t; } catch {}
            try IVotingWeightStrategy(weightStrategy).getReputationAt(msg.sender, snapshotBlock) returns (uint256 r) { repBal = r; } catch {}
            require(tokenBal >= minTokenThreshold || repBal >= minReputationThreshold, "Voting: Below threshold");
        }
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
    function startVoting(uint256 proposalId, uint256 snapshotBlock, uint256 votingDeadline) external override registryDAOOnly {
        require(registry.isContractRegisteredByAddress(address(daoContract)), "Voting: Target not whitelisted");
        proposalSnapshotBlocks[proposalId] = snapshotBlock;
        proposalVotingDeadlines[proposalId] = votingDeadline;
        if (weightType == IBondlyVoting.WeightType.Token) {
            _recordTokenSnapshot(proposalId, snapshotBlock);
        } else if (weightType == IBondlyVoting.WeightType.Reputation) {
            _recordReputationSnapshot(proposalId);
        } else if (weightType == IBondlyVoting.WeightType.Mixed) {
            _recordTokenSnapshot(proposalId, snapshotBlock);
            _recordReputationSnapshot(proposalId);
            // 记录混合快照
            address token = registry.getContractAddress("BondlyToken", "v1");
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            if (token != address(0)) require(registry.isContractRegisteredByAddress(token), "Voting: Token not whitelisted");
            if (reputationVault != address(0)) require(registry.isContractRegisteredByAddress(reputationVault), "Voting: ReputationVault not whitelisted");
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
    function endVoting(uint256 proposalId) external override registryDAOOnly {
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
        if (weightType == IBondlyVoting.WeightType.Token) {
            address token = registry.getContractAddress("BondlyToken", "v1");
            if (token == address(0)) return 0;
            require(registry.isContractRegisteredByAddress(token), "Voting: Token not whitelisted");
            try ERC20Votes(token).getPastVotes(user, snapshotBlock) returns (uint256 balance) {
                return balance;
            } catch {
                try IERC20(token).balanceOf(user) returns (uint256 balance) {
                    return balance;
                } catch {
                    return 0;
                }
            }
        } else if (weightType == IBondlyVoting.WeightType.Reputation) {
            uint256 snap = reputationSnapshots[proposalId][user];
            if (snap != 0) {
                return snap;
            } else {
                address reputationVault = registry.getContractAddress("ReputationVault", "v1");
                if (reputationVault == address(0)) return 0;
                require(registry.isContractRegisteredByAddress(reputationVault), "Voting: ReputationVault not whitelisted");
                try IReputationVault(reputationVault).getReputation(user) returns (uint256 rep) {
                    return rep;
                } catch {
                    return 0;
                }
            }
        } else if (weightType == IBondlyVoting.WeightType.Mixed) {
            address token = registry.getContractAddress("BondlyToken", "v1");
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            uint256 tokenAmount = 0;
            uint256 reputation = 0;
            if (token != address(0)) {
                try ERC20Votes(token).getPastVotes(user, snapshotBlock) returns (uint256 balance) { tokenAmount = balance; }
                catch { try IERC20(token).balanceOf(user) returns (uint256 balance) { tokenAmount = balance; } catch {} }
            }
            if (reputationVault != address(0)) {
                try IReputationVault(reputationVault).getReputation(user) returns (uint256 rep) { reputation = rep; } catch {}
            }
            return (tokenAmount * tokenWeightRatio + reputation * (100 - tokenWeightRatio)) / 100;
        }
        return 0;
    }
    
    /**
     * @dev 获取用户当前投票权重（实时）
     * @param user 用户地址
     */
    function getCurrentVotingWeight(address user) external view override returns (uint256) {
        if (weightType == IBondlyVoting.WeightType.Token) {
            address token = registry.getContractAddress("BondlyToken", "v1");
            if (token == address(0)) return 0;
            require(registry.isContractRegisteredByAddress(token), "Voting: Token not whitelisted");
            return IERC20(token).balanceOf(user);
        } else if (weightType == IBondlyVoting.WeightType.Reputation) {
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            if (reputationVault == address(0)) return 0;
            require(registry.isContractRegisteredByAddress(reputationVault), "Voting: ReputationVault not whitelisted");
            return IReputationVault(reputationVault).getReputation(user);
        } else if (weightType == IBondlyVoting.WeightType.Mixed) {
            address token = registry.getContractAddress("BondlyToken", "v1");
            address reputationVault = registry.getContractAddress("ReputationVault", "v1");
            uint256 tokenAmount = 0;
            uint256 reputation = 0;
            if (token != address(0)) {
                try IERC20(token).balanceOf(user) returns (uint256 balance) { tokenAmount = balance; } catch {}
            }
            if (reputationVault != address(0)) {
                try IReputationVault(reputationVault).getReputation(user) returns (uint256 rep) { reputation = rep; } catch {}
            }
            return (tokenAmount * tokenWeightRatio + reputation * (100 - tokenWeightRatio)) / 100;
        }
        return 0;
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
     * @param voter 用户地址
     * @param reputation 声誉分数
     */
    function recordReputationSnapshot(uint256 proposalId, address voter, uint256 reputation) external registryDAOOnly {
        reputationSnapshots[proposalId][voter] = reputation;
    }
    
    /**
     * @dev 批量记录声誉快照（由 DAO 合约调用）
     * @param proposalId 提案ID
     * @param users 用户地址数组
     * @param reputations 声誉分数数组
     */
    function recordReputationSnapshots(uint256 proposalId, address[] calldata users, uint256[] calldata reputations) external override registryDAOOnly {
        address reputationVault = registry.getContractAddress("ReputationVault", "v1");
        require(reputationVault != address(0), "Voting: ReputationVault not set");
        require(registry.isContractRegisteredByAddress(reputationVault), "Voting: ReputationVault not whitelisted");
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
        require(registry.isContractRegisteredByAddress(newDAOContract), "Voting: Target not whitelisted");
        address oldDAO = address(daoContract);
        daoContract = IBondlyDAO(newDAOContract);
        emit DAOContractUpdated(oldDAO, newDAOContract);
    }
    
    /**
     * @dev 更新权重类型
     * @param newType 新的权重类型
     */
    function setWeightType(IBondlyVoting.WeightType newType) external registryDAOOnly {
        IBondlyVoting.WeightType oldType = weightType;
        weightType = newType;
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
    
    /**
     * @dev 更新权重配置
     * @param tokenPercent 代币权重百分比
     * @param repPercent 声誉权重百分比
     */
    function updateWeightConfig(uint256 tokenPercent, uint256 repPercent) external registryDAOOnly {
        require(tokenPercent + repPercent == 100, "Voting: Percent sum must be 100");
        weightConfig.tokenWeight = tokenPercent;
        weightConfig.reputationWeight = repPercent;
        emit WeightConfigUpdated(tokenPercent, repPercent);
    }
    
    /**
     * @notice 暂停投票合约
     * @param reason 暂停原因
     * @dev 仅 DAO 合约可调用，暂停后无法投票和快照
     */
    function pause(string memory reason) external registryDAOOnly {
        _pause();
        emit ContractPaused(msg.sender, reason);
    }
    
    /**
     * @notice 恢复投票合约
     * @dev 仅 DAO 合约可调用
     */
    function unpause() external registryDAOOnly {
        _unpause();
        emit ContractUnpaused(msg.sender);
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
    
    /**
     * @notice 获取当前投票权重类型
     * @return 当前权重类型（Token/Reputation/Mixed）
     * @dev Returns the current voting weight type (Token, Reputation, Mixed)
     */
    function getVotingWeightType() external view returns (IBondlyVoting.WeightType) {
        return weightType;
    }
    
    /**
     * @dev 设置 Hybrid 权重中的 token 占比（0~100）
     * @param ratio token 占比
     */
    function setHybridWeightRatio(uint256 ratio) external onlyOwner {
        require(ratio <= 100, "Voting: Ratio must be 0~100");
        tokenWeightRatio = ratio;
    }

    /**
     * @dev 判断是否已记录声誉快照
     */
    function hasReputationSnapshot(uint256 proposalId, address voter) external view returns (bool) {
        return reputationSnapshots[proposalId][voter] != 0;
    }

    // 最小门槛
    uint256 public minTokenThreshold;
    uint256 public minReputationThreshold;

    // 仅 owner 或 DAO 可设置门槛
    function setThresholds(uint256 tokenMin, uint256 repMin) external {
        require(msg.sender == owner() || msg.sender == address(daoContract), "Not authorized");
        minTokenThreshold = tokenMin;
        minReputationThreshold = repMin;
    }

    // 声誉快照查询接口（便于前端）
    function getReputationAt(address user, uint256 snapshotBlock) external view returns (uint256) {
        try IVotingWeightStrategy(weightStrategy).getReputationAt(user, snapshotBlock) returns (uint256 r) { return r; } catch { return 0; }
    }

    function onVote(
        uint256 proposalId, 
        address voter, 
        bool support, 
        uint256 weight
    ) external registryDAOOnly proposalActive(proposalId) {
        // 增强 DAO 地址校验
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(msg.sender == daoAddr, "Voting: Only DAO from registry");
        require(weight > 0, "DAO: Zero voting weight");
        // ... existing code ...
    }

    /// @dev 升级授权，仅允许 DAO 合约
    function _authorizeUpgrade(address newImplementation) internal onlyOwner {
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(msg.sender == daoAddr, "Voting: Only DAO can upgrade");
        // 可选：proxiableUUID/ERC1967 校验
    }

    /// @dev 合约版本号
    function version() public pure returns (string memory) {
        return "1.0.0";
    }

    // 兼容 IBondlyVoting 接口的 updateWeightType
    function updateWeightType(uint8 newWeightType) external registryDAOOnly {
        require(newWeightType <= uint8(IBondlyVoting.WeightType.Mixed), "Invalid weight type");
        IBondlyVoting.WeightType oldType = weightType;
        weightType = IBondlyVoting.WeightType(newWeightType);
        emit WeightTypeUpdated(oldType, weightType);
    }
} 