// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 InteractionStaking 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title ContentNFT 元数据接口
 * @dev 仅包含 InteractionStaking 需要的最小接口
 */
interface IContentNFT {
    struct ContentMeta {
        string title;
        string summary;
        string coverImage;
        string ipfsLink;
        address creator;
    }
    function getContentMeta(uint256 tokenId) external view returns (ContentMeta memory);
}

/**
 * @title InteractionStaking
 * @dev 用户互动质押合约，支持点赞、评论、收藏等多种互动类型，奖励内容创作者
 *
 * 功能特性：
 * - 用户互动需质押 BondlyToken，不同类型金额不同
 * - 记录每个用户对每个内容 NFT 的质押明细
 * - 支持用户撤回未结算质押
 * - 内容创作者可领取互动奖励
 * - 通过 BondlyRegistry 获取 BondlyToken、ContentNFT 地址
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 *
 * @notice 适用于 Bondly 平台内容互动激励场景
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract InteractionStaking is AccessControl, Pausable {
    // 角色定义
    bytes32 public constant PARAMETER_ROLE = keccak256("PARAMETER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @dev 互动类型枚举
    enum InteractionType { Like, Comment, Favorite }

    /// @dev 互动类型 => 质押金额（单位：wei）
    mapping(InteractionType => uint256) public stakeAmounts;

    /// @dev 用户互动质押记录：用户 => tokenId => 互动类型 => 质押金额
    mapping(address => mapping(uint256 => mapping(InteractionType => uint256))) public userStakes;

    /// @dev 内容 NFT 每个 tokenId、互动类型累计质押总额
    mapping(uint256 => mapping(InteractionType => uint256)) public totalStakedPerToken;

    /// @dev 用户是否已互动（防止重复质押）
    mapping(address => mapping(uint256 => mapping(InteractionType => bool))) public hasInteracted;

    /// @dev 是否已领取奖励：tokenId => interactionType => bool
    mapping(uint256 => mapping(InteractionType => bool)) public rewardClaimed;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /**
     * @dev 互动质押事件
     * @param user 互动用户
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     * @param amount 质押金额
     */
    event InteractionStaked(address indexed user, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);

    /**
     * @dev 互动质押撤回事件
     * @param user 互动用户
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     * @param amount 撤回金额
     */
    event InteractionWithdrawn(address indexed user, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);

    /**
     * @dev 创作者领取奖励事件
     * @param creator 创作者地址
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     * @param amount 领取金额
     */
    event RewardClaimed(address indexed creator, uint256 indexed tokenId, InteractionType indexed interactionType, uint256 amount);

    /**
     * @dev 质押金额更新事件
     * @param interactionType 互动类型
     * @param oldAmount 旧金额
     * @param newAmount 新金额
     */
    event StakeAmountUpdated(InteractionType indexed interactionType, uint256 oldAmount, uint256 newAmount);

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

    /**
     * @dev 构造函数
     * @param registryAddress BondlyRegistry 合约地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address registryAddress, address initialOwner) {
        registry = registryAddress;
        
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(PARAMETER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        // 默认质押金额（可后续通过 setStakeAmount 调整）
        stakeAmounts[InteractionType.Like] = 1 ether;      // 1 BOND
        stakeAmounts[InteractionType.Comment] = 2 ether;   // 2 BOND
        stakeAmounts[InteractionType.Favorite] = 3 ether;  // 3 BOND
    }

    /**
     * @dev 设置各互动类型的质押金额（需要 PARAMETER_ROLE）
     * @param interactionType 互动类型
     * @param amount 质押金额（单位：wei）
     */
    function setStakeAmount(InteractionType interactionType, uint256 amount) external onlyRole(PARAMETER_ROLE) {
        uint256 oldAmount = stakeAmounts[interactionType];
        stakeAmounts[interactionType] = amount;
        emit StakeAmountUpdated(interactionType, oldAmount, amount);
    }

    /**
     * @dev 用户进行互动并质押 BOND
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     *
     * @notice 用户需提前 approve 足够的 BOND 给本合约
     * @custom:security tokenId 必须存在，且不能重复互动
     */
    function stakeInteraction(uint256 tokenId, InteractionType interactionType) external whenNotPaused {
        require(!hasInteracted[msg.sender][tokenId][interactionType], "Already interacted");
        address contentNFT = IBondlyRegistry(registry).getContractAddress("CONTENT_NFT");
        require(IERC721(contentNFT).ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 amount = stakeAmounts[interactionType];
        require(amount > 0, "Stake amount not set");
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        require(IERC20(bondToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        userStakes[msg.sender][tokenId][interactionType] = amount;
        totalStakedPerToken[tokenId][interactionType] += amount;
        hasInteracted[msg.sender][tokenId][interactionType] = true;
        emit InteractionStaked(msg.sender, tokenId, interactionType, amount);
    }

    /**
     * @dev 用户撤回未结算的质押（如取消点赞）
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     *
     * @notice 仅未被创作者领取奖励前可撤回
     */
    function withdrawInteraction(uint256 tokenId, InteractionType interactionType) external whenNotPaused {
        require(hasInteracted[msg.sender][tokenId][interactionType], "No stake");
        require(!rewardClaimed[tokenId][interactionType], "Reward already claimed");
        uint256 amount = userStakes[msg.sender][tokenId][interactionType];
        require(amount > 0, "Nothing to withdraw");
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        userStakes[msg.sender][tokenId][interactionType] = 0;
        totalStakedPerToken[tokenId][interactionType] -= amount;
        hasInteracted[msg.sender][tokenId][interactionType] = false;
        require(IERC20(bondToken).transfer(msg.sender, amount), "Transfer failed");
        emit InteractionWithdrawn(msg.sender, tokenId, interactionType, amount);
    }

    /**
     * @dev 创作者领取某内容 NFT 的互动奖励
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     *
     * @notice 只有内容创作者可领取
     */
    function claimReward(uint256 tokenId, InteractionType interactionType) external whenNotPaused {
        address contentNFT = IBondlyRegistry(registry).getContractAddress("CONTENT_NFT");
        IContentNFT.ContentMeta memory meta = IContentNFT(contentNFT).getContentMeta(tokenId);
        address creator = meta.creator;
        require(msg.sender == creator, "Not creator");
        require(!rewardClaimed[tokenId][interactionType], "Already claimed");
        uint256 amount = totalStakedPerToken[tokenId][interactionType];
        require(amount > 0, "No reward");
        address bondToken = IBondlyRegistry(registry).getContractAddress("BondlyToken");
        totalStakedPerToken[tokenId][interactionType] = 0;
        rewardClaimed[tokenId][interactionType] = true;
        require(IERC20(bondToken).transfer(creator, amount), "Transfer failed");
        emit RewardClaimed(creator, tokenId, interactionType, amount);
    }

    /**
     * @dev 查询用户对某内容 NFT 的质押金额
     * @param user 用户地址
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     * @return 质押金额
     */
    function getUserStake(address user, uint256 tokenId, InteractionType interactionType) external view returns (uint256) {
        return userStakes[user][tokenId][interactionType];
    }

    /**
     * @dev 查询某内容 NFT 的累计质押总额
     * @param tokenId 内容 NFT ID
     * @param interactionType 互动类型
     * @return 总质押金额
     */
    function getTotalStaked(uint256 tokenId, InteractionType interactionType) external view returns (uint256) {
        return totalStakedPerToken[tokenId][interactionType];
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
     * @dev 紧急提取合约中的代币（仅管理员）
     * @param token 代币地址
     * @param to 接收地址
     * @param amount 提取金额
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(IERC20(token).transfer(to, amount), "Transfer failed");
    }
} 