// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IReputationVault
 * @dev ReputationVault 合约接口定义
 * @author Bondly Team
 */
interface IReputationVault {
    
    /**
     * @dev 获取用户声誉分数
     * @param user 用户地址
     * @return 声誉分数
     */
    function getReputation(address user) external view returns (uint256);
    
    /**
     * @dev 增加用户声誉分数
     * @param user 用户地址
     * @param amount 增加的分数
     */
    function addReputation(address user, uint256 amount) external;
    
    /**
     * @dev 减少用户声誉分数
     * @param user 用户地址
     * @param amount 减少的分数
     */
    function subtractReputation(address user, uint256 amount) external;
    
    /**
     * @dev 设置用户声誉分数
     * @param user 用户地址
     * @param reputation 声誉分数
     */
    function setReputation(address user, uint256 reputation) external;
    
    /**
     * @dev 获取用户声誉历史
     * @param user 用户地址
     * @return 声誉历史数组
     */
    function getReputationHistory(address user) external view returns (uint256[] memory);

    /**
     * @dev 检查用户是否符合条件
     * @param user 用户地址
     * @return 是否符合条件
     */
    function isEligible(address user) external view returns (bool);
} 