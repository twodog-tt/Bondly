// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 GeneralStaking 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title GeneralStaking
 * @dev Bondly 平台通用质押合约，支持用户质押 BOND 代币并赚取奖励
 *
 * 功能特性：
 * - 用户可质押任意数量的 BOND 代币
 * - 支持质押和解除质押
 * - 按质押比例分配奖励
 * - 支持奖励领取
 * - 通过 BondlyRegistry 获取 BondlyToken 地址
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 * - 重入攻击防护
 *
 * @notice 适用于 Bondly 平台通用质押激励场景
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract GeneralStaking is AccessControl, Pausable, ReentrancyGuard {
    // 角色定义
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @dev 用户质押信息
    struct UserStake {
        uint256 stakedAmount;    // 质押金额
        uint256 rewardDebt;      // 奖励债务（用于计算应得奖励）
        uint256 lastUpdateTime;  // 最后更新时间
    }

    /// @dev 用户地址 => 质押信息
    mapping(address => UserStake) public userStakes;

    /// @dev 总质押金额
    uint256 public totalStaked;

    /// @dev 累计每份质押的奖励
    uint256 public accRewardPerShare;

    /// @dev 奖励代币地址（BOND）
    address public rewardToken;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /// @dev 奖励发放速率（每秒每份质押的奖励）
    uint256 public rewardRate;

    /// @dev 最后更新时间
    uint256 public lastUpdateTime;

    /// @dev 奖励结束时间
    uint256 public rewardEndTime;

    /**
     * @dev 质押事件
     * @param user 用户地址
     * @param amount 质押金额
     */
    event Staked(address indexed user, uint256 amount);

    /**
     * @dev 解除质押事件
     * @param user 用户地址
     * @param amount 解除质押金额
     */
    event Unstaked(address indexed user, uint256 amount);

    /**
     * @dev 领取奖励事件
     * @param user 用户地址
     * @param amount 领取奖励金额
     */
    event RewardClaimed(address indexed user, uint256 amount);

    /**
     * @dev 奖励添加事件
     * @param amount 添加的奖励金额
     * @param duration 奖励持续时间
     */
    event RewardAdded(uint256 amount, uint256 duration);

    /**
     * @dev 构造函数
     * @param registryAddress BondlyRegistry 合约地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address registryAddress, address initialOwner) {
        registry = registryAddress;
        
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(REWARD_MANAGER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        // 获取 BOND 代币地址
        rewardToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        require(rewardToken != address(0), "BondlyToken not found in registry");
    }

    /**
     * @dev 更新奖励计算
     */
    function _updateReward() internal {
        if (block.timestamp <= lastUpdateTime) {
            return;
        }

        if (totalStaked == 0) {
            lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timePassed = block.timestamp - lastUpdateTime;
        uint256 reward = timePassed * rewardRate;
        accRewardPerShare += (reward * 1e18) / totalStaked;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev 计算用户应得奖励
     * @param user 用户地址
     * @return 应得奖励金额
     */
    function _calculateReward(address user) internal view returns (uint256) {
        UserStake storage userStake = userStakes[user];
        uint256 accRewardPerShareCurrent = accRewardPerShare;
        
        if (totalStaked > 0) {
            uint256 timePassed = block.timestamp - lastUpdateTime;
            uint256 reward = timePassed * rewardRate;
            accRewardPerShareCurrent += (reward * 1e18) / totalStaked;
        }
        
        return (userStake.stakedAmount * accRewardPerShareCurrent) / 1e18 - userStake.rewardDebt;
    }

    /**
     * @dev 质押 BOND 代币
     * @param amount 质押金额
     */
    function stake(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(rewardToken != address(0), "Reward token not set");

        _updateReward();
        
        UserStake storage userStake = userStakes[msg.sender];
        
        // 计算并更新奖励债务
        if (userStake.stakedAmount > 0) {
            uint256 pendingReward = _calculateReward(msg.sender);
            userStake.rewardDebt = (userStake.stakedAmount * accRewardPerShare) / 1e18;
        }

        // 转移代币到合约
        require(IERC20(rewardToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userStake.stakedAmount += amount;
        userStake.lastUpdateTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev 解除质押
     * @param amount 解除质押金额
     */
    function unstake(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.stakedAmount >= amount, "Insufficient staked amount");

        _updateReward();
        
        // 计算并更新奖励债务
        uint256 pendingReward = _calculateReward(msg.sender);
        userStake.rewardDebt = ((userStake.stakedAmount - amount) * accRewardPerShare) / 1e18;
        
        userStake.stakedAmount -= amount;
        userStake.lastUpdateTime = block.timestamp;
        totalStaked -= amount;

        // 转移代币给用户
        require(IERC20(rewardToken).transfer(msg.sender, amount), "Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev 领取奖励
     */
    function claim() external whenNotPaused nonReentrant {
        _updateReward();
        
        UserStake storage userStake = userStakes[msg.sender];
        uint256 pendingReward = _calculateReward(msg.sender);
        
        require(pendingReward > 0, "No reward to claim");
        
        userStake.rewardDebt = (userStake.stakedAmount * accRewardPerShare) / 1e18;
        userStake.lastUpdateTime = block.timestamp;

        require(IERC20(rewardToken).transfer(msg.sender, pendingReward), "Transfer failed");

        emit RewardClaimed(msg.sender, pendingReward);
    }

    /**
     * @dev 质押并领取奖励（复合操作）
     * @param amount 质押金额
     */
    function stakeAndClaim(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(rewardToken != address(0), "Reward token not set");

        _updateReward();
        
        UserStake storage userStake = userStakes[msg.sender];
        uint256 pendingReward = _calculateReward(msg.sender);
        
        // 更新奖励债务
        userStake.rewardDebt = ((userStake.stakedAmount + amount) * accRewardPerShare) / 1e18;

        // 转移代币到合约
        require(IERC20(rewardToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userStake.stakedAmount += amount;
        userStake.lastUpdateTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
        
        // 如果有待领取的奖励，一并领取
        if (pendingReward > 0) {
            require(IERC20(rewardToken).transfer(msg.sender, pendingReward), "Transfer failed");
            emit RewardClaimed(msg.sender, pendingReward);
        }
    }

    /**
     * @dev 添加奖励（需要 REWARD_MANAGER_ROLE）
     * @param amount 奖励金额
     * @param duration 奖励持续时间（秒）
     */
    function addReward(uint256 amount, uint256 duration) external onlyRole(REWARD_MANAGER_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        _updateReward();
        
        // 转移奖励代币到合约
        require(IERC20(rewardToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (totalStaked == 0) {
            // 如果没有质押，奖励直接发送给管理员
            require(IERC20(rewardToken).transfer(msg.sender, amount), "Transfer failed");
        } else {
            rewardRate = amount / duration;
            rewardEndTime = block.timestamp + duration;
        }

        emit RewardAdded(amount, duration);
    }

    /**
     * @dev 查询用户质押信息
     * @param user 用户地址
     * @return stakedAmount 质押金额
     * @return pendingReward 待领取奖励
     * @return userLastUpdateTime 最后更新时间
     */
    function getUserInfo(address user) external view returns (uint256 stakedAmount, uint256 pendingReward, uint256 userLastUpdateTime) {
        UserStake storage userStake = userStakes[user];
        stakedAmount = userStake.stakedAmount;
        pendingReward = _calculateReward(user);
        userLastUpdateTime = userStake.lastUpdateTime;
    }

    /**
     * @dev 查询用户质押金额
     * @param user 用户地址
     * @return 质押金额
     */
    function getStaked(address user) external view returns (uint256) {
        return userStakes[user].stakedAmount;
    }

    /**
     * @dev 查询用户待领取奖励
     * @param user 用户地址
     * @return 待领取奖励金额
     */
    function getReward(address user) external view returns (uint256) {
        return _calculateReward(user);
    }

    /**
     * @dev 暂停合约（需要 PAUSER_ROLE）
     * @param reason 暂停原因
     */
    function pause(string memory reason) external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev 恢复合约（需要 PAUSER_ROLE）
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
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
    }
} 