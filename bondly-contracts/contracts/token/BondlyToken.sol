// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title BondlyTokenUpgradeable
 * @dev Bondly 平台代币，支持 ERC20 标准、ERC20Permit 扩展和 ERC20Votes 治理，可升级（UUPS）
 * 
 * 功能特性：
 * - 标准 ERC20 功能（转账、授权等）
 * - ERC20Permit 支持（无 gas 授权）
 * - ERC20Votes 支持（治理快照）
 * - 铸造和销毁功能（基于角色权限）
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 * - UUPS 可升级
 * 
 * @notice 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 */
contract BondlyTokenUpgradeable is
    ERC20Upgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // ============ 角色定义 ============
    /// @dev 拥有"铸币"权限的角色
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @dev 拥有"销毁"权限的角色
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    /// @dev 拥有"暂停"权限的角色
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ============ 常量 ============
    /// @dev 最大供应量（可变）
    uint256 public maxSupply;

    // ============ Custom Errors ============
    /// @dev 合约暂停时仅允许 approve 0
    error PausedOnlyRevokeAllowed();

    /// @dev 支持 approve(…, 0) 在暂停时撤销授权
    modifier whenNotPausedOrZero(uint256 amount) {
        if (paused() && amount != 0) revert PausedOnlyRevokeAllowed();
        _;
    }

    // ============ 事件 ============
    /**
     * @dev 代币铸造事件
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     */
    event TokensMinted(address indexed to, uint256 amount, string reason);
    /**
     * @dev 代币销毁事件
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     */
    event TokensBurned(address indexed from, uint256 amount, string reason);
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     * @param initialOwner 初始所有者地址，将拥有合约的管理权限
     * @param daoAddress DAO 合约地址
     *
     * @notice 部署时会自动铸造初始供应量给合约所有者
     * @notice 代币名称为 "Bondly Token"，符号为 "BOND"
     */
    function initialize(address initialOwner, address daoAddress) public initializer {
        __ERC20_init("Bondly Token", "BOND"); // 代币名称和符号
        __ERC20Permit_init("Bondly Token"); // 无 gas 授权
        __ERC20Votes_init(); // 治理快照
        __AccessControl_init(); // 角色权限管理
        __Pausable_init(); // 暂停机制
        __Ownable_init(); // 合约所有权
        __UUPSUpgradeable_init(); // UUPS 升级

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner); // 默认管理员
        _grantRole(MINTER_ROLE, initialOwner); // 铸币权限
        _grantRole(BURNER_ROLE, initialOwner); // 销毁权限
        _grantRole(PAUSER_ROLE, initialOwner); // 暂停权限
        transferOwnership(initialOwner); // 转移所有权
        uint256 initialSupply = 1_000_000_000 * 10**decimals(); // 初始供应量
        _mint(initialOwner, initialSupply); // 铸造初始供应量
        maxSupply = 2_000_000_000 * 10**18; // 最大供应量
        require(daoAddress != address(0), "DAO address required"); // DAO 地址
        dao = daoAddress; // 设置 DAO 地址
    }

    // ============ 核心功能 ============
    /**
     * @dev 铸造代币（需要 MINTER_ROLE）
     * @param to 接收代币的地址
     * @param amount 要铸造的代币数量（以 wei 为单位）
     * @param reason 铸造原因，用于记录和追踪
     */
    function mint(address to, uint256 amount, string memory reason)
        external
        onlyDAO
        whenNotPaused
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev 销毁代币（需要 BURNER_ROLE）
     * @param from 要销毁代币的地址
     * @param amount 要销毁的代币数量（以 wei 为单位）
     * @param reason 销毁原因，用于记录和追踪
     */
    function burn(address from, uint256 amount, string memory reason)
        external
        onlyDAO
        whenNotPaused
    {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }

    /**
     * @dev 批量铸造代币（需要 MINTER_ROLE）
     * @param recipients 接收代币的地址数组
     * @param amounts 对应的代币数量数组（以 wei 为单位）
     * @param reason 批量铸造原因，用于记录和追踪
     */
    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory reason
    ) external onlyDAO whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            unchecked { totalAmount += amounts[i]; }
        }
        require(totalSupply() + totalAmount <= maxSupply, "Exceeds max supply");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i], reason);
        }
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
     * @dev 获取代币的完整信息
     * @return tokenName 代币名称
     * @return tokenSymbol 代币符号
     * @return tokenDecimals 代币小数位数
     * @return currentSupply 当前总供应量
     * @return maxSupplyValue 最大供应量
     *
     * @notice 这是一个便利函数，一次性返回代币的所有基本信息
     * @notice 适用于前端界面显示和 API 接口
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 currentSupply,
        uint256 maxSupplyValue
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            maxSupply
        );
    }

    /**
     * @dev 重写 decimals 函数，确保返回 18
     * @return 代币的小数位数，固定为 18
     *
     * @notice 这是 ERC20 标准的一部分，大多数代币使用 18 位小数
     * @notice 与以太坊的 ETH 保持一致，便于用户理解
     */
    function decimals() public view virtual override(ERC20Upgradeable) returns (uint8) {
        return 18;
    }

    // ============ ERC20Votes 重写函数 ============
    // 重写 ERC20Votes 相关函数，确保在转账、铸造、销毁时更新治理快照 为治理系统提供「可快照的投票权机制」
    // 这些重写函数确保在代币转账、铸造和销毁时，治理快照能够正确更新，防止操纵投票
    // 同时，这些重写函数也确保了代币的治理功能能够正常工作
    /**
     * @dev ERC20Votes 相关转账后钩子
     * @param from 转账前的地址
     * @param to 转账后的地址
     * @param amount 转账数量
     */
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._afterTokenTransfer(from, to, amount);
    }
    /**
     * @dev ERC20Votes 相关铸造
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     */
    function _mint(address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }
    /**
     * @dev ERC20Votes 相关销毁
     * @param account 销毁代币的地址
     * @param amount 销毁的代币数量
     */
    function _burn(address account, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

    // ============ ERC20Permit 重写 ============
    // 支持 EIP-2612 Permit 功能中的 nonce 查询
    // 这是 ERC20Permit 标准的一部分，确保了代币的治理功能能够正常工作
    // 多重继承情况下必须显式 override
    /**
     * @dev ERC20Permit 相关 nonces 查询
     * @param owner 查询 nonce 的地址
     * @return nonce 查询结果
     */
    function nonces(address owner)
        public
        view
        virtual
        override(ERC20PermitUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    // ============ transfer/approve 支持暂停 ============
    /**
     * @dev 支持暂停的 transfer
     * @param to 转账后的地址
     * @param amount 转账数量
     * @return 转账是否成功
     */
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    /**
     * @dev 支持暂停的 transferFrom
     * @param from 转账前的地址
     * @param to 转账后的地址
     * @param amount 转账数量
     * @return 转账是否成功
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    /**
     * @dev 支持暂停和 custom error 的 approve
     * @param spender 授权的地址
     * @param amount 授权数量
     * @return 授权是否成功
     */
    function approve(address spender, uint256 amount) public virtual override whenNotPausedOrZero(amount) returns (bool) {
        return super.approve(spender, amount);
    }

    // ============ permit 显式暴露 ============
    /**
     * @dev 显式实现 permit() 以便前端和接口可直接调用
     * @param owner 授权的地址
     * @param spender 被授权的地址
     * @param value 授权数量
     * @param deadline 授权截止时间
     * @param v 签名 v 参数
     * @param r 签名 r 参数
     * @param s 签名 s 参数
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual override {
        super.permit(owner, spender, value, deadline, v, r, s);
    }

    // ============ 用户自助销毁/领取奖励 ============
    /**
     * @dev 用户主动销毁自己账户的代币
     * @param amount 要销毁的代币数量
     * @param reason 销毁原因
     */
    function selfBurn(uint256 amount, string memory reason) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }
    /**
     * @dev 用户主动领取奖励（需有 MINTER_ROLE）
     * @param amount 奖励数量
     * @param reason 领取原因
     */
    function selfMint(uint256 amount, string memory reason) external
        onlyDAO
        whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(msg.sender, amount);
        emit TokensMinted(msg.sender, amount, reason);
    }
    /**
     * @dev 查询剩余可铸代币数量
     * @return 剩余可铸数量（maxSupply - totalSupply()）
     */
    function mintableSupply() external view returns (uint256) {
        return maxSupply - totalSupply();
    }

    // ============ UUPS 升级授权 ============
    /**
     * @dev 升级授权，仅允许 DAO 合约
     * @param newImplementation 新实现的合约地址
     */
    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == dao, "Token: Only DAO can upgrade");
        // 可选：proxiableUUID/ERC1967 校验
    }

    /**
     * @dev 合约版本号
     * @return 合约版本号
     */
    function version() public pure returns (string memory) {
        return "1.0.0";
    }

    // ============ DAO 相关功能 ============
    /**
     * @dev DAO 合约地址
     */
    address public dao;

    /**
     * @dev 设置 DAO 合约地址（仅 owner）
     * @param _dao DAO 合约地址
     */
    function setDAO(address _dao) external onlyOwner {
        require(_dao != address(0), "Invalid DAO address");
        dao = _dao;
    }

    /**
     * @dev 仅允许 DAO 调用的修饰符
     */
    modifier onlyDAO() {
        require(msg.sender == dao, "Only DAO can call");
        _;
    }

    /**
     * @dev 设置最大供应量（仅 DAO）
     * @param newMaxSupply 新的最大供应量
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyDAO {
        require(newMaxSupply >= totalSupply(), "Cannot be less than current supply");
        maxSupply = newMaxSupply;
    }
}