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
    
    // 使用 SafeERC20 库来处理 ERC20 代币的转账
    using SafeERC20 for IERC20;
    
    // ============ 状态变量 ============
    
    // 注册表合约地址
    IBondlyRegistry public immutable registry;

    // DAO 合约地址
    IBondlyDAO public daoContract;
    

    uint256 public totalFunds;              // 总资金
    uint256 public availableFunds;          // 可用资金
    uint256 public minProposalAmount;       // 最小提案金额
    uint256 public maxProposalAmount;       // 最大提案金额
    
    // 授权支出者列表（0: 禁用, 1: viewer, 2: operator）
    mapping(address => uint8) public authorizedSpenders;
    // 已执行提案列表
    mapping(uint256 => bool) public executedProposals;
    
    // 允许的 DAO 合约 setter 函数选择器
    mapping(bytes4 => bool) public allowedSetters;
    
    // ============ ETH 资金管理 ============
    uint256 public totalEthFunds;
    uint256 public availableEthFunds;
    uint256 public minEthProposalAmount;
    uint256 public maxEthProposalAmount;
    event EthFundsReceived(address indexed sender, uint256 amount);
    event EthFundsWithdrawn(address indexed recipient, uint256 amount, string reason);
    event EthProposalExecuted(uint256 indexed proposalId, address indexed target, uint256 amount, bool success);
    
    // ============ BOND 代币资金管理 ============
    IERC20 public bondToken;
    uint256 public totalBondFunds;
    uint256 public availableBondFunds;
    uint256 public minBondProposalAmount;
    uint256 public maxBondProposalAmount;
    event BondFundsReceived(address indexed sender, uint256 amount);
    event BondFundsWithdrawn(address indexed recipient, uint256 amount, string reason);
    event BondProposalExecuted(uint256 indexed proposalId, address indexed target, uint256 amount, bool success);
    event BondTokenUpdated(address indexed oldToken, address indexed newToken);
    
    // ============ 事件 ============

    // 资金接收事件
    event FundsReceived(address indexed sender, uint256 amount);
    // 资金提取事件
    event FundsWithdrawn(address indexed recipient, uint256 amount, string reason);
    // 提案执行事件
    event ProposalExecuted(uint256 indexed proposalId, address indexed target, uint256 amount, bool success);
    // 授权支出者更新事件
    event AuthorizedSpenderUpdated(address indexed spender, uint8 level);
    // DAO 合约更新事件
    event DAOContractUpdated(address indexed oldDAO, address indexed newDAO);
    
    // ============ 修饰符 ============
    
    // 仅 DAO 合约可以调用
    modifier onlyDAOContract() {
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(msg.sender == daoAddr, "Treasury: Only DAO contract");
        _;
    }
    
    // 仅 operator 可以调用
    modifier onlyOperator() {
        require(authorizedSpenders[msg.sender] == 2 || msg.sender == owner(), "Treasury: Not operator");
        _;
    }
    
    // viewer 及以上
    modifier onlyViewerOrAbove() {
        require(authorizedSpenders[msg.sender] >= 1 || msg.sender == owner(), "Treasury: Not viewer");
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
        totalEthFunds += msg.value;
        availableEthFunds += msg.value;
        emit EthFundsReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev 执行 DAO 批准的提案
     * @param proposalId 提案ID
     * @param target 目标地址
     * @param amount 金额
     * @param data 执行数据
     */
    function executeEthProposal(
        uint256 proposalId,
        address target,
        uint256 amount,
        bytes calldata data
    ) external onlyDAOContract nonReentrant {
        require(!executedProposals[proposalId], "Treasury: Proposal already executed");
        require(target != address(0), "Treasury: Invalid target address");
        require(amount <= availableEthFunds, "Treasury: Insufficient ETH funds");
        require(amount >= minEthProposalAmount, "Treasury: Amount too small");
        require(amount <= maxEthProposalAmount, "Treasury: Amount too large");
        executedProposals[proposalId] = true;
        availableEthFunds -= amount;
        bool success = false;
        if (data.length > 0) {
            (success, ) = target.call{value: amount}(data);
        } else {
            (success, ) = target.call{value: amount}("");
        }
        if (!success) {
            availableEthFunds += amount;
            executedProposals[proposalId] = false;
        }
        emit EthProposalExecuted(proposalId, target, amount, success);
    }
    
    /**
     * @dev ETH 紧急提取内部实现
     */
    function _emergencyWithdrawEth(
        address recipient,
        uint256 amount,
        string calldata reason
    ) internal {
        require(recipient != address(0), "Treasury: Invalid recipient");
        require(amount <= availableEthFunds, "Treasury: Insufficient ETH funds");
        availableEthFunds -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury: Transfer failed");
        emit EthFundsWithdrawn(recipient, amount, reason);
    }
    
    /**
     * @dev 获取资金状态
     */
    function getEthFundsStatus() external view returns (
        uint256 total,
        uint256 available,
        uint256 locked
    ) {
        total = totalEthFunds;
        available = availableEthFunds;
        locked = totalEthFunds - availableEthFunds;
    }
    
    /**
     * @dev 更新资金参数
     * @param _minEthProposalAmount 最小提案金额
     * @param _maxEthProposalAmount 最大提案金额
     */
    function updateEthFundsParameters(
        uint256 _minEthProposalAmount,
        uint256 _maxEthProposalAmount
    ) external onlyOwner {
        require(_minEthProposalAmount <= _maxEthProposalAmount, "Treasury: Invalid amounts");
        minEthProposalAmount = _minEthProposalAmount;
        maxEthProposalAmount = _maxEthProposalAmount;
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
     * @dev 查询支出者权限等级
     * @param spender 支出者地址
     * @return level 权限等级（0: 禁用, 1: viewer, 2: operator）
     */
    function getSpenderLevel(address spender) external view returns (uint8) {
        return authorizedSpenders[spender];
    }
    
    // 兼容旧接口，返回是否大于0
    function isAuthorizedSpender(address spender) external view override returns (bool) {
        return authorizedSpenders[spender] > 0;
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
     * @dev 设置授权支出者等级
     * @param spender 支出者地址
     * @param level 权限等级（0: 禁用, 1: viewer, 2: operator）
     */
    function setAuthorizedSpender(address spender, uint8 level) external override onlyOwner {
        require(level <= 2, "Treasury: Invalid level");
        authorizedSpenders[spender] = level;
        emit AuthorizedSpenderUpdated(spender, level);
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
    
    /**
     * @dev 从 registry 获取并同步 DAO 合约地址
     * @param verStr DAO 合约版本号（如 "v1"、"v2"）
     */
    function syncDAOFromRegistry(string calldata verStr) external onlyOwner {
        address daoAddr = registry.getContractAddress("BondlyDAO", verStr);
        require(daoAddr != address(0), "Treasury: DAO not found in registry");
        address oldDAO = address(daoContract);
        daoContract = IBondlyDAO(daoAddr);
        emit DAOContractUpdated(oldDAO, daoAddr);
    }

    /**
     * @dev 充值 BOND 代币到金库
     * @param amount 充值数量
     */
    function depositBond(uint256 amount) external nonReentrant {
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(address(bondToken) != address(0), "Treasury: Bond token not set");
        bondToken.safeTransferFrom(msg.sender, address(this), amount);
        totalBondFunds += amount;
        availableBondFunds += amount;
        emit BondFundsReceived(msg.sender, amount);
    }

    /**
     * @dev 执行 BOND 代币拨款提案
     * @param proposalId 提案ID
     * @param target 目标地址
     * @param amount 金额
     * @param data 预留参数（暂未用，可扩展）
     */
    function executeBondProposal(
        uint256 proposalId,
        address target,
        uint256 amount,
        bytes calldata data
    ) external onlyDAOContract nonReentrant {
        require(!executedProposals[proposalId], "Treasury: Proposal already executed");
        require(target != address(0), "Treasury: Invalid target address");
        require(amount <= availableBondFunds, "Treasury: Insufficient BOND funds");
        require(amount >= minBondProposalAmount, "Treasury: Amount too small");
        require(amount <= maxBondProposalAmount, "Treasury: Amount too large");

        executedProposals[proposalId] = true;
        availableBondFunds -= amount;

        bool success = false;
        // 直接转账 BOND 代币
        try bondToken.transfer(target, amount) returns (bool result) {
            success = result;
        } catch {
            success = false;
        }

        if (!success) {
            // 如果执行失败，恢复资金
            availableBondFunds += amount;
            executedProposals[proposalId] = false;
        }

        emit BondProposalExecuted(proposalId, target, amount, success);
    }

    /**
     * @dev 紧急提取 BOND 代币（仅所有者）
     * @param recipient 接收地址
     * @param amount 金额
     * @param reason 原因
     */
    function emergencyWithdrawBond(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(recipient != address(0), "Treasury: Invalid recipient");
        require(amount <= availableBondFunds, "Treasury: Insufficient BOND funds");
        availableBondFunds -= amount;
        bondToken.safeTransfer(recipient, amount);
        emit BondFundsWithdrawn(recipient, amount, reason);
    }

    /**
     * @dev 从 registry 获取并同步 BOND 代币地址
     * @param verStr BOND 代币版本号（如 "v1"）
     */
    function syncBondTokenFromRegistry(string calldata verStr) external onlyOwner {
        address tokenAddr = registry.getContractAddress("BondlyToken", verStr);
        require(tokenAddr != address(0), "Treasury: Bond token not found in registry");
        address oldToken = address(bondToken);
        bondToken = IERC20(tokenAddr);
        emit BondTokenUpdated(oldToken, tokenAddr);
    }

    /**
     * @dev 获取 BOND 资金状态
     */
    function getBondFundsStatus() external view returns (
        uint256 total,
        uint256 available,
        uint256 locked
    ) {
        total = totalBondFunds;
        available = availableBondFunds;
        locked = totalBondFunds - availableBondFunds;
    }

    /**
     * @dev 更新资金参数
     * @param _minBondProposalAmount 最小提案金额
     * @param _maxBondProposalAmount 最大提案金额
     */
    function updateBondFundsParameters(
        uint256 _minBondProposalAmount,
        uint256 _maxBondProposalAmount
    ) external onlyOwner {
        require(_minBondProposalAmount <= _maxBondProposalAmount, "Treasury: Invalid amounts");
        minBondProposalAmount = _minBondProposalAmount;
        maxBondProposalAmount = _maxBondProposalAmount;
    }

    /**
     * @dev 兼容 IBondlyTreasury 接口的 ETH 紧急提取
     */
    function emergencyWithdraw(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external override onlyOwner {
        _emergencyWithdrawEth(recipient, amount, reason);
    }

    // ============ UUPS 升级授权 ============
    /// @dev 升级授权，仅允许 DAO 合约
    function _authorizeUpgrade(address newImplementation) internal {
        address daoAddr = registry.getContractAddress("BondlyDAO", "v1");
        require(msg.sender == daoAddr, "Treasury: Only DAO can upgrade");
        // 可选：proxiableUUID/ERC1967 校验
    }

    /// @dev 合约版本号
    function version() public pure returns (string memory) {
        return "1.0.0";
    }
} 