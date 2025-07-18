# Bondly 合约脚本使用指南

本指南介绍 Bondly 项目中各种调试和管理脚本的使用方法。

## 📋 脚本分类

### 🔐 权限管理脚本

#### 检查管理员权限
```bash
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

**功能**: 检查当前钱包地址的质押合约权限
**输出**: 
- 角色权限状态 (DEFAULT_ADMIN_ROLE, REWARD_MANAGER_ROLE, PAUSER_ROLE)
- 当前质押状态
- 代币余额
- 操作建议

### 💰 余额和状态检查

#### 检查代币余额
```bash
npx hardhat run scripts/check-balance.ts --network sepolia
```

**功能**: 检查 BOND 代币和 ETH 余额
**输出**:
- 代币合约信息
- 账户余额详情
- 添加代币到钱包的指导

#### 检查已部署合约
```bash
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

**功能**: 检查所有已部署合约的状态
**输出**:
- 合约地址列表
- 合约基本信息
- 权限配置

### 🚀 质押流动性管理

#### 添加质押奖励
```bash
npx hardhat run scripts/add-staking-liquidity.ts --network sepolia
```

**功能**: 为质押合约添加 BOND 代币作为奖励
**操作**:
1. 自动授权代币使用
2. 设置奖励金额和持续时间
3. 计算和显示 APY
4. 验证操作结果

#### 前端管理界面

**功能**: 通过前端界面管理质押流动性
**访问**: 使用管理员账户登录质押页面
**特性**:
- 🔐 实时权限验证
- 💰 质押状态监控 (APY, 奖励池余额, 总质押量)
- 🚀 一键添加流动性
- 🎨 完全英文化界面
- 📱 响应式设计

**管理员地址**: `0xBC6B35213374A3D64E25ef1bAeFd5A8eb9031E4A`

### 🏗️ 部署脚本

#### 部署质押合约
```bash
npx hardhat run scripts/deploy-staking-only.ts --network sepolia
```

#### 部署完整系统
```bash
npx hardhat run scripts/deploy-v2.ts --network sepolia
```

#### 简单部署
```bash
npx hardhat run scripts/deploy-simple.ts --network sepolia
```

#### 部署治理系统
```bash
npx hardhat run scripts/deploy/governance.ts --network sepolia
```

### 🎯 代币操作

#### 铸造代币
```bash
npx hardhat run scripts/mint-v2.ts --network sepolia
```

#### 转移代币
```bash
npx hardhat run scripts/transfer-v2.ts --network sepolia
```

#### 铸造到中继地址
```bash
npx hardhat run scripts/mint-to-relay.ts --network sepolia
```

### 🛠️ 工具脚本

#### 环境检查
```bash
node scripts/utils/check-env.js
```

**功能**: 检查开发环境配置
**检查项**:
- .env 文件存在性
- 必要环境变量配置
- Node.js 版本 (>= 18)
- 依赖安装状态

#### 生成文档
```bash
node scripts/generate-docs.js
```

**功能**: 自动生成合约文档

#### 生成报告
```bash
node scripts/utils/generate-report.js
```

**功能**: 生成部署和测试报告

## 🚀 快速开始

### 1. 环境准备
```bash
cd bondly-contracts
npm install
cp env.example .env
# 编辑 .env 文件
```

### 2. 检查环境
```bash
node scripts/utils/check-env.js
```

### 3. 检查权限
```bash
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

### 4. 检查余额
```bash
npx hardhat run scripts/check-balance.ts --network sepolia
```

### 5. 执行操作
根据权限和余额情况，执行相应的管理操作。

## 🔧 常见问题

### 权限不足
**症状**: 脚本执行时提示权限错误
**解决**: 
```bash
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```
确认当前账户具有相应权限

### 余额不足
**症状**: 操作失败，提示余额不足
**解决**:
```bash
npx hardhat run scripts/check-balance.ts --network sepolia
```
检查 BOND 代币和 ETH 余额

### 合约状态异常
**症状**: 合约调用失败
**解决**:
```bash
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```
检查合约部署状态和配置

### 质押奖励问题
**症状**: 质押用户无法获得奖励
**解决**:
```bash
npx hardhat run scripts/add-staking-liquidity.ts --network sepolia
```
为质押合约添加奖励流动性

## 📝 注意事项

1. **网络配置**: 确保 `hardhat.config.ts` 中配置了正确的网络
2. **私钥安全**: 不要在代码中硬编码私钥，使用环境变量
3. **Gas 费用**: 确保账户有足够的 ETH 支付 gas 费用
4. **权限管理**: 只有具有相应权限的账户才能执行管理操作
5. **操作顺序**: 先检查状态，再执行操作，最后验证结果
6. **前端管理**: 管理员可通过前端界面进行质押流动性管理，无需使用命令行脚本

## 🔗 相关文档

- [合约部署指南](./DEPLOYMENT.md)
- [质押系统文档](./docs/InteractionStaking.md)
- [前端使用指南](../bondly-fe/README.md) 