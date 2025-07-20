// 合约配置
export const CONTRACTS = {
  // Sepolia 上的 ContentNFTV2 合约
  CONTENT_NFT: {
    address: "0xA8D4C5bD21Feba75BF99879B34cf35E82dB5aCEC" as `0x${string}`,
    abi: [
      // 铸造函数（管理员免费）
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "title", type: "string" },
          { name: "summary", type: "string" },
          { name: "coverImage", type: "string" },
          { name: "ipfsLink", type: "string" },
          { name: "tokenUri", type: "string" }
        ],
        name: "mint",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
      },
      // 付费铸造函数（用户自主铸造）
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "title", type: "string" },
          { name: "summary", type: "string" },
          { name: "coverImage", type: "string" },
          { name: "ipfsLink", type: "string" },
          { name: "tokenUri", type: "string" }
        ],
        name: "mintWithFee",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "payable",
        type: "function"
      },
      // 获取NFT元数据
      {
        inputs: [{ name: "tokenId", type: "uint256" }],
        name: "getContentMeta",
        outputs: [
          {
            components: [
              { name: "title", type: "string" },
              { name: "summary", type: "string" },
              { name: "coverImage", type: "string" },
              { name: "ipfsLink", type: "string" },
              { name: "creator", type: "address" },
              { name: "mintedAt", type: "uint256" }
            ],
            name: "",
            type: "tuple"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      // 获取铸造费用
      {
        inputs: [],
        name: "getMintFee",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      // 获取总供应量
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      // 获取用户铸造数量
      {
        inputs: [{ name: "user", type: "address" }],
        name: "getUserMintCount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      },
      // 检查NFT所有权
      {
        inputs: [{ name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
      }
    ]
  },
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
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
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
  },
  // GeneralStaking 合约地址 (需要部署后更新)
  GENERAL_STAKING: {
    address: '0x305AF7c69F6187b0d359C8d143bCD3549AF37646', // 需要部署后更新
    abi: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getUserInfo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "stakedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pendingReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userLastUpdateTime",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getStaked",
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
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getReward",
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
        "name": "totalStaked",
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
        "name": "rewardRate",
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
        "name": "rewardEndTime",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "duration",
            "type": "uint256"
          }
        ],
        "name": "addReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REWARD_MANAGER_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  // InteractionStaking 合约地址 (Sepolia 测试网)
  INTERACTION_STAKING: {
    address: '0xf0f1756BEd8126798452904d37ED51f683D5f954', // Sepolia 测试网
    abi: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "stakeInteraction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "claimReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "withdrawInteraction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "getUserStake",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "getTotalStaked",
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
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interactionType",
            "type": "uint8"
          }
        ],
        "name": "hasInteracted",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  // ETH Staking 合约地址 (Sepolia 测试网)
  ETH_STAKING: {
    address: '0xcC7A9e9c8E60ecc12D5A6cd9BEFEFFCD253104E9', // Sepolia 测试网
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getUserInfo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "stakedAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pendingReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userLastUpdateTime",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stake",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stakeAndClaim",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "unstakeAndClaim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalStaked",
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
        "name": "rewardRate",
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
        "name": "rewardEndTime",
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
        "name": "calculateAPY",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "duration",
            "type": "uint256"
          }
        ],
        "name": "addReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REWARD_MANAGER_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MIN_STAKE_AMOUNT",
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