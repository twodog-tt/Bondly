// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBondlyRegistry
 * @dev Bondly Registry 合约接口定义
 * @author Bondly Team
 */
interface IBondlyRegistry {
    
    /**
     * @dev 获取合约地址
     * @param contractName 合约名称
     * @return 合约地址
     */
    function getContractAddress(string memory contractName) external view returns (address);
    
    /**
     * @dev 设置合约地址
     * @param contractName 合约名称
     * @param contractAddress 合约地址
     */
    function setContractAddress(string memory contractName, address contractAddress) external;
    
    /**
     * @dev 检查合约是否已注册
     * @param contractName 合约名称
     * @return 是否已注册
     */
    function isContractRegistered(string memory contractName) external view returns (bool);
    
    /**
     * @dev 获取所有已注册的合约名称
     * @return 合约名称数组
     */
    function getAllContractNames() external view returns (string[] memory);
    
    /**
     * @dev 检查合约地址是否已登记
     * @param contractAddress 合约地址
     * @return 是否已登记
     */
    function isContractRegisteredByAddress(address contractAddress) external view returns (bool);
} 