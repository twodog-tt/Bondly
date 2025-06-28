# BondlyToken 合约文档

## 概述

BondlyToken

## 函数

### mint

**说明**: 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 * @custom:security-contact security@bondly.com 当合约所有者铸造新代币时触发 当合约所有者销毁代币时触发 部署时会自动铸造初始供应量给合约所有者
     * @notice 代币名称为 "Bondly Token"，符号为 "BONDLY" 只有合约所有者可以调用此函数
     * @notice 铸造数量不能超过最大供应量限制
     * @notice 会触发 TokensMinted 事件
     * 
     * @custom:security 确保 to 地址不为零地址
     * @custom:security 确保铸造后总供应量不超过 MAX_SUPPLY

**开发者说明**: Bondly 平台代币，支持 ERC20 标准和 ERC20Permit 扩展
 * 
 * 功能特性：
 * - 标准 ERC20 功能（转账、授权等）
 * - ERC20Permit 支持（无 gas 授权）
 * - 铸造和销毁功能（仅限所有者）
 * - 社交激励相关功能预留
 * 
 * @notice 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 * @custom:security-contact security@bondly.com 代币铸造事件
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     * @notice 当合约所有者铸造新代币时触发 代币销毁事件
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     * @notice 当合约所有者销毁代币时触发 初始供应量：10亿代币
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    /// @dev 最大供应量：20亿代币
    uint256 public constant MAX_SUPPLY = 2_000_000_000 * 10**18;
    
    /**
     * @dev 构造函数，初始化代币合约
     * @param initialOwner 初始所有者地址，将拥有合约的管理权限
     * 
     * @notice 部署时会自动铸造初始供应量给合约所有者
     * @notice 代币名称为 "Bondly Token"，符号为 "BONDLY" 铸造代币（仅限所有者）
     * @param to 接收代币的地址
     * @param amount 要铸造的代币数量（以 wei 为单位）
     * @param reason 铸造原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice 铸造数量不能超过最大供应量限制
     * @notice 会触发 TokensMinted 事件
     * 
     * @custom:security 确保 to 地址不为零地址
     * @custom:security 确保铸造后总供应量不超过 MAX_SUPPLY

**参数**:
- `to`: 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     * @notice 当合约所有者铸造新代币时触发
- `from`: 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     * @notice 当合约所有者销毁代币时触发
- `initialOwner`: 初始所有者地址，将拥有合约的管理权限
     * 
     * @notice 部署时会自动铸造初始供应量给合约所有者
     * @notice 代币名称为 "Bondly Token"，符号为 "BONDLY"
- `to`: 接收代币的地址
     * @param amount 要铸造的代币数量（以 wei 为单位）
     * @param reason 铸造原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice 铸造数量不能超过最大供应量限制
     * @notice 会触发 TokensMinted 事件
     * 
     * @custom:security 确保 to 地址不为零地址
     * @custom:security 确保铸造后总供应量不超过 MAX_SUPPLY

---

### burn

**说明**: 只有合约所有者可以调用此函数
     * @notice 被销毁地址必须有足够的代币余额
     * @notice 会触发 TokensBurned 事件
     * 
     * @custom:security 确保 from 地址不为零地址
     * @custom:security 确保 from 地址有足够的余额

**开发者说明**: 销毁代币（仅限所有者）
     * @param from 要销毁代币的地址
     * @param amount 要销毁的代币数量（以 wei 为单位）
     * @param reason 销毁原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice 被销毁地址必须有足够的代币余额
     * @notice 会触发 TokensBurned 事件
     * 
     * @custom:security 确保 from 地址不为零地址
     * @custom:security 确保 from 地址有足够的余额

**参数**:
- `from`: 要销毁代币的地址
     * @param amount 要销毁的代币数量（以 wei 为单位）
     * @param reason 销毁原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice 被销毁地址必须有足够的代币余额
     * @notice 会触发 TokensBurned 事件
     * 
     * @custom:security 确保 from 地址不为零地址
     * @custom:security 确保 from 地址有足够的余额

---

### batchMint

**说明**: 只有合约所有者可以调用此函数
     * @notice recipients 和 amounts 数组长度必须相同
     * @notice 批量铸造的总量不能超过最大供应量限制
     * @notice 会为每个地址触发 TokensMinted 事件
     * 
     * @custom:security 确保数组长度匹配
     * @custom:security 确保所有地址不为零地址
     * @custom:security 确保批量铸造后总供应量不超过 MAX_SUPPLY
     * @custom:gas 注意：大量地址的批量操作可能消耗较多 gas

**开发者说明**: 批量铸造代币（仅限所有者）
     * @param recipients 接收代币的地址数组
     * @param amounts 对应的代币数量数组（以 wei 为单位）
     * @param reason 批量铸造原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice recipients 和 amounts 数组长度必须相同
     * @notice 批量铸造的总量不能超过最大供应量限制
     * @notice 会为每个地址触发 TokensMinted 事件
     * 
     * @custom:security 确保数组长度匹配
     * @custom:security 确保所有地址不为零地址
     * @custom:security 确保批量铸造后总供应量不超过 MAX_SUPPLY
     * @custom:gas 注意：大量地址的批量操作可能消耗较多 gas

**参数**:
- `recipients`: 接收代币的地址数组
     * @param amounts 对应的代币数量数组（以 wei 为单位）
     * @param reason 批量铸造原因，用于记录和追踪
     * 
     * @notice 只有合约所有者可以调用此函数
     * @notice recipients 和 amounts 数组长度必须相同
     * @notice 批量铸造的总量不能超过最大供应量限制
     * @notice 会为每个地址触发 TokensMinted 事件
     * 
     * @custom:security 确保数组长度匹配
     * @custom:security 确保所有地址不为零地址
     * @custom:security 确保批量铸造后总供应量不超过 MAX_SUPPLY
     * @custom:gas 注意：大量地址的批量操作可能消耗较多 gas

---

### getTokenInfo

**说明**: 这是一个便利函数，一次性返回代币的所有基本信息
     * @notice 适用于前端界面显示和 API 接口

**开发者说明**: 获取代币的完整信息
     * @return tokenName 代币名称
     * @return tokenSymbol 代币符号
     * @return tokenDecimals 代币小数位数
     * @return currentSupply 当前总供应量
     * @return maxSupply 最大供应量
     * 
     * @notice 这是一个便利函数，一次性返回代币的所有基本信息
     * @notice 适用于前端界面显示和 API 接口

**返回值**:
- tokenName 代币名称
     * @return tokenSymbol 代币符号
     * @return tokenDecimals 代币小数位数
     * @return currentSupply 当前总供应量
     * @return maxSupply 最大供应量
     * 
     * @notice 这是一个便利函数，一次性返回代币的所有基本信息
     * @notice 适用于前端界面显示和 API 接口

---

### decimals

**说明**: 这是 ERC20 标准的一部分，大多数代币使用 18 位小数
     * @notice 与以太坊的 ETH 保持一致，便于用户理解

**开发者说明**: 重写 decimals 函数，确保返回 18
     * @return 代币的小数位数，固定为 18
     * 
     * @notice 这是 ERC20 标准的一部分，大多数代币使用 18 位小数
     * @notice 与以太坊的 ETH 保持一致，便于用户理解

**返回值**:
- 代币的小数位数，固定为 18
     * 
     * @notice 这是 ERC20 标准的一部分，大多数代币使用 18 位小数
     * @notice 与以太坊的 ETH 保持一致，便于用户理解

---

## 事件

### TokensMinted

**说明**: 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 * @custom:security-contact security@bondly.com 当合约所有者铸造新代币时触发

**开发者说明**: Bondly 平台代币，支持 ERC20 标准和 ERC20Permit 扩展
 * 
 * 功能特性：
 * - 标准 ERC20 功能（转账、授权等）
 * - ERC20Permit 支持（无 gas 授权）
 * - 铸造和销毁功能（仅限所有者）
 * - 社交激励相关功能预留
 * 
 * @notice 这是一个可升级的代币合约，支持社交价值网络的激励机制
 * @author Bondly Team
 * @custom:security-contact security@bondly.com 代币铸造事件
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     * @notice 当合约所有者铸造新代币时触发

**参数**:
- `to`: 接收代币的地址
     * @param amount 铸造的代币数量
     * @param reason 铸造原因（如：用户奖励、社区激励等）
     * @notice 当合约所有者铸造新代币时触发

---

### TokensBurned

**说明**: 当合约所有者销毁代币时触发

**开发者说明**: 代币销毁事件
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     * @notice 当合约所有者销毁代币时触发

**参数**:
- `from`: 销毁代币的地址
     * @param amount 销毁的代币数量
     * @param reason 销毁原因（如：用户惩罚、通缩机制等）
     * @notice 当合约所有者销毁代币时触发

---

