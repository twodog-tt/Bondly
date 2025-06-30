// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBondlyRegistry.sol";
import "./interfaces/IBondlyDAO.sol";
import "./interfaces/IBondlyTreasury.sol";

/**
 * @title BondlyTreasury
 * @dev Bondly 平台的资金库合约，管理 DAO 批准的基金发放和参数变更
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract BondlyTreasury is IBondlyTreasury, Ownable, ReentrancyGuard {
    
    using SafeERC20 for IERC20;
    
    // ============ 状态变量 ============
    
    IBondlyRegistry public immutable registry;
    IBondlyDAO public daoContract;
    
    uint256 public totalFunds;              // 总资金
    uint256 public availableFunds;          // 可用资金
    uint256 public minProposalAmount;       // 最小提案金额
    uint256 public maxProposalAmount;       // 最大提案金额
    
    mapping(address => bool) public authorizedSpenders;
    mapping(uint256 => bool) public executedProposals;
    
    // 允许的 DAO 合约 setter 函数选择器
    mapping(bytes4 => bool) public allowedSetters;
    
    // ============ 事件 ============
    
    event FundsReceived(address indexed sender, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount, string reason);
    event ProposalExecuted(uint256 indexed proposalId, address indexed target, uint256 amount, bool success);
    event AuthorizedSpenderUpdated(address indexed spender, bool authorized);
    event DAOContractUpdated(address indexed oldDAO, address indexed newDAO);
    
    // ============ 修饰符 ============
    
    modifier onlyDAOContract() {
        require(msg.sender == address(daoContract), "Treasury: Only DAO contract");
        _;
    }
    
    modifier onlyAuthorizedSpender() {
        require(authorizedSpenders[msg.sender] || msg.sender == owner(), "Treasury: Not authorized");
        _;
    }
    
    // ============ 构造函数 ============
    
    /**
     * @dev 构造函数
     * @param initialOwner 初始所有者
     * @param registryAddress BondlyRegistry 合约地址
     */
    constructor(address initialOwner, address registryAddress) Ownable(initialOwner) {
        require(registryAddress != address(0), "Treasury: Invalid registry address");
        registry = IBondlyRegistry(registryAddress);
        
        // 初始化参数
        minProposalAmount = 1 * 10**18;     // 1 BOND
        maxProposalAmount = 100000 * 10**18; // 100,000 BOND
        
        // 初始化允许的 DAO 合约 setter 函数选择器
        allowedSetters[bytes4(keccak256("updateVotingContract(address)"))] = true;
        allowedSetters[bytes4(keccak256("updateTreasuryContract(address)"))] = true;
        allowedSetters[bytes4(keccak256("setAuthorizedExecutor(address,bool)"))] = true;
        allowedSetters[bytes4(keccak256("updateGovernanceParameters(uint256,uint256,uint256)"))] = true;
    }
    
    // ============ 核心功能 ============
    
    /**
     * @dev 接收 ETH
     */
    receive() external payable {
        totalFunds += msg.value;
        availableFunds += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev 执行 DAO 批准的提案
     * @param proposalId 提案ID
     * @param target 目标地址
     * @param amount 金额
     * @param data 执行数据
     */
    function executeProposal(
        uint256 proposalId,
        address target,
        uint256 amount,
        bytes calldata data
    ) external override onlyDAOContract nonReentrant {
        require(!executedProposals[proposalId], "Treasury: Proposal already executed");
        require(target != address(0), "Treasury: Invalid target address");
        require(amount <= availableFunds, "Treasury: Insufficient funds");
        require(amount >= minProposalAmount, "Treasury: Amount too small");
        require(amount <= maxProposalAmount, "Treasury: Amount too large");
        
        executedProposals[proposalId] = true;
        availableFunds -= amount;
        
        bool success = false;
        if (data.length > 0) {
            // 执行带数据的调用
            (success, ) = target.call{value: amount}(data);
        } else {
            // 直接转账
            (success, ) = target.call{value: amount}("");
        }
        
        if (!success) {
            // 如果执行失败，恢复资金
            availableFunds += amount;
            executedProposals[proposalId] = false;
        }
        
        emit ProposalExecuted(proposalId, target, amount, success);
    }
    
    /**
     * @dev 执行参数变更提案（仅允许调用 Registry 中登记的合约和允许的 setter 函数）
     * @param proposalId 提案ID
     * @param target 目标合约地址
     * @param data 执行数据（包含函数选择器和参数）
     */
    function executeParameterChange(
        uint256 proposalId,
        address target,
        bytes calldata data
    ) external onlyDAOContract nonReentrant {
        require(!executedProposals[proposalId], "Treasury: Proposal already executed");
        require(target != address(0), "Treasury: Invalid target address");
        require(data.length >= 4, "Treasury: Invalid data length");
        
        // 校验目标合约是否在 Registry 中登记
        require(
            registry.isContractRegisteredByAddress(target),
            "Treasury: Target not whitelisted"
        );
        
        // 提取函数选择器（前4个字节）
        bytes4 functionSelector = bytes4(data[:4]);
        
        // 校验函数选择器是否为允许的 setter 函数
        require(
            allowedSetters[functionSelector],
            "Treasury: Function not allowed"
        );
        
        executedProposals[proposalId] = true;
        
        // 执行参数变更调用
        (bool success, ) = target.call(data);
        
        if (!success) {
            // 如果执行失败，恢复提案状态
            executedProposals[proposalId] = false;
            revert("Treasury: Parameter change failed");
        }
        
        emit ProposalExecuted(proposalId, target, 0, success);
    }
    
    /**
     * @dev 紧急提取资金（仅所有者）
     * @param recipient 接收地址
     * @param amount 金额
     * @param reason 原因
     */
    function emergencyWithdraw(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external override onlyOwner {
        require(recipient != address(0), "Treasury: Invalid recipient");
        require(amount <= availableFunds, "Treasury: Insufficient funds");
        
        availableFunds -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury: Transfer failed");
        
        emit FundsWithdrawn(recipient, amount, reason);
    }
    
    /**
     * @dev 提取代币（仅所有者）
     * @param token 代币地址
     * @param recipient 接收地址
     * @param amount 金额
     */
    function withdrawToken(
        address token,
        address recipient,
        uint256 amount
    ) external override onlyOwner {
        require(token != address(0), "Treasury: Invalid token address");
        require(recipient != address(0), "Treasury: Invalid recipient");
        
        IERC20(token).transfer(recipient, amount);
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取资金状态
     */
    function getFundsStatus() external view override returns (
        uint256 total,
        uint256 available,
        uint256 locked
    ) {
        total = totalFunds;
        available = availableFunds;
        locked = totalFunds - availableFunds;
    }
    
    /**
     * @dev 检查提案是否已执行
     * @param proposalId 提案ID
     */
    function isProposalExecuted(uint256 proposalId) external view override returns (bool) {
        return executedProposals[proposalId];
    }
    
    /**
     * @dev 获取授权支出者列表
     * @param spender 支出者地址
     */
    function isAuthorizedSpender(address spender) external view override returns (bool) {
        return authorizedSpenders[spender];
    }
    
    // ============ 管理函数 ============
    
    /**
     * @dev 更新 DAO 合约地址
     * @param newDAOContract 新的 DAO 合约地址
     */
    function updateDAOContract(address newDAOContract) external override onlyOwner {
        require(newDAOContract != address(0), "Treasury: Invalid DAO contract");
        address oldDAO = address(daoContract);
        daoContract = IBondlyDAO(newDAOContract);
        emit DAOContractUpdated(oldDAO, newDAOContract);
    }
    
    /**
     * @dev 设置授权支出者
     * @param spender 支出者地址
     * @param authorized 是否授权
     */
    function setAuthorizedSpender(address spender, bool authorized) external override onlyOwner {
        authorizedSpenders[spender] = authorized;
        emit AuthorizedSpenderUpdated(spender, authorized);
    }
    
    /**
     * @dev 更新资金参数
     * @param _minProposalAmount 最小提案金额
     * @param _maxProposalAmount 最大提案金额
     */
    function updateFundsParameters(
        uint256 _minProposalAmount,
        uint256 _maxProposalAmount
    ) external override onlyOwner {
        require(_minProposalAmount <= _maxProposalAmount, "Treasury: Invalid amounts");
        minProposalAmount = _minProposalAmount;
        maxProposalAmount = _maxProposalAmount;
    }
    
    /**
     * @dev 设置允许的 setter 函数选择器
     * @param functionSelector 函数选择器
     * @param allowed 是否允许
     */
    function setAllowedSetter(bytes4 functionSelector, bool allowed) external onlyOwner {
        allowedSetters[functionSelector] = allowed;
    }
    
    /**
     * @dev 批量设置允许的 setter 函数选择器
     * @param functionSelectors 函数选择器数组
     * @param allowed 是否允许
     */
    function setAllowedSetters(bytes4[] calldata functionSelectors, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < functionSelectors.length; i++) {
            allowedSetters[functionSelectors[i]] = allowed;
        }
    }
    
    /**
     * @dev 检查函数选择器是否被允许
     * @param functionSelector 函数选择器
     * @return 是否允许
     */
    function isAllowedSetter(bytes4 functionSelector) external view returns (bool) {
        return allowedSetters[functionSelector];
    }
    
    /**
     * @dev 获取合约信息
     */
    function getContractInfo() external view override returns (
        address daoAddress,
        uint256 totalFunds_,
        uint256 availableFunds_,
        uint256 minAmount,
        uint256 maxAmount
    ) {
        daoAddress = address(daoContract);
        totalFunds_ = totalFunds;
        availableFunds_ = availableFunds;
        minAmount = minProposalAmount;
        maxAmount = maxProposalAmount;
    }
} 