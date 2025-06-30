// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 AchievementNFT 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title AchievementNFT
 * @dev 不可转让的成就 NFT（Soulbound Token），用于奖励用户在 Bondly 平台的活跃与成就
 *
 * 功能特性：
 * - owner 可为用户颁发不同类型的成就 NFT
 * - 每类成就有唯一 achievementId，同一地址不能重复领取
 * - NFT 不可转让，仅可铸造和销毁
 * - 支持 tokenURI 设置每个成就 NFT 的元数据
 * - 集成 BondlyRegistry 统一寻址
 *
 * @notice 适用于 Web3 社交平台的成就激励体系
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract AchievementNFT is ERC721Enumerable, Ownable {
    /// @dev 成就 NFT 计数器（tokenId 自增）
    uint256 private _tokenIdCounter;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /// @dev tokenId => 成就ID
    mapping(uint256 => uint256) public achievementOf;

    /// @dev user => achievementId => 是否已领取
    mapping(address => mapping(uint256 => bool)) public hasAchievement;

    /// @dev tokenId => tokenURI
    mapping(uint256 => string) private _tokenURIs;

    /// @dev tokenId => 铸造时间戳
    mapping(uint256 => uint256) public mintedAt;

    /**
     * @dev 成就 NFT 铸造事件
     * @param user 获得成就的用户
     * @param achievementId 成就类型ID
     * @param tokenId NFT ID
     */
    event AchievementMinted(address indexed user, uint256 indexed achievementId, uint256 indexed tokenId);

    /**
     * @dev 构造函数
     * @param name NFT 名称
     * @param symbol NFT 符号
     * @param initialOwner 初始 owner
     * @param registryAddress BondlyRegistry 合约地址
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address registryAddress
    ) ERC721(name, symbol) Ownable(initialOwner) {
        registry = registryAddress;
    }

    /**
     * @dev 颁发成就 NFT（仅 owner）
     * @param to 获得成就的用户地址
     * @param achievementId 成就类型ID（如 1=活跃作者，2=点赞达人）
     * @param tokenUri NFT 元数据链接（如 IPFS JSON）
     *
     * @notice 同一地址不能领取同一成就多次
     * @notice 铸造后触发 AchievementMinted 事件
     */
    function mintAchievement(address to, uint256 achievementId, string memory tokenUri) external onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(!hasAchievement[to][achievementId], "Already claimed");
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        achievementOf[tokenId] = achievementId;
        hasAchievement[to][achievementId] = true;
        _tokenURIs[tokenId] = tokenUri;
        mintedAt[tokenId] = block.timestamp;
        emit AchievementMinted(to, achievementId, tokenId);
        return tokenId;
    }

    /**
     * @dev 获取 NFT 的元数据 JSON 链接
     * @param tokenId NFT ID
     * @return tokenURI 链接
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Soulbound：禁止转让、批准、授权
     */
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }
    function getApproved(uint256) public pure override(ERC721, IERC721) returns (address) {
        return address(0);
    }
    function isApprovedForAll(address, address) public pure override(ERC721, IERC721) returns (bool) {
        return false;
    }
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }

    /**
     * @dev 可选：owner 可销毁成就 NFT
     * @param tokenId NFT ID
     */
    function burn(uint256 tokenId) external onlyOwner {
        address owner = ownerOf(tokenId);
        uint256 achievementId = achievementOf[tokenId];
        hasAchievement[owner][achievementId] = false;
        _burn(tokenId);
        delete achievementOf[tokenId];
        delete _tokenURIs[tokenId];
    }

    /**
     * @dev 查询用户所持有的所有成就 NFT
     * @param user 用户地址
     * @return tokenIds 该用户所有 NFT 的 tokenId 数组
     * @return achievementIds 对应的 achievementId 数组
     */
    function getUserAchievements(address user) external view returns (uint256[] memory tokenIds, uint256[] memory achievementIds) {
        uint256 balance = balanceOf(user);
        tokenIds = new uint256[](balance);
        achievementIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            tokenIds[i] = tokenId;
            achievementIds[i] = achievementOf[tokenId];
        }
    }
} 