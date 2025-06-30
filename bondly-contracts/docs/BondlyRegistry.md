# BondlyRegistry 合约文档

## 概述

BondlyRegistry 合约用于集中管理 Bondly 平台各模块合约的地址，实现合约寻址、升级和统一治理。所有核心合约（如 Token、NFT、DAO、Reputation 等）部署后地址都应注册到本合约，便于前端和其他合约统一查找和升级。

- 权限由 Ownable 控制，只有 owner 可注册、更新、删除合约地址
- 所有变更均有事件追踪，便于链上分析和前端监听

## 主要功能
- 注册、更新合约地址
- 查询合约地址
- 删除合约地址
- 事件追踪

## 合约接口

### 构造函数
```solidity
constructor(address initialOwner)
```
- **initialOwner**: 初始所有者地址，将拥有注册表的管理权限
- 部署时指定 owner，后续可转为多签/DAO

### 设置/更新合约地址
```solidity
function setContractAddress(string calldata name, address newAddress) external onlyOwner;
```
- **name**: 合约名称（如 "BondlyToken"）
- **newAddress**: 新的合约地址
- 只有 owner 可调用
- 注册或更新合约地址，原地址会被覆盖
- newAddress 不能为零地址
- 会触发 ContractAddressUpdated 事件
- 安全性：确保 name 非空，newAddress 不为零地址

### 查询合约地址
```solidity
function getContractAddress(string calldata name) external view returns (address);
```
- **name**: 合约名称
- 返回注册的合约地址（未注册时为 0）
- 任何人都可以调用

### 删除合约地址
```solidity
function removeContractAddress(string calldata name) external onlyOwner;
```
- **name**: 合约名称
- 只有 owner 可调用
- 删除后该名称对应的地址为 0
- 会触发 ContractAddressUpdated 事件，newAddress 为 0
- 安全性：确保该名称已注册

### 事件
```solidity
event ContractAddressUpdated(string indexed name, address indexed oldAddress, address indexed newAddress);
```
- **name**: 合约名称（如 "BondlyToken"）
- **oldAddress**: 旧的合约地址
- **newAddress**: 新的合约地址（删除时为 0）
- 每次注册、更新或删除合约地址时触发，便于链上追踪和前端监听

## 用法示例

1. **注册/更新合约地址**
```solidity
registry.setContractAddress("BondlyToken", 0x1234...);
```

2. **查询合约地址**
```solidity
address token = registry.getContractAddress("BondlyToken");
```

3. **删除合约地址**
```solidity
registry.removeContractAddress("BondlyToken");
```

## 设计说明与安全性
- 支持任意 key（如 "BondlyToken"、"BondlyNFT"、"BondlyDAO"），未来新模块无需改代码
- 只有 owner（可升级为多签/DAO）可修改，防止恶意篡改
- 所有变更有事件，便于前端监听和链上分析
- 前端/其他合约可通过 `getContractAddress("BondlyToken")` 获取最新地址
- 注册、更新、删除操作均有严格的参数校验，防止误操作

## 扩展建议
- owner 可转为多签/DAO
- 支持批量注册、版本管理
- 可扩展合约类型校验

