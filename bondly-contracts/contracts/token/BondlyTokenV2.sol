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
 * @title BondlyTokenV2
 * @dev Bondly 平台代币 V2 版本 - 支持多种铸币权限
 * 
 * 主要改进：
 * - 支持 MINTER_ROLE 角色铸币
 * - 支持 DAO 合约铸币  
 * - 部署者默认获得 MINTER_ROLE
 * 
 * @author Bondly Team
 */
contract BondlyTokenV2 is
    ERC20Upgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // ============ 角色定义 ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ============ 常量 ============
    uint256 public maxSupply;

    // ============ DAO 地址 ============
    address public dao;

    // ============ Custom Errors ============
    error PausedOnlyRevokeAllowed();

    modifier whenNotPausedOrZero(uint256 amount) {
        if (paused() && amount != 0) revert PausedOnlyRevokeAllowed();
        _;
    }

    // ============ 事件 ============
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event ContractPaused(address indexed account, string reason);
    event ContractUnpaused(address indexed account);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数 V2
     * @param initialOwner 初始所有者地址
     * @param daoAddress DAO 合约地址
     */
    function initialize(address initialOwner, address daoAddress) public initializer {
        __ERC20_init("Bondly Token", "BOND");
        __ERC20Permit_init("Bondly Token");
        __ERC20Votes_init();
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();

        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner); // 🔑 部署者获得铸币权限
        _grantRole(BURNER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        transferOwnership(initialOwner);
        
        // 铸造初始供应量
        uint256 initialSupply = 1_000_000_000 * 10**decimals();
        _mint(initialOwner, initialSupply);
        maxSupply = 2_000_000_000 * 10**18;
        
        require(daoAddress != address(0), "DAO address required");
        dao = daoAddress;
        
        // 🔑 DAO 也获得铸币权限
        _grantRole(MINTER_ROLE, daoAddress);
    }

    // ============ 铸币功能 ============
    /**
     * @dev 铸造代币 - 支持 MINTER_ROLE 或 DAO
     * @param to 接收代币的地址
     * @param amount 要铸造的代币数量
     * @param reason 铸造原因
     */
    function mint(address to, uint256 amount, string memory reason)
        external
        whenNotPaused
    {
        // 🔑 检查权限：MINTER_ROLE 或者是 DAO 地址
        require(
            hasRole(MINTER_ROLE, msg.sender) || msg.sender == dao,
            "Caller must have MINTER_ROLE or be DAO"
        );
        
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev 批量铸造代币
     */
    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory reason
    ) external whenNotPaused {
        require(
            hasRole(MINTER_ROLE, msg.sender) || msg.sender == dao,
            "Caller must have MINTER_ROLE or be DAO"
        );
        
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
     * @dev 销毁代币
     */
    function burn(address from, uint256 amount, string memory reason)
        external
        whenNotPaused
    {
        require(
            hasRole(BURNER_ROLE, msg.sender) || msg.sender == dao,
            "Caller must have BURNER_ROLE or be DAO"
        );
        
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }

    /**
     * @dev 用户自助销毁
     */
    function selfBurn(uint256 amount, string memory reason) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }

    // ============ 权限管理 ============
    /**
     * @dev 添加铸币者
     */
    function addMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev 移除铸币者
     */
    function removeMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev 检查是否为铸币者
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    // ============ 暂停功能 ============
    function pause(string memory reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, reason);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    // ============ DAO 管理 ============
    function setDAO(address _dao) external onlyOwner {
        require(_dao != address(0), "Invalid DAO address");
        
        // 移除旧DAO的铸币权限
        if (dao != address(0)) {
            _revokeRole(MINTER_ROLE, dao);
        }
        
        dao = _dao;
        
        // 给新DAO铸币权限
        _grantRole(MINTER_ROLE, _dao);
    }

    // ============ 查询功能 ============
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 currentSupply,
        uint256 maxSupplyValue
    ) {
        return (name(), symbol(), decimals(), totalSupply(), maxSupply);
    }

    function mintableSupply() external view returns (uint256) {
        return maxSupply - totalSupply();
    }

    function decimals() public view virtual override(ERC20Upgradeable) returns (uint8) {
        return 18;
    }

    function version() public pure returns (string memory) {
        return "2.0.0";
    }

    /**
     * @dev 新增：版本标识函数
     */
    function versionV2() public pure returns (bool) {
        return true;
    }

    // ============ 重写函数 ============
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

    function nonces(address owner)
        public
        view
        virtual
        override(ERC20PermitUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function approve(address spender, uint256 amount) public virtual override whenNotPausedOrZero(amount) returns (bool) {
        return super.approve(spender, amount);
    }

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

    function setMaxSupply(uint256 newMaxSupply) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || msg.sender == dao,
            "Caller must be admin or DAO"
        );
        require(newMaxSupply >= totalSupply(), "Cannot be less than current supply");
        maxSupply = newMaxSupply;
    }

    // ============ UUPS 升级授权 ============
    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == dao, "Token: Only DAO can upgrade");
    }
} 