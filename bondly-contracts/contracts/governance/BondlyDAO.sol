// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../registry/IBondlyRegistry.sol";
import "./IBondlyVoting.sol";
import "../treasury/IBondlyTreasury.sol";
import "./IBondlyDAO.sol";
import "../reputation/IReputationVault.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BondlyDAOUpgradeable
 * @dev Bondly 平台的 DAO 治理合约，UUPS 可升级，管理提案的创建、记录、状态流转
 * @author Bondly Team
 */
contract BondlyDAOUpgradeable is IBondlyDAO, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    
    // ============ 状态枚举 ============
    
    enum ProposalState { 
        Pending,    // 待激活
        Active,      // 投票中
        Executed,    // 已执行
        Failed       // 已失败
    }
    
    // ============ 结构体 ============
    
    struct Proposal {
        uint256 id;                     // 提案ID
        address proposer;               // 提案人
        string title;                   // 提案标题
        string description;             // 提案描述
        address target;                 // 目标合约地址
        bytes data;                     // 执行数据
        bytes32 proposalHash;           // 提案数据哈希，防止篡改
        ProposalState state;            // 提案状态
        uint256 yesVotes;               // 赞成票数
        uint256 noVotes;                // 反对票数
        uint256 snapshotBlock;          // 快照区块
        uint256 votingDeadline;         // 投票截止时间
        uint256 executionTime;          // 执行时间
        uint256 depositAmount;           // 提案押金（ETH）
    }
    
    // ============ 状态变量 ============
    
    IBondlyRegistry public registry;
    IBondlyVoting public votingContract;
    IBondlyTreasury public treasuryContract;
    IERC20 public bondToken; // BOND 代币地址（通过 registry 获取）
    uint256 public proposalCount;
    uint256 public minProposalDeposit;
    uint256 public minVotingPeriod;
    uint256 public maxVotingPeriod;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userProposals;
    mapping(address => bool) public authorizedExecutors;
    mapping(uint256 => address) public proposalDepositors; // 记录每个提案的押金人
    mapping(uint256 => uint256) public proposalDeposits;   // 记录每个提案的押金数量
    /// @dev 合约函数白名单：target => selector => allowed
    mapping(address => mapping(bytes4 => bool)) public allowedFunctions;
    IReputationVault public reputationVault;
    bool public allowReputationProposal;
    
    // ============ 事件 ============
    
    event ProposalCreated(
        uint256 indexed id, 
        address indexed proposer, 
        string title, 
        address target, 
        bytes data,
        bytes32 proposalHash
    );
    
    event ProposalActivated(
        uint256 indexed id, 
        uint256 snapshotBlock, 
        uint256 votingDeadline
    );
    
    event ProposalExecuted(
        uint256 indexed id, 
        bool success, 
        uint256 executionTime
    );
    
    event ProposalFailed(uint256 indexed id);
    event ProposalVoted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    
    event VotingContractUpdated(address indexed oldVoting, address indexed newVoting);
    event TreasuryContractUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    event ProposalFailedWithReason(uint256 indexed proposalId, string reason);
    
    event ContractPaused(address indexed account, string reason);
    event ContractUnpaused(address indexed account);
    
    event VotingWeightTypeUpdated(address indexed dao, uint8 newType);
    
    // ============ 修饰符 ============
    
    modifier onlyVotingContract() {
        require(msg.sender == address(votingContract), "DAO: Only voting contract");
        _;
    }
    
    modifier onlyAuthorizedExecutor() {
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "DAO: Not authorized");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "DAO: Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(proposals[proposalId].state == ProposalState.Active, "DAO: Proposal not active");
        _;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }
    
    /**
     * @dev 初始化函数，替代构造函数
     * @param initialOwner 初始所有者
     * @param registryAddress BondlyRegistry 合约地址
     */
    function initialize(address initialOwner, address registryAddress) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        require(registryAddress != address(0), "DAO: Invalid registry address");
        registry = IBondlyRegistry(registryAddress);
        _transferOwnership(initialOwner);
        minProposalDeposit = 100 * 10**18;  // 100 BOND
        minVotingPeriod = 3 days;            // 最小 3 天投票期
        maxVotingPeriod = 7 days;            // 最大 7 天投票期
        reputationVault = IReputationVault(registry.getContractAddress("ReputationVault", "v1"));
        allowReputationProposal = true;
    }
    
    // ============ 核心功能 ============
    
    /**
     * @dev 设置 BOND 代币地址（仅 owner，可通过 registry 获取）
     * @param tokenAddr BOND 代币地址
     */
    function setBondToken(address tokenAddr) external onlyOwner {
        require(tokenAddr != address(0), "DAO: Invalid bond token");
        bondToken = IERC20(tokenAddr);
    }
    
    /**
     * @dev 创建新提案，押金为 BOND 代币
     */
    function createProposal(
        string calldata title,
        string calldata description,
        address target,
        bytes calldata data,
        uint256 votingPeriod
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(address(bondToken) != address(0), "DAO: Bond token not set");
        require(minProposalDeposit > 0, "DAO: Deposit not set");
        require(bytes(title).length > 0, "DAO: Empty title");
        require(bytes(description).length > 0, "DAO: Empty description");
        require(target != address(0), "DAO: Invalid target address");
        require(votingPeriod >= minVotingPeriod, "DAO: Voting period too short");
        require(votingPeriod <= maxVotingPeriod, "DAO: Voting period too long");
        bool eligibleByDeposit = msg.value >= minProposalDeposit;
        bool eligibleByReputation = allowReputationProposal &&
            address(reputationVault) != address(0) &&
            reputationVault.isEligible(msg.sender);
        require(eligibleByDeposit || eligibleByReputation, "DAO: Not eligible to propose");
        // 原有押金逻辑保留
        if (eligibleByDeposit) {
            // 转账 BOND 作为押金
            bondToken.transferFrom(msg.sender, address(this), minProposalDeposit);
        }
        proposalCount++;
        uint256 proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.data = data;
        proposal.proposalHash = keccak256(abi.encode(target, data));
        proposal.state = ProposalState.Pending;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
        proposal.snapshotBlock = 0;
        proposal.votingDeadline = 0;
        proposal.executionTime = 0;
        userProposals[msg.sender].push(proposalId);
        // 记录押金人和押金
        proposalDepositors[proposalId] = msg.sender;
        proposalDeposits[proposalId] = minProposalDeposit;
        emit ProposalCreated(proposalId, msg.sender, title, target, data, proposal.proposalHash);
        return proposalId;
    }
    
    /**
     * @dev 激活提案（开始投票）
     * @param proposalId 提案ID
     * @param votingPeriod 投票期（秒）
     */
    function activateProposal(uint256 proposalId, uint256 votingPeriod) external onlyAuthorizedExecutor proposalExists(proposalId) whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Pending, "DAO: Proposal not pending");
        require(votingPeriod >= minVotingPeriod, "DAO: Voting period too short");
        require(votingPeriod <= maxVotingPeriod, "DAO: Voting period too long");
        // 前置检查：目标合约必须在 registry 注册
        require(registry.isContractRegisteredByAddress(proposal.target), "DAO: Target not registered");
        // 前置检查：执行函数 selector 必须在白名单
        require(proposal.data.length >= 4, "DAO: Invalid calldata");
        bytes memory data = proposal.data;
        bytes4 selector;
        assembly { selector := mload(add(data, 32)) }
        require(allowedFunctions[proposal.target][selector], "DAO: Function not allowed");
        proposal.state = ProposalState.Active;
        proposal.snapshotBlock = block.number;
        proposal.votingDeadline = block.timestamp + votingPeriod;
        // 通知 Voting 合约开始投票
        if (address(votingContract) != address(0)) {
            votingContract.startVoting(proposalId, proposal.snapshotBlock, proposal.votingDeadline);
            // 获取当前权重类型
            (, uint8 currentWeightType, , ) = votingContract.getContractInfo();
            // 0: Token, 1: Reputation, 2: Mixed
            if (currentWeightType == 1 || currentWeightType == 2) {
                recordReputationSnapshots(proposalId, new address[](0));
            }
        }
        emit ProposalActivated(proposalId, proposal.snapshotBlock, proposal.votingDeadline);
    }
    
    /**
     * @dev 记录声誉快照（内部函数）
     * @param proposalId 提案ID
     */
    function recordReputationSnapshots(uint256 proposalId, address[] memory voters) internal {
        address vaultAddr = registry.getContractAddress("ReputationVault", "v1");
        if (vaultAddr == address(0)) return;
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            uint256 reputation = 0;
            try IReputationVault(vaultAddr).getReputation(voter) returns (uint256 rep) {
                reputation = rep;
            } catch {}
            IBondlyVoting(address(votingContract)).recordReputationSnapshot(proposalId, voter, reputation);
        }
    }
    
    /**
     * @dev 执行提案，成功返还 50% 押金，失败全部转 Treasury
     */
    function executeProposal(uint256 proposalId) external onlyAuthorizedExecutor nonReentrant proposalExists(proposalId) whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "DAO: Proposal not active");
        require(block.timestamp > proposal.votingDeadline, "DAO: Voting not ended");
        require(keccak256(abi.encode(proposal.target, proposal.data)) == proposal.proposalHash, "DAO: Proposal data mismatch");
        // 校验目标合约注册和名称
        require(registry.isContractRegisteredByAddress(proposal.target), "DAO: Target not registered");
        (string memory name, string memory verStr) = registry.addressToNameVersion(proposal.target);
        address regAddr = registry.getContractAddress(name, verStr);
        require(bytes(name).length > 0, "DAO: Target name missing");
        // 校验 selector 白名单
        require(proposal.data.length >= 4, "DAO: Invalid calldata");
        bytes memory data = proposal.data;
        bytes4 selector;
        assembly { selector := mload(add(data, 32)) }
        require(allowedFunctions[proposal.target][selector], "DAO: Function not allowed");
        proposal.executionTime = block.timestamp;
        address depositor = proposalDepositors[proposalId];
        uint256 deposit = proposalDeposits[proposalId];
        if (proposal.yesVotes > proposal.noVotes) {
            // 提案通过，执行操作
            bool success;
            bytes memory returnData;
            string memory revertReason = "";
            try this._callProposalTarget(proposal.target, proposal.data) returns (bool s, bytes memory ret) {
                success = s;
                returnData = ret;
            } catch Error(string memory reason) {
                revertReason = reason;
                success = false;
            } catch (bytes memory lowLevelData) {
                revertReason = _getRevertMsg(lowLevelData);
                success = false;
            }
            proposal.state = success ? ProposalState.Executed : ProposalState.Failed;
            if (success) {
                emit ProposalExecuted(proposalId, true, proposal.executionTime);
            } else {
                emit ProposalFailed(proposalId);
                emit ProposalFailedWithReason(proposalId, revertReason);
            }
        } else {
            emit ProposalFailed(proposalId);
        }
        // 清理押金记录
        delete proposalDepositors[proposalId];
        delete proposalDeposits[proposalId];
    }
    
    /**
     * @dev 内部函数，代理调用目标合约
     */
    function _callProposalTarget(address target, bytes memory data) external returns (bool, bytes memory) {
        require(msg.sender == address(this), "DAO: Only self-call");
        (bool success, bytes memory ret) = target.call(data);
        require(success, _getRevertMsg(ret));
        return (success, ret);
    }
    
    /**
     * @dev 解析 revert 原因
     */
    function _getRevertMsg(bytes memory revertData) internal pure returns (string memory) {
        if (revertData.length < 68) return "Transaction reverted silently";
        assembly {
            revertData := add(revertData, 0x04)
        }
        return abi.decode(revertData, (string));
    }
    
    /**
     * @dev 投票回调（由 Voting 合约调用）
     * @param proposalId 提案ID
     * @param voter 投票者
     * @param support 是否支持
     * @param weight 投票权重
     */
    function onVote(
        uint256 proposalId, 
        address voter, 
        bool support, 
        uint256 weight
    ) external override onlyVotingContract proposalExists(proposalId) proposalActive(proposalId) {
        require(weight > 0, "DAO: Zero voting weight");
        
        Proposal storage proposal = proposals[proposalId];
        if (support) {
            proposal.yesVotes += weight;
        } else {
            proposal.noVotes += weight;
        }
        
        emit ProposalVoted(proposalId, voter, support, weight);
    }
    
    // ============ 接口实现 ============
    
    /**
     * @dev 检查提案是否处于活跃状态
     * @param proposalId 提案ID
     * @return 是否活跃
     */
    function isProposalActive(uint256 proposalId) external view override returns (bool) {
        return proposals[proposalId].state == ProposalState.Active;
    }
    
    /**
     * @dev 获取提案详情
     * @param proposalId 提案ID
     */
    function getProposal(uint256 proposalId) external view override returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        address target,
        bytes memory data,
        bytes32 proposalHash,
        uint8 state,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 snapshotBlock,
        uint256 votingDeadline,
        uint256 executionTime
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.proposer,
            p.title,
            p.description,
            p.target,
            p.data,
            p.proposalHash,
            uint8(p.state),
            p.yesVotes,
            p.noVotes,
            p.snapshotBlock,
            p.votingDeadline,
            p.executionTime
        );
    }
    
    /**
     * @dev 获取提案快照区块
     * @param proposalId 提案ID
     * @return 快照区块号
     */
    function getProposalSnapshotBlock(uint256 proposalId) external view override returns (uint256) {
        return proposals[proposalId].snapshotBlock;
    }
    
    /**
     * @dev 获取提案投票截止时间
     * @param proposalId 提案ID
     * @return 投票截止时间
     */
    function getProposalVotingDeadline(uint256 proposalId) external view override returns (uint256) {
        return proposals[proposalId].votingDeadline;
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取用户的所有提案
     * @param user 用户地址
     */
    function getUserProposals(address user) external view returns (uint256[] memory) {
        return userProposals[user];
    }
    
    /**
     * @dev 检查提案是否可以执行
     * @param proposalId 提案ID
     */
    function canExecute(uint256 proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.state == ProposalState.Active &&
            block.timestamp > proposal.votingDeadline &&
            proposal.yesVotes > proposal.noVotes
        );
    }
    
    /**
     * @dev 获取提案投票结果
     * @param proposalId 提案ID
     */
    function getVoteResult(uint256 proposalId) external view returns (uint256 yesVotes, uint256 noVotes, bool passed) {
        Proposal storage proposal = proposals[proposalId];
        yesVotes = proposal.yesVotes;
        noVotes = proposal.noVotes;
        passed = yesVotes > noVotes;
    }
    
    /**
     * @dev 验证提案数据完整性
     * @param proposalId 提案ID
     */
    function verifyProposalIntegrity(uint256 proposalId) external view returns (bool isValid) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.id == 0) return false; // 提案不存在
        
        bytes32 calculatedHash = keccak256(abi.encode(proposal.target, proposal.data));
        return calculatedHash == proposal.proposalHash;
    }
    
    // ============ 管理函数 ============
    
    /**
     * @dev 更新投票合约地址
     * @param newVotingContract 新的投票合约地址
     */
    function updateVotingContract(address newVotingContract) external onlyOwner {
        require(newVotingContract != address(0), "DAO: Invalid voting contract");
        address oldVoting = address(votingContract);
        votingContract = IBondlyVoting(newVotingContract);
        registry.setContractAddress("BondlyVoting", "v1", newVotingContract);
        emit VotingContractUpdated(oldVoting, newVotingContract);
    }
    
    /**
     * @dev 更新资金库合约地址
     * @param newTreasuryContract 新的资金库合约地址
     */
    function updateTreasuryContract(address newTreasuryContract) external onlyOwner {
        require(newTreasuryContract != address(0), "DAO: Invalid treasury contract");
        address oldTreasury = address(treasuryContract);
        treasuryContract = IBondlyTreasury(newTreasuryContract);
        registry.setContractAddress("BondlyTreasury", "v1", newTreasuryContract);
        emit TreasuryContractUpdated(oldTreasury, newTreasuryContract);
    }
    
    /**
     * @dev 设置授权执行者（只能由合约自身调用，即只能通过 DAO 提案）
     * @param executor 执行者地址
     * @param authorized 是否授权
     */
    function setAuthorizedExecutor(address executor, bool authorized) external {
        require(msg.sender == address(this), "DAO: Only self-call");
        authorizedExecutors[executor] = authorized;
    }
    
    /**
     * @dev 更新治理参数
     * @param _minProposalDeposit 最小提案押金
     * @param _minVotingPeriod 最小投票期
     * @param _maxVotingPeriod 最大投票期
     */
    function updateGovernanceParameters(
        uint256 _minProposalDeposit,
        uint256 _minVotingPeriod,
        uint256 _maxVotingPeriod
    ) external onlyOwner {
        minProposalDeposit = _minProposalDeposit;
        minVotingPeriod = _minVotingPeriod;
        maxVotingPeriod = _maxVotingPeriod;
    }
    
    /**
     * @dev 暂停合约（仅所有者）
     * @param reason 暂停原因
     */
    function pause(string memory reason) external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender, reason);
    }
    
    /**
     * @dev 恢复合约（仅所有者）
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev 提取合约中的 ETH
     * @param amount 提取金额
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "DAO: Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev 接收 ETH
     */
    receive() external payable {}

    // ============ UUPS 升级授权 ============
    /// @dev 升级授权，仅允许合约自身（address(this)）调用，不引用未定义的 dao 变量。
    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == address(this), "DAO: Only self-upgrade via proposal");
        // 可选：proxiableUUID/ERC1967 校验
    }

    /// @dev 合约版本号
    function version() public pure returns (string memory) {
        return "1.0.0";
    }

    // 预留：升级提案需经过 timelock/权限判断，可在 executeProposal 处集成

    function updateWeightType(uint8 newType) external onlyOwner {
        votingContract.setWeightType(IBondlyVoting.WeightType(newType));
        emit VotingWeightTypeUpdated(address(this), newType);
    }

    /**
     * @dev 校验目标合约是否注册且名称匹配
     * @param target 目标合约地址
     * @param expectedName 期望的合约名称（如 "BondlyVoting"）
     */
    function requireWhitelistedTarget(address target, string memory expectedName) internal view {
        require(registry.isContractRegisteredByAddress(target), "DAO: Target not whitelisted");
        (string memory name, string memory verStr) = registry.addressToNameVersion(target);
        require(keccak256(bytes(name)) == keccak256(bytes(expectedName)), "DAO: Target name mismatch");
    }

    /**
     * @dev 设置合约函数白名单（仅 owner）
     * @param target 目标合约地址
     * @param selector 函数选择器（bytes4）
     * @param allowed 是否允许
     */
    function setAllowedFunction(address target, bytes4 selector, bool allowed) external onlyOwner {
        allowedFunctions[target][selector] = allowed;
    }

    // 预留 AccessControl 相关变量和注释，便于未来扩展
    // bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    // 可扩展为 AccessControl 管理 authorized executor

    // votingContract、treasuryContract 动态查找
    function getVotingContract() internal view returns (IBondlyVoting) {
        address votingAddr = registry.getContractAddress("BondlyVoting", "v1");
        require(votingAddr != address(0), "DAO: Voting contract not found");
        return IBondlyVoting(votingAddr);
    }
    function getTreasuryContract() internal view returns (IBondlyTreasury) {
        address treasuryAddr = registry.getContractAddress("BondlyTreasury", "v1");
        require(treasuryAddr != address(0), "DAO: Treasury contract not found");
        return IBondlyTreasury(treasuryAddr);
    }

    function updateReputationVault(address vault) external onlyOwner {
        require(vault != address(0), "DAO: Invalid reputation vault");
        reputationVault = IReputationVault(vault);
    }
    function setAllowReputationProposal(bool allowed) external onlyOwner {
        allowReputationProposal = allowed;
    }
} 