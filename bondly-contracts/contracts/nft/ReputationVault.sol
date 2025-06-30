// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 ReputationVault 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title ReputationVault
 * @dev Bondly 平台链上声誉分数管理合约
 *
 * 功能特性：
 * - 每个用户地址可拥有动态 reputation 分数
 * - 声誉来源包括内容铸造、互动、成就等
 * - 仅可信来源合约可修改分数，owner 可管理可信来源
 * - 集成 BondlyRegistry，便于统一寻址
 *
 * @notice 适用于 Web3 社交平台的声誉激励与治理
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract ReputationVault is Ownable {
    /// @dev 用户地址 => 声誉分数
    mapping(address => uint256) private reputations;

    /// @dev 可信来源合约地址 => 是否授权
    mapping(address => bool) public isReputationSource;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /**
     * @dev 声誉增加事件
     * @param user 用户地址
     * @param amount 增加分数
     */
    event ReputationAdded(address indexed user, uint256 amount);

    /**
     * @dev 声誉减少事件
     * @param user 用户地址
     * @param amount 减少分数
     */
    event ReputationSubtracted(address indexed user, uint256 amount);

    /**
     * @dev 构造函数
     * @param registryAddress BondlyRegistry 合约地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address registryAddress, address initialOwner) Ownable(initialOwner) {
        registry = registryAddress;
    }

    /**
     * @dev 设置可信来源合约（仅 owner）
     * @param caller 来源合约地址
     * @param isAuthorized 是否授权
     *
     * @notice 只有 owner 可调用
     */
    function setReputationSource(address caller, bool isAuthorized) external onlyOwner {
        isReputationSource[caller] = isAuthorized;
    }

    /**
     * @dev 增加用户声誉分数（仅可信来源）
     * @param user 用户地址
     * @param amount 增加分数
     *
     * @notice 仅可信来源合约可调用
     */
    function addReputation(address user, uint256 amount) external {
        require(isReputationSource[msg.sender], "Not authorized source");
        reputations[user] += amount;
        emit ReputationAdded(user, amount);
    }

    /**
     * @dev 减少用户声誉分数（仅可信来源）
     * @param user 用户地址
     * @param amount 减少分数
     *
     * @notice 仅可信来源合约可调用
     */
    function subtractReputation(address user, uint256 amount) external {
        require(isReputationSource[msg.sender], "Not authorized source");
        uint256 current = reputations[user];
        if (amount > current) {
            reputations[user] = 0;
        } else {
            reputations[user] = current - amount;
        }
        emit ReputationSubtracted(user, amount);
    }

    /**
     * @dev 查询用户声誉分数
     * @param user 用户地址
     * @return 声誉分数
     */
    function getReputation(address user) external view returns (uint256) {
        return reputations[user];
    }
} 