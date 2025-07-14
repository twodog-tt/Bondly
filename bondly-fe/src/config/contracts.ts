// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // Sepolia 测试网
  sepolia: {
    BOND_TOKEN: '0x...', // 部署后填入实际地址
    GENERAL_STAKING: '0x...', // 部署后填入实际地址
    BONDLY_REGISTRY: '0x...', // 部署后填入实际地址
  },
  // 主网（未来使用）
  mainnet: {
    BOND_TOKEN: '0x...',
    GENERAL_STAKING: '0x...',
    BONDLY_REGISTRY: '0x...',
  }
};

// 获取当前网络的合约地址
export const getContractAddresses = (chainId: number) => {
  switch (chainId) {
    case 11155111: // Sepolia
      return CONTRACT_ADDRESSES.sepolia;
    case 1: // Mainnet
      return CONTRACT_ADDRESSES.mainnet;
    default:
      return CONTRACT_ADDRESSES.sepolia; // 默认使用 Sepolia
  }
};

// 质押合约 ABI（从编译后的合约中获取）
export const GENERAL_STAKING_ABI = [
  // 质押函数
  {
    "inputs": [{"type": "uint256", "name": "amount"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 解除质押函数
  {
    "inputs": [{"type": "uint256", "name": "amount"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 领取奖励函数
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 查询用户信息
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "getUserInfo",
    "outputs": [
      {"type": "uint256", "name": "stakedAmount"},
      {"type": "uint256", "name": "pendingReward"},
      {"type": "uint256", "name": "lastUpdateTime"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // 查询总质押量
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 查询奖励率
  {
    "inputs": [],
    "name": "rewardRate",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// BOND 代币 ABI
export const BOND_TOKEN_ABI = [
  // 授权函数
  {
    "inputs": [
      {"type": "address", "name": "spender"},
      {"type": "uint256", "name": "amount"}
    ],
    "name": "approve",
    "outputs": [{"type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 查询余额
  {
    "inputs": [{"type": "address", "name": "account"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 查询授权额度
  {
    "inputs": [
      {"type": "address", "name": "owner"},
      {"type": "address", "name": "spender"}
    ],
    "name": "allowance",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 转账函数
  {
    "inputs": [
      {"type": "address", "name": "to"},
      {"type": "uint256", "name": "amount"}
    ],
    "name": "transfer",
    "outputs": [{"type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// 事件 ABI（用于监听）
export const STAKING_EVENTS = {
  Staked: {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "Staked",
    "type": "event"
  },
  Unstaked: {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "Unstaked",
    "type": "event"
  },
  RewardClaimed: {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "RewardClaimed",
    "type": "event"
  }
}; 