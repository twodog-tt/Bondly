// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 RewardDistributor 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title ReputationVault 接口
 * @dev 仅包含 RewardDistributor 需要的最小接口
 */
interface IReputationVault {
    function getReputation(address user) external view returns (uint256);
}

/**
 * @title RewardDistributor
 * @dev 按用户声誉分数快照周期性分配 BOND Token 奖励
 *
 * 功能特性：
 * - 项目方可注入奖励资金
 * - 每轮奖励可快照用户声誉分布
 * - 用户按声誉占比领取奖励，防止重复领取
 * - 所有合约地址通过 BondlyRegistry 动态获取
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 * - 快照状态检查和最小间隔
 *
 * @notice 适用于 Web3 平台声誉激励与周期性奖励分配
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract RewardDistributor is AccessControl, Pausable {
    // 角色定义
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant DEPOSIT_ROLE = keccak256("DEPOSIT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @dev BondlyRegistry 合约地址
    address public registry;

    /// @dev 当前奖励轮次
    uint256 public currentRound;

    /// @dev 每轮奖励池金额
    mapping(uint256 => uint256) public rewardPool;

    /// @dev 每轮所有快照用户
    mapping(uint256 => address[]) public roundUsers;

    /// @dev 每轮每用户的声誉快照
    mapping(uint256 => mapping(address => uint256)) public roundReputation;

    /// @dev 每轮总声誉快照
    mapping(uint256 => uint256) public roundTotalReputation;

    /// @dev 每轮每用户是否已领取奖励
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    /// @dev 每轮是否已快照
    mapping(uint256 => bool) public snapshotTaken;
    
    /// @dev 最小快照间隔（秒）
    uint256 public minSnapshotInterval = 1 days;
    
    /// @dev 上次快照时间
    uint256 public lastSnapshotTime;

    /**
     * @dev 快照事件
     * @param round 奖励轮次
     * @param totalReputation 总声誉
     * @param userCount 快照用户数
     */
    event Snapshot(uint256 indexed round, uint256 totalReputation, uint256 userCount);

    /**
     * @dev 奖励注入事件
     * @param round 奖励轮次
     * @param amount 注入金额
     */
    event RewardDeposited(uint256 indexed round, uint256 amount);

    /**
     * @dev 用户领取奖励事件
     * @param round 奖励轮次
     * @param user 用户地址
     * @param amount 领取金额
     */
    event RewardClaimed(uint256 indexed round, address indexed user, uint256 amount);
    
    /**
     * @dev 快照间隔更新事件
     * @param oldInterval 旧间隔
     * @param newInterval 新间隔
     */
    event SnapshotIntervalUpdated(uint256 oldInterval, uint256 newInterval);
    
    /**
     * @dev 合约暂停事件
     * @param account 暂停操作的账户
     * @param reason 暂停原因
     */
    event ContractPaused(address indexed account, string reason);
    
    /**
     * @dev 合约恢复事件
     * @param account 恢复操作的账户
     */
    event ContractUnpaused(address indexed account);
    
    /**
     * @dev 紧急提取事件
     * @param token 代币地址
     * @param to 接收地址
     * @param amount 提取金额
     */
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    /**
     * @dev 构造函数
     * @param registryAddress BondlyRegistry 合约地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address registryAddress, address initialOwner) {
        registry = registryAddress;
        
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SNAPSHOT_ROLE, initialOwner);
        _grantRole(DEPOSIT_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
    }

    /**
     * @dev 项目方发起新一轮奖励快照，记录所有用户声誉分布（需要 SNAPSHOT_ROLE）
     * @param users 需要快照的用户地址数组（由前端/项目方传入活跃用户列表）
     *
     * @notice 只有 SNAPSHOT_ROLE 可调用
     * @notice 声誉数据从 ReputationVault 获取
     * @notice 防止重复快照和过快快照
     */
    function snapshot(address[] calldata users) external onlyRole(SNAPSHOT_ROLE) whenNotPaused {
        require(users.length > 0, "No users");
        require(block.timestamp >= lastSnapshotTime + minSnapshotInterval, "Too frequent snapshot");
        require(!snapshotTaken[currentRound + 1], "Snapshot already taken");
        
        currentRound++;
        uint256 total = 0;
        address reputationVault = IBondlyRegistry(registry).getContractAddress("REPUTATION_VAULT");
        require(reputationVault != address(0), "ReputationVault not found");
        
        for (uint256 i = 0; i < users.length; i++) {
            uint256 rep = IReputationVault(reputationVault).getReputation(users[i]);
            roundReputation[currentRound][users[i]] = rep;
            total += rep;
        }
        roundUsers[currentRound] = users;
        roundTotalReputation[currentRound] = total;
        snapshotTaken[currentRound] = true;
        lastSnapshotTime = block.timestamp;
        
        emit Snapshot(currentRound, total, users.length);
    }

    /**
     * @dev 项目方为当前轮注入奖励资金（BOND Token）（需要 DEPOSIT_ROLE）
     * @param amount 注入金额
     *
     * @notice 需要提前 approve 足够的 BOND 给本合约
     */
    function depositReward(uint256 amount) external onlyRole(DEPOSIT_ROLE) whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(currentRound > 0, "No active round");
        require(snapshotTaken[currentRound], "Snapshot not taken");
        
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        require(bondToken != address(0), "BondlyToken not found");
        require(IERC20(bondToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rewardPool[currentRound] += amount;
        emit RewardDeposited(currentRound, amount);
    }

    /**
     * @dev 用户领取当前轮奖励，按声誉占比分配
     */
    function claimReward() external whenNotPaused {
        uint256 round = currentRound;
        require(round > 0, "No round");
        require(snapshotTaken[round], "Snapshot not taken");
        require(!hasClaimed[round][msg.sender], "Already claimed");
        uint256 userRep = roundReputation[round][msg.sender];
        require(userRep > 0, "No reputation");
        uint256 totalRep = roundTotalReputation[round];
        require(totalRep > 0, "No total reputation");
        uint256 pool = rewardPool[round];
        require(pool > 0, "No reward pool");
        uint256 amount = (pool * userRep) / totalRep;
        require(amount > 0, "Nothing to claim");
        hasClaimed[round][msg.sender] = true;
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        require(IERC20(bondToken).transfer(msg.sender, amount), "Transfer failed");
        emit RewardClaimed(round, msg.sender, amount);
    }

    /**
     * @dev 查询当前轮用户可领取奖励
     * @param user 用户地址
     * @return 可领取奖励金额
     */
    function getClaimable(address user) external view returns (uint256) {
        uint256 round = currentRound;
        if (round == 0 || !snapshotTaken[round] || hasClaimed[round][user]) return 0;
        uint256 userRep = roundReputation[round][user];
        uint256 totalRep = roundTotalReputation[round];
        uint256 pool = rewardPool[round];
        if (userRep == 0 || totalRep == 0 || pool == 0) return 0;
        return (pool * userRep) / totalRep;
    }
    
    /**
     * @dev 更新最小快照间隔（需要管理员权限）
     * @param newInterval 新的最小间隔（秒）
     */
    function setMinSnapshotInterval(uint256 newInterval) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldInterval = minSnapshotInterval;
        minSnapshotInterval = newInterval;
        emit SnapshotIntervalUpdated(oldInterval, newInterval);
    }
    
    /**
     * @dev 暂停合约（需要 PAUSER_ROLE）
     * @param reason 暂停原因
     */
    function pause(string memory reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, reason);
    }
    
    /**
     * @dev 恢复合约（需要 PAUSER_ROLE）
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev 紧急提取合约中的代币（仅管理员）
     * @param token 代币地址
     * @param to 接收地址
     * @param amount 提取金额
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(IERC20(token).transfer(to, amount), "Transfer failed");
        emit EmergencyWithdraw(token, to, amount);
    }
    
    /**
     * @dev 获取当前轮快照信息
     * @return round 当前轮次
     * @return totalReputation 总声誉
     * @return userCount 用户数量
     * @return rewardPool_ 奖励池金额
     * @return snapshotTaken_ 是否已快照
     */
    function getCurrentRoundInfo() external view returns (
        uint256 round,
        uint256 totalReputation,
        uint256 userCount,
        uint256 rewardPool_,
        bool snapshotTaken_
    ) {
        round = currentRound;
        if (round > 0) {
            totalReputation = roundTotalReputation[round];
            userCount = roundUsers[round].length;
            rewardPool_ = rewardPool[round];
            snapshotTaken_ = snapshotTaken[round];
        }
    }
} 