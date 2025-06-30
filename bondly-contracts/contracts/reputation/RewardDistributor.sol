// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
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
 *
 * @notice 适用于 Web3 平台声誉激励与周期性奖励分配
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract RewardDistributor is Ownable {
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
     * @dev 构造函数
     * @param registryAddress BondlyRegistry 合约地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address registryAddress, address initialOwner) Ownable(initialOwner) {
        registry = registryAddress;
    }

    /**
     * @dev 项目方发起新一轮奖励快照，记录所有用户声誉分布
     * @param users 需要快照的用户地址数组（由前端/项目方传入活跃用户列表）
     *
     * @notice 只有 owner 可调用
     * @notice 声誉数据从 ReputationVault 获取
     */
    function snapshot(address[] calldata users) external onlyOwner {
        require(users.length > 0, "No users");
        currentRound++;
        uint256 total = 0;
        address reputationVault = IBondlyRegistry(registry).getContractAddress("REPUTATION_VAULT");
        for (uint256 i = 0; i < users.length; i++) {
            uint256 rep = IReputationVault(reputationVault).getReputation(users[i]);
            roundReputation[currentRound][users[i]] = rep;
            total += rep;
        }
        roundUsers[currentRound] = users;
        roundTotalReputation[currentRound] = total;
        emit Snapshot(currentRound, total, users.length);
    }

    /**
     * @dev 项目方为当前轮注入奖励资金（BOND Token）
     * @param amount 注入金额
     *
     * @notice 需要提前 approve 足够的 BOND 给本合约
     */
    function depositReward(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        require(IERC20(bondToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rewardPool[currentRound] += amount;
        emit RewardDeposited(currentRound, amount);
    }

    /**
     * @dev 用户领取当前轮奖励，按声誉占比分配
     */
    function claimReward() external {
        uint256 round = currentRound;
        require(round > 0, "No round");
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
        if (round == 0 || hasClaimed[round][user]) return 0;
        uint256 userRep = roundReputation[round][user];
        uint256 totalRep = roundTotalReputation[round];
        uint256 pool = rewardPool[round];
        if (userRep == 0 || totalRep == 0 || pool == 0) return 0;
        return (pool * userRep) / totalRep;
    }
} 