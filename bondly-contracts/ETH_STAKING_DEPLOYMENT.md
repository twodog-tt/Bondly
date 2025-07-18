# ETH Staking 快速部署指南

## 概述

本指南提供 ETH Staking 合约的快速部署步骤，包括合约部署、配置和测试。

## 前置条件

1. **已部署的合约**：
   - BondlyRegistry 合约
   - BondlyToken 合约

2. **环境配置**：
   ```bash
   # 复制环境变量模板
   cp env.example .env
   
   # 配置必要的环境变量
   REGISTRY_ADDRESS=0x...  # BondlyRegistry 合约地址
   ETH_STAKING_OWNER=0x... # ETH Staking 管理员地址
   PRIVATE_KEY=0x...       # 部署者私钥
   ```

## 快速部署步骤

### 1. 编译合约
```bash
npx hardhat clean
npx hardhat compile
```

### 2. 部署 ETH Staking 合约
```bash
npx hardhat run scripts/deploy-eth-staking.ts --network localhost
```

### 3. 注册合约到 Registry
```bash
npx hardhat run scripts/register-eth-staking.ts --network localhost
```

### 4. 添加初始奖励池
```bash
npx hardhat run scripts/add-eth-staking-rewards.ts --network localhost
```

### 5. 测试合约功能
```bash
npx hardhat run scripts/test-eth-staking-simple.ts --network localhost
```

## 详细配置

### 环境变量说明
```env
# 必需的环境变量
REGISTRY_ADDRESS=0x...     # BondlyRegistry 合约地址
ETH_STAKING_OWNER=0x...    # ETH Staking 管理员地址
PRIVATE_KEY=0x...          # 部署者私钥

# 可选的环境变量
REWARD_AMOUNT=1000000000000000000000  # 初始奖励金额 (1000 BOND)
REWARD_DURATION=2592000               # 奖励持续时间 (30天)
```

### 合约参数
- **最小质押金额**：0.01 ETH
- **奖励代币**：BOND
- **无锁定期**：可随时解除质押
- **管理员权限**：可添加奖励、紧急提取

## 测试验证

### 1. 基本功能测试
```bash
# 运行单元测试
npx hardhat test test/reputation/ETHStaking.test.ts
```

### 2. 集成测试
```bash
# 测试用户操作
npx hardhat run scripts/test-eth-staking-simple.ts --network localhost
```

### 3. 手动测试步骤
1. **质押 ETH**：
   ```bash
   # 质押 0.1 ETH
   npx hardhat run scripts/stake-eth.ts --network localhost
   ```

2. **查看质押信息**：
   ```bash
   # 查询用户质押信息
   npx hardhat run scripts/check-user-stake.ts --network localhost
   ```

3. **领取奖励**：
   ```bash
   # 领取 BOND 奖励
   npx hardhat run scripts/claim-rewards.ts --network localhost
   ```

4. **解除质押**：
   ```bash
   # 解除质押 0.05 ETH
   npx hardhat run scripts/unstake-eth.ts --network localhost
   ```

## 管理员操作

### 1. 添加奖励
```bash
# 添加 1000 BOND 奖励，持续 30 天
npx hardhat run scripts/add-rewards.ts --network localhost
```

### 2. 查看合约状态
```bash
# 查看合约 ETH 余额
npx hardhat run scripts/check-eth-balance.ts --network localhost

# 查看合约 BOND 余额
npx hardhat run scripts/check-bond-balance.ts --network localhost
```

### 3. 紧急操作
```bash
# 紧急提取 ETH（仅管理员）
npx hardhat run scripts/emergency-withdraw-eth.ts --network localhost

# 紧急提取 BOND（仅管理员）
npx hardhat run scripts/emergency-withdraw-bond.ts --network localhost
```

## 前端集成

### 1. 更新合约配置
在 `bondly-fe/src/config/contracts.ts` 中添加：
```typescript
export const CONTRACTS = {
  // ... 其他合约
  ETH_STAKING: {
    address: '0x...', // 部署的合约地址
    abi: ETHStakingABI
  }
};
```

### 2. 使用 Hook
```typescript
import { useETHStaking } from '../hooks/useETHStaking';

const {
  stakedAmount,
  pendingReward,
  apy,
  stake,
  unstake,
  claim
} = useETHStaking();
```

### 3. 集成组件
```typescript
import ETHStakingManager from '../components/ETHStakingManager';

<ETHStakingManager isMobile={isMobile} />
```

## 安全注意事项

### 1. 部署前检查
- [ ] 合约代码已通过测试
- [ ] 环境变量配置正确
- [ ] 私钥安全存储
- [ ] 网络连接稳定

### 2. 部署后验证
- [ ] 合约部署成功
- [ ] 合约地址正确注册
- [ ] 权限设置正确
- [ ] 基本功能测试通过

### 3. 生产环境准备
- [ ] 多签钱包配置
- [ ] 监控系统部署
- [ ] 紧急响应计划
- [ ] 备份和恢复机制

## 故障排除

### 常见问题

**Q: 部署失败，提示 "Registry not found"**
A: 确保 `REGISTRY_ADDRESS` 环境变量正确设置，且该地址存在 BondlyRegistry 合约。

**Q: 添加奖励失败，提示 "Transfer failed"**
A: 确保管理员账户有足够的 BOND 代币，且已授权给 ETH Staking 合约。

**Q: 质押失败，提示 "Stake amount too small"**
A: 确保质押金额至少为 0.01 ETH。

**Q: 前端无法连接合约**
A: 检查合约地址是否正确，网络配置是否匹配。

### 调试命令
```bash
# 查看合约日志
npx hardhat console --network localhost

# 检查合约状态
npx hardhat run scripts/debug-eth-staking.ts --network localhost
```

## 更新和维护

### 1. 升级合约
```bash
# 部署新版本
npx hardhat run scripts/upgrade-eth-staking.ts --network mainnet
```

### 2. 更新奖励
```bash
# 添加新的奖励池
npx hardhat run scripts/add-eth-staking-rewards.ts --network mainnet
```

### 3. 监控合约
```bash
# 查看合约状态
npx hardhat run scripts/monitor-eth-staking.ts --network mainnet
```

## 技术支持

如需技术支持，请参考：
- [ETH Staking 详细文档](./docs/ETHStaking.md)
- [部署指南](./docs/DEPLOYMENT.md)
- [测试指南](./docs/TESTING.md)

或联系开发团队获取帮助。 