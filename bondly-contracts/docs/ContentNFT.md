# ContentNFT 合约文档

## 概述

ContentNFT 合约用于将用户生成的内容（如图文、文章等）铸造成独一无二的 NFT，实现内容资产化、创作者确权和内容流通。每个 NFT 记录内容元数据（标题、摘要、封面图、IPFS 链接）和创作者地址，支持每个 NFT 独立的元数据 JSON 链接（tokenURI），并集成 BondlyRegistry 统一寻址。

- 基于 OpenZeppelin ERC721URIStorage、Ownable
- 每篇内容可唯一铸造成 NFT
- 支持内容元数据和创作者追踪
- 每个 NFT 支持独立的 tokenURI（如 IPFS JSON 链接）

## 主要功能
- 内容铸造为 NFT，自动记录创作者
- NFT 元数据包含标题、摘要、封面图、IPFS 链接
- 每个 NFT 支持独立的元数据 JSON 链接
- 支持 tokenURI 查询 JSON 元数据链接

## 合约接口

### 构造函数
```solidity
constructor(string memory name, string memory symbol, address initialOwner, address registryAddress)
```
- **name**: NFT 名称
- **symbol**: NFT 符号
- **initialOwner**: 初始 owner
- **registryAddress**: BondlyRegistry 合约地址
- 部署时需指定注册表地址，便于集成

### 铸造内容 NFT
```solidity
function mint(address to, string memory title, string memory summary, string memory coverImage, string memory ipfsLink, string memory tokenUri) external returns (uint256);
```
- **to**: 接收者地址
- **title**: 内容标题
- **summary**: 内容摘要
- **coverImage**: 封面图链接
- **ipfsLink**: IPFS 上的详细内容链接
- **tokenUri**: NFT 元数据 JSON 链接（如 IPFS JSON）
- 创作者自动记录为 msg.sender
- 铸造后触发 ContentMinted 事件
- 安全性：to 不能为零地址，tokenUri 必须有效
- 返回新 NFT 的 tokenId

### 查询 NFT 元数据结构体
```solidity
function getContentMeta(uint256 tokenId) external view returns (ContentMeta memory);
```
- **tokenId**: NFT ID
- 返回 ContentMeta 结构体（包含标题、摘要、封面图、IPFS 链接、创作者）
- tokenId 必须存在

### 获取 NFT 的元数据 JSON 链接
```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory);
```
- **tokenId**: NFT ID
- 返回 mint 时设置的 JSON 链接（如 ipfs://.../xxx.json）
- tokenId 必须存在

## 事件

### ContentMinted
```solidity
event ContentMinted(address indexed to, uint256 indexed tokenId, address indexed creator, string tokenURI);
```
- **to**: 接收者地址
- **tokenId**: NFT ID
- **creator**: 创作者地址
- **tokenURI**: NFT 元数据 JSON 链接
- 每次内容被铸造为 NFT 时触发

## 用法示例

1. **铸造内容 NFT**
```solidity
contentNFT.mint(
    userAddress,
    "我的第一篇内容",
    "这是摘要",
    "https://example.com/cover.jpg",
    "ipfs://Qm.../detail.html",
    "ipfs://Qm.../1.json"
);
```

2. **查询 NFT 元数据**
```solidity
ContentMeta memory meta = contentNFT.getContentMeta(tokenId);
```

3. **获取 NFT 元数据 JSON 链接**
```solidity
string memory uri = contentNFT.tokenURI(tokenId); // 例：ipfs://Qm.../1.json
```

## 设计说明与安全性
- 每个 NFT 记录内容元数据和创作者，便于确权和溯源
- 每个 NFT 支持独立的元数据 JSON 链接，灵活适配内容平台需求
- mint 操作有严格参数校验，防止误操作
- 可与 BondlyRegistry、BondlyToken、声誉系统等模块联动

## 扩展建议
- 支持批量铸造、内容授权、二级市场等功能
- 可扩展内容类型、链下存证、版税分成等

- 所有注册表接口如有描述，统一为 getContractAddress(string memory name, string memory version)。
- MINTER_ROLE、PAUSER_ROLE 权限与合约一致。
- 事件、变量命名与合约一致。 