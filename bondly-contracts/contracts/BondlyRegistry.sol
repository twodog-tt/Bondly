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

    /// @dev 合约名+版本号 => 地址
    mapping(string => mapping(string => address)) private registry;
    /// @dev 地址 => (合约名, 版本号)
    struct NameVersion { string name; string version; }
    mapping(address => NameVersion) private addressToNameVersion;
    /// @dev 已注册的合约名和版本号元组列表
    struct NameVersionPair {
        string name;
        string version;
    }
    NameVersionPair[] private contractNameVersions;

    /**
     * @dev 合约地址变更事件
     * @param name 合约名称（如 "BondlyToken"）
     * @param version 合约版本（如 "v1"、"v2"、"2024.06"）
     * @param oldAddress 旧的合约地址
     * @param newAddress 新的合约地址（删除时为 0）
     * @notice 每次注册、更新或删除合约地址时触发，便于链上追踪和前端监听
     */
    event ContractAddressUpdated(string indexed name, string indexed version, address indexed oldAddress, address newAddress);

    /**
     * @dev 设置/更新合约地址（仅 owner）
     * @param name 合约名称（如 "BondlyToken"）
     * @param version 合约版本（如 "v1"、"v2"、"2024.06"）
     * @param newAddress 新的合约地址
     */
    function setContractAddress(string calldata name, string calldata version, address newAddress) external onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(bytes(version).length > 0, "Version required");
        require(newAddress != address(0), "Zero address not allowed");
        require(registry[name][version] != newAddress, "No change");

        address oldAddress = registry[name][version];
        if (oldAddress == address(0)) {
            contractNameVersions.push(NameVersionPair(name, version));
        }
        if (oldAddress != address(0)) {
            delete addressToNameVersion[oldAddress];
        }
        addressToNameVersion[newAddress] = NameVersion(name, version);
        registry[name][version] = newAddress;
        emit ContractAddressUpdated(name, version, oldAddress, newAddress);
    }

    /**
     * @dev 查询合约地址
     * @param name 合约名称
     * @param version 合约版本
     * @return 合约地址（未注册时为 0）
     */
    function getContractAddress(string calldata name, string calldata version) external view returns (address) {
        return registry[name][version];
    }

    /**
     * @dev 删除合约地址（仅 owner）
     * @param name 合约名称
     * @param version 合约版本
     */
    function removeContractAddress(string calldata name, string calldata version) external onlyOwner {
        address oldAddress = registry[name][version];
        require(oldAddress != address(0), "Not registered");
        delete addressToNameVersion[oldAddress];
        delete registry[name][version];
        // 从结构体数组中移除对应元组
        for (uint256 i = 0; i < contractNameVersions.length; i++) {
            if (
                keccak256(bytes(contractNameVersions[i].name)) == keccak256(bytes(name)) &&
                keccak256(bytes(contractNameVersions[i].version)) == keccak256(bytes(version))
            ) {
                contractNameVersions[i] = contractNameVersions[contractNameVersions.length - 1];
                contractNameVersions.pop();
                break;
            }
        }
        emit ContractAddressUpdated(name, version, oldAddress, address(0));
    }

    /**
     * @dev 检查合约是否已注册
     * @param name 合约名称
     * @param version 合约版本
     * @return 是否已注册
     */
    function isContractRegistered(string calldata name, string calldata version) external view returns (bool) {
        return registry[name][version] != address(0);
    }

    /**
     * @dev 检查合约地址是否已登记
     * @param contractAddress 合约地址
     * @return 是否已登记
     */
    function isContractRegisteredByAddress(address contractAddress) external view returns (bool) {
        return bytes(addressToNameVersion[contractAddress].name).length > 0 && bytes(addressToNameVersion[contractAddress].version).length > 0;
    }

    /**
     * @dev 获取所有已注册的合约名和版本号元组
     * @return pairs 合约名和版本号元组数组
     */
    function getAllContractNameVersions() external view returns (NameVersionPair[] memory pairs) {
        return contractNameVersions;
    }
}