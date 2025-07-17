# GeneralStaking 部署指南

## 概述

本指南将帮助你部署 GeneralStaking 合约并配置前端以支持质押功能。

## 部署步骤

### 1. 部署合约

```bash
cd bondly-contracts
npx hardhat run scripts/deploy-staking-only.ts --network sepolia
```

### 2. 更新前端配置

部署完成后，你会看到类似以下的输出：

```
📋 Contract Addresses:
BondlyRegistry: 0x...
BondlyTokenV2: 0x...
GeneralStaking: 0x...
```

将 `GeneralStaking` 地址复制到 `bondly-fe/src/config/contracts.ts` 文件中：

```typescript
GENERAL_STAKING: {
  address: '0x...', // 替换为实际的部署地址
  abi: [
    // ... 现有的 ABI
  ]
}
```

### 3. 测试功能

1. 启动前端服务：
```bash
cd bondly-fe
npm run dev
```

2. 连接钱包到 Sepolia 网络
3. 访问 Stake 页面
4. 测试质押、解质押、领取奖励功能

## 功能特性

### 质押功能
- ✅ 支持任意数量的 BOND 代币质押
- ✅ 自动检查授权额度
- ✅ 实时更新质押状态

### 奖励系统
- ✅ 基于时间的奖励累积
- ✅ 按质押比例分配奖励
- ✅ 支持随时领取奖励

### 解质押功能
- ✅ 支持部分或全部解除质押
- ✅ 实时更新质押状态

## 合约地址

部署后请记录以下地址：

- **BondlyRegistry**: 用于管理所有合约地址
- **BondlyTokenV2**: BOND 代币合约
- **GeneralStaking**: 质押合约

## 注意事项

1. 确保部署账户有足够的 Sepolia ETH 支付 gas 费用
2. 部署后需要等待几个区块确认
3. 前端配置更新后需要重启开发服务器
4. 首次质押需要先授权，然后再次点击质押

## 故障排除

### 常见问题

1. **合约部署失败**
   - 检查账户余额是否足够
   - 确认网络连接正常
   - 查看错误日志

2. **前端无法连接合约**
   - 确认合约地址正确
   - 检查网络配置
   - 确认钱包连接到正确的网络

3. **质押失败**
   - 检查 BOND 代币余额
   - 确认已授权足够的额度
   - 查看交易错误信息

## 支持

如果遇到问题，请检查：
1. 合约部署日志
2. 浏览器控制台错误
3. 钱包交易历史 