// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title BondlyRegistry 接口
 * @dev 仅包含 ContentNFT 需要的最小接口
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name) external view returns (address);
}

/**
 * @title ContentNFT
 * @dev 用户内容铸造为 NFT，支持元数据、创作者追踪，集成 BondlyRegistry，基于 ERC721URIStorage
 *
 * 功能特性：
 * - 每篇内容可铸造成唯一 NFT
 * - NFT 元数据包含标题、摘要、封面图、IPFS 链接
 * - 支持每个 NFT 独立的 tokenURI（如 IPFS JSON 链接）
 * - 自动记录创作者地址
 * - 可通过 BondlyRegistry 查询合约地址
 * - 暂停机制（紧急情况）
 * - 角色权限管理
 *
 * @notice 适用于 Bondly 平台内容资产化场景
 * @author Bondly Team
 * @custom:security-contact security@bondly.com
 */
contract ContentNFT is ERC721URIStorage, AccessControl, Pausable {
    // 角色定义
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @dev 内容 NFT 计数器（tokenId 自增）
    uint256 private _tokenIdCounter;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /// @dev NFT 元数据结构体
    struct ContentMeta {
        string title;      // 内容标题
        string summary;    // 内容摘要
        string coverImage; // 封面图链接
        string ipfsLink;   // IPFS 上的详细内容链接
        address creator;   // 创作者地址
    }

    /// @dev tokenId => ContentMeta
    mapping(uint256 => ContentMeta) private _contentMetas;

    /**
     * @dev NFT 铸造事件
     * @param to 接收者地址
     * @param tokenId NFT ID
     * @param creator 创作者地址
     * @param tokenURI NFT 元数据 JSON 链接
     * @notice 每次内容被铸造为 NFT 时触发
     */
    event ContentMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

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

    string private _baseTokenURI;

    /**
     * @dev 构造函数
     * @param name NFT 名称
     * @param symbol NFT 符号
     * @param initialOwner 初始 owner
     * @param registryAddress BondlyRegistry 合约地址
     *
     * @notice 部署时需指定注册表地址，便于集成
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address registryAddress
    ) ERC721(name, symbol) {
        registry = registryAddress;
        
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
    }

    /**
     * @dev 铸造内容 NFT（需要 MINTER_ROLE）
     * @param to 接收者地址
     * @param title 内容标题
     * @param summary 内容摘要
     * @param coverImage 封面图链接
     * @param ipfsLink IPFS 上的详细内容链接
     * @param tokenUri NFT 元数据 JSON 链接（如 IPFS JSON）
     *
     * @notice 创作者自动记录为 msg.sender
     * @notice 铸造后会触发 ContentMinted 事件
     *
     * @custom:security to 不能为零地址
     * @custom:security tokenUri 应为有效的 JSON 链接
     */
    function mint(
        address to,
        string memory title,
        string memory summary,
        string memory coverImage,
        string memory ipfsLink,
        string memory tokenUri
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenUri).length > 0, "tokenURI required");
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        require(!_exists(tokenId), "Already minted");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _contentMetas[tokenId] = ContentMeta({
            title: title,
            summary: summary,
            coverImage: coverImage,
            ipfsLink: ipfsLink,
            creator: msg.sender
        });
        emit ContentMinted(to, tokenId, tokenUri);
        return tokenId;
    }

    /**
     * @dev 获取 NFT 元数据结构体
     * @param tokenId NFT ID
     * @return ContentMeta 结构体
     *
     * @notice 可用于链上查询内容详情
     * @custom:security tokenId 必须存在
     */
    function getContentMeta(uint256 tokenId) external view returns (ContentMeta memory) {
        require(_ownerOf(tokenId) != address(0), "Query for nonexistent token");
        return _contentMetas[tokenId];
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
    
    // ============ 重写函数以支持暂停 ============
    
    /**
     * @dev 重写 transferFrom 函数以支持暂停
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721, IERC721) whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }
    
    /**
     * @dev 重写 safeTransferFrom 函数以支持暂停
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override(ERC721, IERC721) whenNotPaused {
        super.safeTransferFrom(from, to, tokenId, data);
    }
    
    /**
     * @dev 重写 approve 函数以支持暂停
     */
    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) whenNotPaused {
        super.approve(to, tokenId);
    }
    
    /**
     * @dev 重写 setApprovalForAll 函数以支持暂停
     */
    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721, IERC721) whenNotPaused {
        super.setApprovalForAll(operator, approved);
    }
    
    // ============ 支持 AccessControl ============
    
    /**
     * @dev 支持 ERC165 接口检测
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setBaseURI(string memory uri) external onlyRole(MINTER_ROLE) {
        _baseTokenURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
} 