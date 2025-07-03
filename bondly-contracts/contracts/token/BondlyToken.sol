// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BondlyToken
 * @dev Bondly 平台代币，支持 ERC20 标准、ERC20Permit 扩展和 ERC20Votes 治理
 * 
 * 功能特性：
 * - 标准 ERC20 功能（转账、授权等）
 * - ERC20Permit 支持（无 gas 授权）
 * - ERC20Votes 支持（治理快照）
 * - 铸造和销毁功能（基于角色权限）
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 * 
 * @notice 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract BondlyToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, Pausable {
    
    // 角色定义
    // 拥有"铸币"权限的角色
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    // 拥有"销毁"权限的角色
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    // 拥有"暂停"权限的角色
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /**
     * @dev 代币铸造事件
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     * @notice 当合约所有者铸造新代币时触发
     */
    event TokensMinted(address indexed to, uint256 amount, string reason);
    
    /**
     * @dev 代币销毁事件
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     * @notice 当合约所有者销毁代币时触发
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
    
    // 常量
    /// @dev 初始供应量：10亿代币
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    /// @dev 最大供应量：20亿代币
    uint256 public constant MAX_SUPPLY = 2_000_000_000 * 10**18;
    
    /**
     * @dev 构造函数，初始化代币合约
     * @param initialOwner 初始所有者地址，将拥有合约的管理权限
     * 
     * @notice 部署时会自动铸造初始供应量给合约所有者
     * @notice 代币名称为 "Bondly Token"，符号为 "BOND"
     */
    constructor(address initialOwner) 
        ERC20("Bondly Token", "BOND") 
        ERC20Permit("Bondly Token")
    {
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(BURNER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        // 铸造初始供应量给合约部署者
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev 铸造代币（需要 MINTER_ROLE）
     * @param to 接收代币的地址
     * @param amount 要铸造的代币数量（以 wei 为单位）
     * @param reason 铸造原因，用于记录和追踪
     * 
     * @notice 只有拥有 MINTER_ROLE 的账户可以调用此函数
     * @notice 铸造数量不能超过最大供应量限制
     * @notice 会触发 TokensMinted 事件
     * 
     * @custom:security 确保 to 地址不为零地址
     * @custom:security 确保铸造后总供应量不超过 MAX_SUPPLY
     */
    function mint(address to, uint256 amount, string memory reason) 
        external 
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev 销毁代币（需要 BURNER_ROLE）
     * @param from 要销毁代币的地址
     * @param amount 要销毁的代币数量（以 wei 为单位）
     * @param reason 销毁原因，用于记录和追踪
     * 
     * @notice 只有拥有 BURNER_ROLE 的账户可以调用此函数
     * @notice 被销毁地址必须有足够的代币余额
     * @notice 会触发 TokensBurned 事件
     * 
     * @custom:security 确保 from 地址不为零地址
     * @custom:security 确保 from 地址有足够的余额
     */
    function burn(address from, uint256 amount, string memory reason) 
        external 
        onlyRole(BURNER_ROLE)
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
     * 
     * @notice 只有拥有 MINTER_ROLE 的账户可以调用此函数
     * @notice recipients 和 amounts 数组长度必须相同
     * @notice 批量铸造的总量不能超过最大供应量限制
     * @notice 会为每个地址触发 TokensMinted 事件
     * 
     * @custom:security 确保数组长度匹配
     * @custom:security 确保所有地址不为零地址
     * @custom:security 确保批量铸造后总供应量不超过 MAX_SUPPLY
     * @custom:gas 注意：大量地址的批量操作可能消耗较多 gas
     */
    function batchMint(
        address[] memory recipients, 
        uint256[] memory amounts, 
        string memory reason
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            unchecked {
                totalAmount += amounts[i];
            }
        }
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");

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
     * @return maxSupply 最大供应量
     * 
     * @notice 这是一个便利函数，一次性返回代币的所有基本信息
     * @notice 适用于前端界面显示和 API 接口
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 currentSupply,
        uint256 maxSupply
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY
        );
    }
    
    /**
     * @dev 重写 decimals 函数，确保返回 18
     * @return 代币的小数位数，固定为 18
     * 
     * @notice 这是 ERC20 标准的一部分，大多数代币使用 18 位小数
     * @notice 与以太坊的 ETH 保持一致，便于用户理解
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
    
    // ============ ERC20Votes 重写函数 ============
    
    /**
     * @dev 重写 _update 函数以支持 ERC20Votes
     */
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
    
    /**
     * @dev 重写 nonces 函数以支持 ERC20Permit
     */
    function nonces(address owner)
        public
        view
        virtual
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
    
    // ============ 重写 transfer 函数以支持暂停 ============
    
    /**
     * @dev 重写 transfer 函数以支持暂停
     */
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev 重写 transferFrom 函数以支持暂停
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev 重写 approve 函数以支持暂停
     */
    function approve(address spender, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }
}