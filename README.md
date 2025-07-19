# **Bondly: Web3 Social Content Value Platform**

> **Connect with people you trust, share the value you create.**

Video Introduction：
bilibili:https://www.bilibili.com/video/BV1T4udz1Ek7/?vd_source=4294884d12011f690a0ffce59877a3a2
YouTube:https://youtu.be/9OKgWyUvUns


---

## 🎯 Project Overview

**Bondly** is a blockchain-based decentralized social content platform that redefines the value relationship between content creators and users through **Content NFTization**, **Interactive Staking Mechanism**, and **Reputation System**.

### 🌟 Core Innovations

- **Content as NFT**: Every piece of content can be minted as an NFT, giving creators true digital asset ownership
- **Interactive Staking**: Users stake tokens to participate in content interactions, earning rewards while supporting creators
- **Multi-chain Support**: Supports Ethereum, Polygon, Arbitrum, Optimism, BSC and other blockchains
- **Reputation Economy**: User behavior-based reputation system that affects reward distribution and platform permissions

---

## 🚀 Project Highlights

| Module | Innovation Features | Status |
|---------|---------|------|
| 📝 Content Creation | Markdown Editor + IPFS Storage + NFT Minting | ✅ Complete |
| 💎 Interactive Staking | Like/Comment Staking + Creator Reward Distribution | ✅ Complete |
| 🔗 Wallet Integration | Multi-chain Wallet Support + Progressive Login | ✅ Complete |
| 🏛️ Governance System | DAO Proposals + Voting Mechanism + Community Decisions | ✅ Complete |
| 📊 Reputation System | Behavior Scoring + Level Growth + Rights Unlocking | ✅ Complete |
| 🎨 User Experience | Modern UI + Responsive Design + Dark Theme | ✅ Complete |

---

## 🏗️ Technical Architecture

### Frontend Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (JIT mode)
- **Web3**: Wagmi + Viem + Web3Modal
- **State Management**: React Context + Hooks
- **Editor**: Markdown Editor + Real-time Preview
- **Storage**: IPFS (Pinata Integration)

### Backend Tech Stack
- **Language**: Go 1.21+
- **Framework**: Gin + GORM
- **Database**: PostgreSQL + Redis
- **Message Queue**: Kafka
- **Authentication**: JWT + Middleware
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose

### Smart Contracts
- **Language**: Solidity 0.8.19+
- **Framework**: Hardhat + TypeScript
- **Security**: OpenZeppelin 5.3.0
- **Upgradeability**: UUPS Proxy Pattern
- **Testing**: Coverage >90%

---

## 📦 Project Structure

```
Bondly/
├── bondly-fe/           # Frontend Application (React + TypeScript)
├── bondly-api/          # Backend Service (Go + Gin)
├── bondly-contracts/    # Smart Contracts (Solidity + Hardhat)
└── README.md           # Project Documentation
```

---

## ⚡ Quick Start

### Requirements
- **Node.js** >= 18.0.0
- **Go** >= 1.21.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0
- **Git**

### 1. Clone Project
```bash
git clone https://github.com/your-username/Bondly.git
cd Bondly
```

### 2. Start Frontend Application
```bash
cd bondly-fe
npm install
npm run dev
# Visit http://localhost:5173
```

### 3. Start Backend Service
```bash
cd bondly-api
# Copy environment configuration
cp env.example .env
# Modify database configuration
go mod download
go run main.go
# API service runs on http://localhost:8080
```

### 4. Initialize Test Data
```bash
cd bondly-api
go run cmd/seed-data/main.go
```

### 5. Deploy Smart Contracts (Optional)
```bash
cd bondly-contracts
npm install
# Configure environment variables
cp env.example .env
# Compile contracts
npx hardhat compile
# Deploy to testnet
npx hardhat run scripts/deploy/deploy.ts --network sepolia
```

---

## 🎮 Core Features Demo

### Content Creation and NFTization
1. Create content using Markdown editor
2. Upload images to IPFS
3. One-click NFT minting
4. Permanently stored on blockchain

