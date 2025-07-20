// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ContentNFTV2
 * @dev 改进的内容NFT合约，支持用户自主铸造
 * @notice 用户可以支付费用来铸造自己的内容NFT
 */
contract ContentNFTV2 is ERC721, ERC721URIStorage, AccessControl, Pausable {
    using Counters for Counters.Counter;

    // 角色定义
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @dev 内容 NFT 计数器（tokenId 自增）
    Counters.Counter private _tokenIdCounter;

    /// @dev BondlyRegistry 合约地址
    address public registry;

    /// @dev 铸造费用（以wei为单位）
    uint256 public mintFee = 0.01 ether; // 默认0.01 ETH

    /// @dev 费用接收地址
    address public feeReceiver;

    /// @dev NFT 元数据结构体
    struct ContentMeta {
        string title;      // 内容标题
        string summary;    // 内容摘要
        string coverImage; // 封面图链接
        string ipfsLink;   // IPFS 上的详细内容链接
        address creator;   // 创作者地址
        uint256 mintedAt;  // 铸造时间
    }

    /// @dev tokenId => ContentMeta
    mapping(uint256 => ContentMeta) private _contentMetas;

    /// @dev 用户铸造的NFT数量
    mapping(address => uint256) public userMintCount;

    /**
     * @dev NFT 铸造事件
     * @param to 接收者地址
     * @param tokenId NFT ID
     * @param tokenURI NFT 元数据 JSON 链接
     * @param fee 支付的铸造费用
     */
    event ContentMinted(
        address indexed to, 
        uint256 indexed tokenId, 
        string tokenURI, 
        uint256 fee
    );

    /**
     * @dev 铸造费用更新事件
     * @param oldFee 旧费用
     * @param newFee 新费用
     */
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev 费用接收地址更新事件
     * @param oldReceiver 旧接收地址
     * @param newReceiver 新接收地址
     */
    event FeeReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    /**
     * @dev 构造函数
     * @param name NFT 名称
     * @param symbol NFT 符号
     * @param initialOwner 初始 owner
     * @param registryAddress BondlyRegistry 合约地址
     * @param _feeReceiver 费用接收地址
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address registryAddress,
        address _feeReceiver
    ) ERC721(name, symbol) {
        registry = registryAddress;
        feeReceiver = _feeReceiver;
        
        // 设置角色权限
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
    }

    /**
     * @dev 用户自主铸造内容NFT（需要支付费用）
     * @param to 接收者地址
     * @param title 内容标题
     * @param summary 内容摘要
     * @param coverImage 封面图链接
     * @param ipfsLink IPFS 上的详细内容链接
     * @param tokenUri NFT 元数据 JSON 链接
     */
    function mintWithFee(
        address to,
        string memory title,
        string memory summary,
        string memory coverImage,
        string memory ipfsLink,
        string memory tokenUri
    ) external payable whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenUri).length > 0, "tokenURI required");
        require(msg.value >= mintFee, "Insufficient mint fee");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        
        _contentMetas[tokenId] = ContentMeta({
            title: title,
            summary: summary,
            coverImage: coverImage,
            ipfsLink: ipfsLink,
            creator: msg.sender,
            mintedAt: block.timestamp
        });

        // 更新用户铸造计数
        userMintCount[msg.sender]++;

        // 转移铸造费用
        if (msg.value > 0) {
            (bool success, ) = feeReceiver.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }

        emit ContentMinted(to, tokenId, tokenUri, msg.value);
        return tokenId;
    }

    /**
     * @dev 管理员铸造内容NFT（免费，需要 MINTER_ROLE）
     * @param to 接收者地址
     * @param title 内容标题
     * @param summary 内容摘要
     * @param coverImage 封面图链接
     * @param ipfsLink IPFS 上的详细内容链接
     * @param tokenUri NFT 元数据 JSON 链接
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
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        
        _contentMetas[tokenId] = ContentMeta({
            title: title,
            summary: summary,
            coverImage: coverImage,
            ipfsLink: ipfsLink,
            creator: msg.sender,
            mintedAt: block.timestamp
        });

        emit ContentMinted(to, tokenId, tokenUri, 0);
        return tokenId;
    }

    /**
     * @dev 获取 NFT 元数据结构体
     * @param tokenId NFT ID
     * @return ContentMeta 结构体
     */
    function getContentMeta(uint256 tokenId) external view returns (ContentMeta memory) {
        require(_ownerOf(tokenId) != address(0), "Query for nonexistent token");
        return _contentMetas[tokenId];
    }

    /**
     * @dev 更新铸造费用（需要 ADMIN_ROLE）
     * @param newFee 新费用
     */
    function setMintFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        uint256 oldFee = mintFee;
        mintFee = newFee;
        emit MintFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev 更新费用接收地址（需要 ADMIN_ROLE）
     * @param newReceiver 新接收地址
     */
    function setFeeReceiver(address newReceiver) external onlyRole(ADMIN_ROLE) {
        require(newReceiver != address(0), "Invalid receiver address");
        address oldReceiver = feeReceiver;
        feeReceiver = newReceiver;
        emit FeeReceiverUpdated(oldReceiver, newReceiver);
    }

    /**
     * @dev 获取当前铸造费用
     * @return 铸造费用
     */
    function getMintFee() external view returns (uint256) {
        return mintFee;
    }

    /**
     * @dev 获取用户铸造的NFT数量
     * @param user 用户地址
     * @return 铸造数量
     */
    function getUserMintCount(address user) external view returns (uint256) {
        return userMintCount[user];
    }

    /**
     * @dev 暂停合约（需要 PAUSER_ROLE）
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev 恢复合约（需要 PAUSER_ROLE）
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev 获取总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // 重写必要的函数
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete _contentMetas[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 