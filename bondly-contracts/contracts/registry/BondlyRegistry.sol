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
    /// @dev DAO 管理地址
    address public dao;

    /// @dev 仅 owner 或 DAO 可调用
    modifier onlyOwnerOrDAO() {
        require(msg.sender == owner() || msg.sender == dao, "Not owner or DAO");
        _;
    }

    /**
     * @dev 构造函数，初始化注册表合约
     * @param initialOwner 初始所有者地址，将拥有注册表的管理权限
     *
     * @notice 部署时指定 owner，后续可转为多签/DAO
     */
    constructor(address initialOwner) Ownable() {
        _transferOwnership(initialOwner);
    }

    /// @dev 兼容旧接口：单版本注册表
    mapping(string => address) public registry;

    /// @dev 多版本注册表：name => version => address
    mapping(string => mapping(string => address)) public contractRegistry;

    /// @dev 反查：address => (name, version)
    struct NameVersion {
        string name;
        string version;
    }
    mapping(address => NameVersion) public addressToNameVersion;

    /// @dev 所有注册过的 name@version
    NameVersion[] public contractList;

    /// @dev 合约废弃标记
    mapping(string => bool) public isDeprecated;

    /// @dev 废弃事件
    event ContractDeprecated(string name, bool deprecated);

    /// @dev 删除事件
    event ContractRemoved(string name);

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
     * @dev 设置/更新合约地址（仅 owner），支持 name+version 注册
     * @param name 合约名称
     * @param version 合约版本
     * @param newAddress 新的合约地址
     */
    function setContractAddress(string memory name, string memory version, address newAddress) public onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(bytes(version).length > 0, "Version required");
        require(newAddress != address(0), "Zero address not allowed");
        // 记录到多版本注册表
        contractRegistry[name][version] = newAddress;
        addressToNameVersion[newAddress] = NameVersion(name, version);
        // 记录到列表
        contractList.push(NameVersion(name, version));
    }

    /**
     * @dev 查询合约地址（多版本）
     * @param name 合约名称
     * @param version 合约版本
     * @return 合约地址
     */
    function getContractAddress(string memory name, string memory version) public view returns (address) {
        return contractRegistry[name][version];
    }

    /**
     * @dev 查询合约地址（单参数版本，兼容旧接口）
     * @param name 合约名称
     * @return 合约地址（返回最新版本）
     */
    function getContractAddress(string memory name) public view returns (address) {
        // 返回最新注册的版本，这里简化处理返回第一个找到的版本
        for (uint256 i = 0; i < contractList.length; i++) {
            if (keccak256(bytes(contractList[i].name)) == keccak256(bytes(name))) {
                return contractRegistry[contractList[i].name][contractList[i].version];
            }
        }
        return address(0);
    }

    /**
     * @dev 反查合约地址对应的 name 和 version
     * @param addr 合约地址
     * @return name, version
     */
    function resolve(address addr) public view returns (string memory, string memory) {
        NameVersion memory nv = addressToNameVersion[addr];
        return (nv.name, nv.version);
    }

    /**
     * @dev 删除合约地址（仅 owner）
     * @param name 合约名称
     * @param version 合约版本
     */
    function removeContractAddress(string calldata name, string calldata version) external onlyOwner {
        address oldAddress = contractRegistry[name][version];
        require(oldAddress != address(0), "Not registered");
        delete addressToNameVersion[oldAddress];
        delete contractRegistry[name][version];
        // 从结构体数组中移除对应元组
        for (uint256 i = 0; i < contractList.length; i++) {
            if (
                keccak256(bytes(contractList[i].name)) == keccak256(bytes(name)) &&
                keccak256(bytes(contractList[i].version)) == keccak256(bytes(version))
            ) {
                contractList[i] = contractList[contractList.length - 1];
                contractList.pop();
                break;
            }
        }
        emit ContractAddressUpdated(name, version, oldAddress, address(0));
    }

    /**
     * @dev 检查指定合约名和版本是否已注册
     * @param name 合约名称
     * @param version 合约版本
     * @return 是否已注册
     */
    function isContractRegistered(string calldata name, string calldata version) external view returns (bool) {
        return contractRegistry[name][version] != address(0);
    }

    /**
     * @dev 检查合约地址是否已登记
     * @param contractAddress 合约地址
     * @return 是否已登记
     */
    function isContractRegisteredByAddress(address contractAddress) external view returns (bool) {
        return bytes(addressToNameVersion[contractAddress].name).length > 0;
    }

    /**
     * @dev 获取所有已注册的合约名和版本号元组
     * @return pairs 合约名和版本号元组数组
     */
    function getAllContractNameVersions() external view returns (NameVersion[] memory pairs) {
        return contractList;
    }

    /**
     * @dev 校验某地址是否注册为指定模块名
     * @param name 合约名称
     * @param addr 合约地址
     * @return 是否注册为该模块名
     */
    function isAddressRegisteredAs(string calldata name, address addr) external view returns (bool) {
        return (bytes(addressToNameVersion[addr].name).length > 0) && (keccak256(bytes(addressToNameVersion[addr].name)) == keccak256(bytes(name)));
    }

    /**
     * @dev 查询某合约名下所有注册版本
     * @param name 合约名称
     * @return 版本号数组
     */
    function getContractVersions(string calldata name) external view returns (string[] memory) {
        // Implementation needed
        revert("Method not implemented");
    }

    /**
     * @dev 标记指定合约为废弃
     */
    function deprecateContract(string memory name) external onlyOwnerOrDAO {
        isDeprecated[name] = true;
        emit ContractDeprecated(name, true);
    }

    /**
     * @dev 从注册表中彻底删除指定合约（所有版本）
     */
    function removeContract(string memory name) external onlyOwnerOrDAO {
        // 删除 registry[name]
        delete registry[name];
        // 删除所有版本
        for (uint256 i = 0; i < contractList.length; ) {
            if (keccak256(bytes(contractList[i].name)) == keccak256(bytes(name))) {
                address addr = contractRegistry[contractList[i].name][contractList[i].version];
                delete contractRegistry[contractList[i].name][contractList[i].version];
                delete addressToNameVersion[addr];
                // 移除 contractList[i]
                contractList[i] = contractList[contractList.length - 1];
                contractList.pop();
                // 不递增 i，继续检查当前位置
            } else {
                i++;
            }
        }
        emit ContractRemoved(name);
    }
}