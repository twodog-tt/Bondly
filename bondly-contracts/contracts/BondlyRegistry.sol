// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BondlyRegistry
 * @dev 用于集中管理 Bondly 平台各模块合约地址的注册表，便于合约寻址和升级
 * 
 * 功能特性：
 * - 注册、更新、删除合约地址（仅限 owner）
 * - 查询合约地址
 * - 变更事件追踪
 * - 权限由 Ownable 控制
 *
 * @notice 所有 Bondly 平台核心合约（如 Token、NFT、DAO、Reputation 等）部署后地址都应注册到本合约，便于前端和其他合约统一查找和升级
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract BondlyRegistry is Ownable {
    /**
     * @dev 构造函数，初始化注册表合约
     * @param initialOwner 初始所有者地址，将拥有注册表的管理权限
     *
     * @notice 部署时指定 owner，后续可转为多签/DAO
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @dev 合约地址映射（如 "BondlyToken" => 0x...）
    mapping(string => address) private registry;
    
    /// @dev 反向映射：合约地址 => 合约名称
    mapping(address => string) private addressToName;
    
    /// @dev 已注册的合约名称列表
    string[] private contractNames;

    /**
     * @dev 合约地址变更事件
     * @param name 合约名称（如 "BondlyToken"）
     * @param oldAddress 旧的合约地址
     * @param newAddress 新的合约地址（删除时为 0）
     * @notice 每次注册、更新或删除合约地址时触发，便于链上追踪和前端监听
     */
    event ContractAddressUpdated(string indexed name, address indexed oldAddress, address indexed newAddress);

    /**
     * @dev 设置/更新合约地址（仅 owner）
     * @param name 合约名称（如 "BondlyToken"）
     * @param newAddress 新的合约地址
     *
     * @notice 只有合约所有者可以调用此函数
     * @notice 注册或更新合约地址，原地址会被覆盖
     * @notice newAddress 不能为零地址
     * @notice 会触发 ContractAddressUpdated 事件
     *
     * @custom:security 确保 name 非空，newAddress 不为零地址
     */
    function setContractAddress(string calldata name, address newAddress) external onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(newAddress != address(0), "Zero address not allowed");
        
        address oldAddress = registry[name];
        
        // 如果是新注册，添加到名称列表
        if (oldAddress == address(0)) {
            contractNames.push(name);
        }
        
        // 更新反向映射
        if (oldAddress != address(0)) {
            delete addressToName[oldAddress];
        }
        addressToName[newAddress] = name;
        
        registry[name] = newAddress;
        emit ContractAddressUpdated(name, oldAddress, newAddress);
    }

    /**
     * @dev 查询合约地址
     * @param name 合约名称
     * @return 合约地址（未注册时为 0）
     *
     * @notice 任何人都可以调用，用于获取指定名称的合约地址
     */
    function getContractAddress(string calldata name) external view returns (address) {
        return registry[name];
    }

    /**
     * @dev 删除合约地址（仅 owner，可选功能）
     * @param name 合约名称
     *
     * @notice 只有合约所有者可以调用此函数
     * @notice 删除后该名称对应的地址为 0
     * @notice 会触发 ContractAddressUpdated 事件，newAddress 为 0
     *
     * @custom:security 确保该名称已注册
     */
    function removeContractAddress(string calldata name) external onlyOwner {
        address oldAddress = registry[name];
        require(oldAddress != address(0), "Not registered");
        
        // 从反向映射中删除
        delete addressToName[oldAddress];
        
        // 从名称列表中删除
        for (uint256 i = 0; i < contractNames.length; i++) {
            if (keccak256(bytes(contractNames[i])) == keccak256(bytes(name))) {
                contractNames[i] = contractNames[contractNames.length - 1];
                contractNames.pop();
                break;
            }
        }
        
        delete registry[name];
        emit ContractAddressUpdated(name, oldAddress, address(0));
    }
    
    /**
     * @dev 检查合约是否已注册
     * @param name 合约名称
     * @return 是否已注册
     */
    function isContractRegistered(string calldata name) external view returns (bool) {
        return registry[name] != address(0);
    }
    
    /**
     * @dev 检查合约地址是否已登记
     * @param contractAddress 合约地址
     * @return 是否已登记
     */
    function isContractRegisteredByAddress(address contractAddress) external view returns (bool) {
        return bytes(addressToName[contractAddress]).length > 0;
    }
    
    /**
     * @dev 获取所有已注册的合约名称
     * @return 合约名称数组
     */
    function getAllContractNames() external view returns (string[] memory) {
        return contractNames;
    }
}