### Interactive Staking Mechanism
1. Users stake BOND tokens to participate in interactions
2. Earn rewards by liking/commenting on content
3. Creators receive staking rewards
4. Forms a positive incentive cycle

### Multi-chain Wallet Support
- Supports mainstream wallets like MetaMask, WalletConnect
- Automatic network detection and switching
- Cross-chain asset management

---

## 📊 Data Statistics

### Test Data
- **User Count**: 8 test users (including different roles)
- **Article Count**: 5 high-quality technical articles
- **Comment Count**: 20 real user comments
- **Proposal Count**: 3 governance proposals
- **Transaction Records**: 3 on-chain transaction examples

### Contract Deployment
- **Testnet**: Sepolia, Goerli
- **Mainnet**: Pending deployment
- **Verification Status**: All contracts verified

---

## 🔧 Development Guide

### Frontend Development
```bash
cd bondly-fe
# Install dependencies
npm install
# Start development server
npm run dev
# Build production version
npm run build
# Run tests
npm run test
```

### Backend Development
```bash
cd bondly-api
# Install dependencies
go mod download
# Run service
go run main.go
# Run tests
go test ./...
# Generate API documentation
swag init
```

### Contract Development
```bash
cd bondly-contracts
# Install dependencies
npm install
# Compile contracts
npx hardhat compile
# Run tests
npx hardhat test
```

---

## 📚 Documentation Resources

### 📖 Consolidated Documentation
- [🚀 Deployment Configuration Guide](bondly-api/docs/DEPLOYMENT_GUIDE.md) - Airdrop configuration, wallet configuration, environment variables and other deployment-related documentation
- [🛠️ Technical Documentation](bondly-api/docs/TECHNICAL_DOCS.md) - Database architecture, business logging, email service and other technical documentation
- [📋 Smart Contract Guide](bondly-contracts/docs/CONTRACTS_GUIDE.md) - Complete guide for contract architecture, deployment, testing, and script tools
- [🎨 Frontend Development Guide](bondly-fe/docs/FRONTEND_GUIDE.md) - Frontend tech stack, development standards, deployment guide, IPFS integration, etc.

### 🔗 Original Documentation
- [API Documentation](http://localhost:8080/swagger/index.html) - Backend API interface documentation
- [Contract Documentation](bondly-contracts/docs/) - Smart contract technical documentation
- [Deployment Guide](bondly-contracts/DEPLOYMENT.md) - Contract deployment instructions
- [Database Architecture](bondly-api/docs/DATABASE_SCHEMA.md) - Database design documentation
- [Frontend Guide](bondly-fe/README.md) - Frontend usage guide

---

## 🧪 Testing and Quality

### Test Coverage
- **Frontend Testing**: Component testing + E2E testing
- **Backend Testing**: Unit testing + integration testing
- **Contract Testing**: Coverage >90%

### Code Quality
- **ESLint** + **Prettier** - Code standards
- **TypeScript** - Type safety
- **Go vet** + **golangci-lint** - Go code checking

---

## 🚀 Deployment Guide

### Production Environment Deployment
```bash
# One-click deployment using Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variable Configuration
```bash
# Database configuration
DATABASE_URL=postgresql://user:password@localhost:5432/bondly
REDIS_URL=redis://localhost:6379

# Blockchain configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com

# IPFS configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

---

## 🤝 Contribution Guide

We welcome all forms of contributions!

### Contribution Methods
- 🐛 **Bug Reports**: Submit via GitHub Issues
- 💡 **Feature Suggestions**: Discuss in Discussions
- 📝 **Documentation Improvements**: Submit Pull Request
- 🔧 **Code Contributions**: Fork project and submit PR

### Development Process
1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

---

## 📞 Contact Us

- **Email**: twodogtt01@gmail.com
- **tg**: @ttttmax

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

Thanks to all developers and community members who have contributed to the Bondly project!

---

**Bondly** - Connect with people you trust, share the value you create 🚀

*"In the Web3 world, every interaction is a creation of value"*
