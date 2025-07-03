// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./interfaces/IBondlyRegistry.sol";
import "./interfaces/IBondlyVoting.sol";
import "./interfaces/IBondlyTreasury.sol";
import "./interfaces/IBondlyDAO.sol";
import "../reputation/interfaces/IReputationVault.sol";
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
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(address(bondToken) != address(0), "DAO: Bond token not set");
        require(minProposalDeposit > 0, "DAO: Deposit not set");
        require(bondToken.allowance(msg.sender, address(this)) >= minProposalDeposit, "DAO: Approve BOND first");
        require(bondToken.balanceOf(msg.sender) >= minProposalDeposit, "DAO: Insufficient BOND");
        require(bytes(title).length > 0, "DAO: Empty title");
        require(bytes(description).length > 0, "DAO: Empty description");
        require(target != address(0), "DAO: Invalid target address");
        require(votingPeriod >= minVotingPeriod, "DAO: Voting period too short");
        require(votingPeriod <= maxVotingPeriod, "DAO: Voting period too long");
        // 转账 BOND 作为押金
        bondToken.transferFrom(msg.sender, address(this), minProposalDeposit);
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
                recordReputationSnapshots(proposalId);
            }
        }
        emit ProposalActivated(proposalId, proposal.snapshotBlock, proposal.votingDeadline);
    }
    
    /**
     * @dev 记录声誉快照（内部函数）
     * @param proposalId 提案ID
     */
    function recordReputationSnapshots(uint256 proposalId) internal {
        address reputationVault = registry.getContractAddress("ReputationVault", "v1");
        if (reputationVault == address(0)) return;
        
        // 这里可以根据需要记录特定用户的声誉快照
        // 目前先记录提案人的声誉快照作为示例
        Proposal storage proposal = proposals[proposalId];
        try IReputationVault(reputationVault).getReputation(proposal.proposer) returns (uint256 reputation) {
            IBondlyVoting(address(votingContract)).recordReputationSnapshot(proposalId, proposal.proposer, reputation);
        } catch {
            IBondlyVoting(address(votingContract)).recordReputationSnapshot(proposalId, proposal.proposer, 0);
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
        require(registry.isContractRegisteredByAddress(proposal.target), "DAO: Target not whitelisted");
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
                // 返还 50% 押金
                if (deposit > 0 && depositor != address(0)) {
                    uint256 refund = deposit / 2;
                    bondToken.transfer(depositor, refund);
                    // 其余转 Treasury
                    if (address(treasuryContract) != address(0)) {
                        bondToken.transfer(address(treasuryContract), deposit - refund);
                    }
                }
                emit ProposalExecuted(proposalId, true, proposal.executionTime);
            } else {
                // 全部转 Treasury
                if (deposit > 0 && address(treasuryContract) != address(0)) {
                    bondToken.transfer(address(treasuryContract), deposit);
                }
                emit ProposalFailed(proposalId);
                emit ProposalFailedWithReason(proposalId, revertReason);
            }
        } else {
            // 提案未通过，全部转 Treasury
            if (deposit > 0 && address(treasuryContract) != address(0)) {
                bondToken.transfer(address(treasuryContract), deposit);
            }
            proposal.state = ProposalState.Failed;
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
        
        if (support) {
            proposals[proposalId].yesVotes += weight;
        } else {
            proposals[proposalId].noVotes += weight;
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
        emit TreasuryContractUpdated(oldTreasury, newTreasuryContract);
    }
    
    /**
     * @dev 设置授权执行者
     * @param executor 执行者地址
     * @param authorized 是否授权
     */
    function setAuthorizedExecutor(address executor, bool authorized) external onlyOwner {
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
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 