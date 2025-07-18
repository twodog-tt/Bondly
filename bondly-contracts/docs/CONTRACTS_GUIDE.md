# Bondly Smart Contract System Guide

## 📋 Table of Contents

- [System Architecture Overview](#system-architecture-overview)
- [Contract Deployment Guide](#contract-deployment-guide)
- [Testing Guide](#testing-guide)
- [Script Tools](#script-tools)
- [Module Detailed Documentation](#module-detailed-documentation)

---

## 🏗️ System Architecture Overview

Bondly is a complete decentralized content creation platform smart contract system that supports core features such as content assetization, community governance, interaction incentives, reputation building, and achievement badges. All modules are managed through a unified registry system, supporting flexible upgrades and decentralized governance.

### Core Modules

#### 🪙 Token System (Token)
- **BondlyTokenV2**: Platform native token, supports ERC20, Permit, Votes, UUPS upgrade, role permission management
- **BondlyToken**: Initial token version, provides basic token functionality

#### 🖼️ NFT System (NFT)
- **ContentNFT**: Content assetization NFT, supports creator tracking, independent metadata, IPFS storage
- **AchievementNFT**: Achievement badge SBT, non-transferable, records user honors and contributions

#### 🏆 Reputation System (Reputation)
- **ReputationVault**: Reputation score management, supports snapshots and governance weight calculation
- **InteractionStaking**: Interaction staking mechanism, user interactions require BOND staking, rewards go to creators
- **RewardDistributor**: Reputation-based reward distribution system
- **GeneralStaking**: General staking contract, supports multiple staking scenarios
- **ETHStaking**: ETH staking contract, users stake ETH to earn BOND rewards
- **MixedTokenReputationStrategy**: Mixed weight strategy, combines token and reputation for voting weight calculation

#### 🏛️ Governance System (Governance)
- **BondlyDAO**: Decentralized governance contract, supports proposal creation, voting, execution
- **BondlyVoting**: Voting mechanism, supports multiple weight calculation methods

#### 💰 Treasury System (Treasury)
- **BondlyTreasury**: Multi-currency fund management, supports ETH and BOND tokens, integrated with DAO governance

#### 📋 Registry System (Registry)
- **BondlyRegistry**: Unified contract address management, supports version control and upgrades

### Contract Directory Structure

```
contracts/
├── token/                    # Token System
│   ├── BondlyToken.sol      # Main Token Contract (ERC20 + UUPS)
│   └── BondlyTokenV2.sol    # Token Upgrade Version (supports multiple minting permissions)
├── nft/                     # NFT System
│   ├── ContentNFT.sol       # Content NFT (Creator Tracking + IPFS)
│   └── AchievementNFT.sol   # Achievement SBT (Non-transferable)
├── reputation/              # Reputation System
│   ├── ReputationVault.sol  # Reputation Score Management
│   ├── RewardDistributor.sol # Reward Distributor
│   ├── InteractionStaking.sol # Interaction Staking (Like/Comment/Collect)
│   ├── GeneralStaking.sol   # General Staking Contract
│   ├── ETHStaking.sol       # ETH Staking Contract
│   ├── MixedTokenReputationStrategy.sol # Mixed Weight Strategy
│   └── IReputationVault.sol # Reputation Vault Interface
├── governance/              # Governance System
│   ├── BondlyDAO.sol        # DAO Governance Contract (Proposal Management)
│   ├── BondlyVoting.sol     # Voting Mechanism (Multiple Weights)
│   ├── IBondlyDAO.sol       # DAO Interface
│   └── IBondlyVoting.sol    # Voting Interface
├── treasury/                # Fund Management
│   ├── BondlyTreasury.sol   # Treasury Contract (Multi-currency Management)
│   └── IBondlyTreasury.sol  # Treasury Interface
└── registry/                # Registry System
    ├── BondlyRegistry.sol   # Registry Contract (Unified Addressing)
    └── IBondlyRegistry.sol  # Registry Interface
```

---

## 🚀 Contract Deployment Guide

### Environment Preparation

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Configure Environment Variables
Copy environment variable template:
```bash
cp env.example .env
```

Configure necessary environment variables:
```env
# Network configuration
NETWORK=sepolia
PRIVATE_KEY=your-private-key

# Deployment configuration
BOND_TOKEN_ADDRESS=0x...
REGISTRY_ADDRESS=0x...
```

### Deployment Process

#### 1. Complete Deployment
```bash
# Deploy all contracts
npx hardhat run scripts/deploy/deploy.ts --network sepolia
```

#### 2. Step-by-step Deployment
```bash
# Deploy token contract
npx hardhat run scripts/deploy/token.ts --network sepolia

# Deploy registry
npx hardhat run scripts/deploy/registry.ts --network sepolia

# Deploy governance system
npx hardhat run scripts/deploy/governance.ts --network sepolia
```

#### 3. Staking System Deployment
```bash
# Deploy ETH staking contract
npx hardhat run scripts/deploy-staking-only.ts --network sepolia

# Deploy interaction staking contract
npx hardhat run scripts/deploy-interaction-staking.ts --network sepolia
```

### Deployment Verification

#### 1. Check Deployment Status
```bash
# Check deployed contracts
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

#### 2. Verify Contracts
```bash
# Verify contract code
npx hardhat run scripts/utils/verify.ts --network sepolia
```

### Post-deployment Configuration

#### 1. Set Permissions
```bash
# Check admin permissions
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

#### 2. Initialize Staking Rewards
```bash
# Set staking rewards
npx hardhat run scripts/setup-staking-with-rewards.ts --network sepolia
```

---

## 🧪 Testing Guide

### Test Coverage

#### Overall Coverage
- **Overall Coverage**: 46.53%
- **Statement Coverage**: 46.53%
- **Branch Coverage**: 41.4%
- **Function Coverage**: 69.65%
- **Line Coverage**: 50.18%

#### Module Coverage
- **NFT Module**: 96.15% (Excellent)
- **Token Module**: 98.48% (Excellent)
- **Registry Module**: 93.1% (Excellent)
- **Reputation Module**: 66.13% (Medium)
- **Governance Module**: 14.24% (Needs integration testing)
- **Treasury Module**: 43.37% (Medium)

### Running Tests

#### 1. Run All Tests
```bash
npm test
```

#### 2. Run Specific Module Tests
```bash
# Test token contract
npx hardhat test test/token/BondlyTokenUpgradeable.basic.test.ts

# Test NFT contract
npx hardhat test test/nft/ContentNFT.test.ts

# Test reputation contract
npx hardhat test test/reputation/ReputationVault.test.ts
```

#### 3. Run Coverage Tests
```bash
npm run coverage
```

### Test File Structure

```
test/
├── governace/           # Governance system tests
│   ├── BondlyDAO.test.ts
│   └── BondlyVoting.test.ts
├── nft/                # NFT system tests
│   ├── AchievementNFT.comprehensive.test.ts
│   └── ContentNFT.test.ts
├── registry/           # Registry tests
│   └── BondlyRegistry.test.ts
├── reputation/         # Reputation system tests
│   ├── InteractionStaking.test.ts
│   ├── MixedTokenReputationStrategy.test.ts
│   ├── ReputationVault.test.ts
│   └── RewardDistributor.test.ts
├── token/              # Token tests
│   └── BondlyTokenUpgradeable.basic.test.ts
└── treasury/           # Treasury tests
    └── BondlyTreasury.test.ts
```

---

## 🛠️ Script Tools

### Deployment Scripts

#### Main Deployment Scripts
- `scripts/deploy/deploy.ts` - Complete deployment script
- `scripts/deploy/token.ts` - Token deployment script
- `scripts/deploy/governance.ts` - Governance system deployment script
- `scripts/deploy-staking-only.ts` - ETH staking deployment script
- `scripts/deploy-interaction-staking.ts` - Interaction staking deployment script

#### Utility Scripts
- `scripts/check-deployed-contracts.ts` - Check deployment status
- `scripts/check-admin-permissions.ts` - Check admin permissions
- `scripts/check-balance.ts` - Check balance
- `scripts/check-staking-rewards.ts` - Check staking rewards

### Management Scripts

#### Staking Management
- `scripts/setup-staking-with-rewards.ts` - Set staking rewards
- `scripts/activate-staking-rewards.ts` - Activate staking rewards
- `scripts/adjust-apy.ts` - Adjust APY
- `scripts/reset-rewards.ts` - Reset rewards

#### Token Management
- `scripts/mint-to-relay.ts` - Mint tokens to relay wallet
- `scripts/mint-v2.ts` - V2 token minting
- `scripts/transfer-v2.ts` - V2 token transfer

#### Debug Scripts
- `scripts/debug-registry.ts` - Debug registry
- `scripts/debug-staking-rewards.ts` - Debug staking rewards
- `scripts/fix-registry.ts` - Fix registry

### Script Usage Examples

#### Check Deployment Status
```bash
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia
```

#### Check Admin Permissions
```bash
npx hardhat run scripts/check-admin-permissions.ts --network sepolia
```

#### Set Staking Rewards
```bash
npx hardhat run scripts/setup-staking-with-rewards.ts --network sepolia
```

---

## 📚 Module Detailed Documentation

### 🪙 Token System (BondlyTokenV2)

**Main Features:**
- ✅ **ERC20 Standard Token** - Fully compatible with ERC20 standard
- ✅ **Upgradeable Contract** - Uses UUPS proxy pattern, supports contract upgrades
- ✅ **Multiple Minting Permissions** - Supports MINTER_ROLE and DAO address minting
- ✅ **Batch Minting** - Mint tokens for multiple addresses at once
- ✅ **Token Burning** - Supports forced burning and user self-burning
- ✅ **Voting Weight** - Integrates ERC20Votes for governance voting
- ✅ **Pause Mechanism** - Can pause contract operations in emergencies
- ✅ **Permission Management** - Role-based permission system using AccessControl

**Key Functions:**
```solidity
// Minting function - supports MINTER_ROLE or DAO
function mint(address to, uint256 amount, string memory reason)

// Batch minting
function batchMint(address[] memory recipients, uint256[] memory amounts, string memory reason)

// Token burning
function burn(address from, uint256 amount, string memory reason)
function selfBurn(uint256 amount, string memory reason)
```

### 🖼️ NFT System

**ContentNFT - Content Assetization:**
- ✅ **Content NFTization** - Mint user-created content as NFTs
- ✅ **Metadata Management** - Title, summary, cover image, IPFS links
- ✅ **Creator Tracking** - Automatically records content creator address
- ✅ **IPFS Integration** - Supports decentralized content storage
- ✅ **Permission Control** - Only authorized addresses can mint NFTs

**AchievementNFT - Achievement Badges:**
- ✅ **Non-transferable SBT** - Soul-bound tokens, records user achievements
- ✅ **Multiple Achievement Types** - Supports different types of achievement badges
- ✅ **History Tracking** - Records timeline of user achievements

### 🏆 Reputation System

**InteractionStaking - Interaction Staking:**
- ✅ **Interaction Staking** - Liking, commenting, collecting requires BOND token staking
- ✅ **Reward Allocation** - Staked amount is allocated as rewards to content creators
- ✅ **Staking Withdrawal** - Users can withdraw unclaimed staking
- ✅ **Anti-duplicate Interaction** - Each user can only interact with each content once
- ✅ **Flexible Configuration** - Staking amount for different interaction types can be configured

**ReputationVault - Reputation Management:**
- ✅ **Reputation Score** - Reputation score calculated based on user behavior
- ✅ **Snapshot Mechanism** - Supports reputation snapshots for governance voting
- ✅ **Governance Weight** - Reputation score affects governance voting weight

**RewardDistributor - Reward Distribution:**
- ✅ **Reputation Rewards** - BOND rewards allocated based on reputation score
- ✅ **Anti-duplicate Claiming** - Prevents users from claiming rewards repeatedly
- ✅ **Multi-token Support** - Supports reward allocation for multiple tokens

**ETHStaking - ETH Staking:**
- ✅ **ETH Staking** - Users can stake ETH to earn BOND rewards
- ✅ **Real-time APY** - Dynamic calculation and display of annualized yield
- ✅ **Combined Operations** - Supports staking and claiming, unstaking and claiming
- ✅ **No Lock Period** - Users can unstake at any time
- ✅ **Reward Management** - Admins can add reward liquidity
- ✅ **Security Mechanisms** - Reentrancy protection, pause mechanism, emergency withdrawal

### 🏛️ Governance System

**BondlyDAO - Decentralized Governance:**
- ✅ **Proposal Management** - Create, activate, execute governance proposals
- ✅ **Double-channel Proposals** - Supports deposit proposals and reputation proposals
- ✅ **Voting Mechanism** - Supports approval/rejection voting
- ✅ **Permission Control** - Only authorized executors can execute proposals
- ✅ **Function Whitelisting** - Limits callable contract functions

**BondlyVoting - Voting Mechanism:**
- ✅ **Multiple Weights** - Supports token weight, reputation weight, mixed weight
- ✅ **Voting Record** - Prevents duplicate voting
- ✅ **Snapshot Voting** - Voting weight calculation based on snapshots

### 💰 Treasury System

**BondlyTreasury - Multi-currency Fund Management:**
- ✅ **Multi-currency Support** - Manages ETH and BOND tokens simultaneously
- ✅ **DAO Integration** - Deeply integrated with governance system
- ✅ **Proposal Execution** - Executes DAO approved proposals
- ✅ **Permission Levels** - viewer, operator different permission levels
- ✅ **Emergency Withdrawal** - Can withdraw funds in emergencies
- ✅ **Parameter Management** - Dynamically adjusts proposal amount limits

### 📋 Registry System

**BondlyRegistry - Unified Address Management:**
- ✅ **Contract Addressing** - Unifies management of all contract addresses
- ✅ **Version Control** - Supports contract version management
- ✅ **Address Query** - Queries contract address by name
- ✅ **Upgrade Support** - Supports contract upgrades and address updates

---

## 🛡️ Security Features

### Permission Management
- **Role-based Permissions** - Based on OpenZeppelin AccessControl
- **Permission Levels** - Different roles have different permissions
- **Permission Validation** - Strict permission check mechanism

### Security Mechanisms
- **Pause Mechanism** - Can pause contracts in emergencies
- **Reentrancy Protection** - Prevents reentrancy attacks
- **Input Validation** - Strict parameter validation
- **Event Logging** - Complete operation logs

### Upgradability
- **UUPS Proxy** - Supports contract upgrades
- **Version Management** - Supports contract version iteration
- **Upgrade Control** - Only authorized addresses can upgrade

---

**Document Version**: v1.0 | **Last Updated**: 2024-12-01 