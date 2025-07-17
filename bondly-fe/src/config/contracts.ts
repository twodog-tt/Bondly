// 合约配置
export const CONTRACTS = {
  // BOND 代币合约地址 (Sepolia 测试网) - V2合约
  BOND_TOKEN: {
    address: '0x8Cb00D43b5627528d97831b9025F33aE3dE7415E', // V2合约地址
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
};

// 网络配置
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/your_project_id',
    explorer: 'https://sepolia.etherscan.io'
  }
};

// 获取合约地址
export const getContractAddress = (contractName: string): string => {
  const contract = CONTRACTS[contractName as keyof typeof CONTRACTS];
  if (!contract) {
    throw new Error(`Contract ${contractName} not found`);
  }
  return contract.address;
};

// 获取合约 ABI
export const getContractABI = (contractName: string): any[] => {
  const contract = CONTRACTS[contractName as keyof typeof CONTRACTS];
  if (!contract) {
    throw new Error(`Contract ${contractName} not found`);
  }
  return contract.abi;
}; 