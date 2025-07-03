# BondlyTokenUpgradeable

BondlyTokenUpgradeable 是 Bondly 平台的原生代币合约，基于 OpenZeppelin UUPS 可升级标准，支持 ERC20、ERC20Permit、ERC20Votes、角色权限、暂停机制等功能。

## 合约特性 Features

- **UUPS 可升级（Upgradeable, UUPS）**：支持合约逻辑升级，数据不变，升级权限由 onlyOwner 控制。
- **ERC20 标准**：支持标准转账、授权、余额查询等。
- **ERC20Permit**：支持 EIP-2612，无 gas 授权。
- **ERC20Votes**：支持治理快照、投票权重。
- **角色权限管理**：基于 AccessControl，支持 MINTER/BURNER/PAUSER 角色。
- **暂停机制**：紧急情况下可暂停所有转账和授权。
- **批量铸造、用户自助销毁/领取奖励**。

---

## 初始化 Initialization

```solidity
function initialize(address initialOwner) public initializer
```
- 仅可调用一次（UUPS 标准）。
- 设置初始 owner，分配所有角色权限。
- 自动铸造 10 亿 BOND 给初始 owner。

---

## 主要角色 Roles

- `DEFAULT_ADMIN_ROLE`：合约超级管理员。
- `MINTER_ROLE`：可铸造新代币。
- `BURNER_ROLE`：可销毁代币。
- `PAUSER_ROLE`：可暂停/恢复合约。
- `onlyOwner`：UUPS 升级权限。

---

## 主要常量 Constants

- `INITIAL_SUPPLY = 1_000_000_000 * 10**18`：初始供应量。
- `MAX_SUPPLY = 2_000_000_000 * 10**18`：最大供应量。

---

## 主要事件 Events

- `TokensMinted(address to, uint256 amount, string reason)`
- `TokensBurned(address from, uint256 amount, string reason)`
- `ContractPaused(address account, string reason)`
- `ContractUnpaused(address account)`

---

## 主要函数 Functions

### 铸造/销毁
- `mint(address to, uint256 amount, string reason)`：MINTER_ROLE，单地址铸造。
- `batchMint(address[] recipients, uint256[] amounts, string reason)`：MINTER_ROLE，批量铸造。
- `burn(address from, uint256 amount, string reason)`：BURNER_ROLE，销毁。
- `selfMint(uint256 amount, string reason)`：MINTER_ROLE，用户自助领取。
- `selfBurn(uint256 amount, string reason)`：用户自助销毁。

### 转账/授权
- `transfer(address to, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

### 暂停/恢复
- `pause(string reason)`：PAUSER_ROLE
- `unpause()`：PAUSER_ROLE

### 查询
- `getTokenInfo()`：返回名称、符号、小数位、当前供应、最大供应。
- `mintableSupply()`：剩余可铸数量。

### 升级
- `_authorizeUpgrade(address newImplementation)`：仅 owner 可升级。

---

## 升级说明 Upgradeability

- 本合约采用 UUPS 升级模式，需通过 Proxy 部署。
- 升级权限由 onlyOwner 控制，建议 owner 为多签或 DAO。
- 升级流程：部署新实现合约 → 通过 Proxy 调用 upgradeTo → Registry 记录新版本。

---

## 典型用法 Usage

1. 通过 Hardhat + OpenZeppelin Upgrades 插件部署 UUPS Proxy。
2. 初始化时传入初始 owner 地址。
3. 通过 Registry 管理多版本 Proxy 地址。
4. 通过角色权限安全管理铸造、销毁、暂停、升级。

---

## 重要安全提示 Security Notes

- 升级权限建议交由多签或 DAO。
- 所有敏感操作均有角色权限控制。
- 合约升级前请充分测试和审计。

---

## English Summary

BondlyTokenUpgradeable is an upgradable (UUPS) ERC20 token contract for the Bondly platform, supporting ERC20, ERC20Permit, ERC20Votes, role-based access control, pausing, batch minting, and self-service mint/burn. All upgrade logic is protected by onlyOwner. Use with a proxy and manage versions via BondlyRegistry.

