package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"fmt"
	"log"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

// 模拟数据生成器
type DataSeeder struct {
	db *gorm.DB
}

// 用户数据
var users = []map[string]interface{}{
	{
		"wallet_address":   "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
		"email":            "alice2@web3.com",
		"nickname":         "Alice Crypto",
		"avatar_url":       "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
		"bio":              "Web3 enthusiast | DeFi researcher | Building the future of decentralized social media",
		"role":             "user",
		"reputation_score": 1250,
	},
	{
		"wallet_address":   "0x8ba1f109551bd432803012645aac136c772c3c3",
		"email":            "bob2@web3.com",
		"nickname":         "Bob Blockchain",
		"avatar_url":       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
		"bio":              "Smart contract developer | NFT artist | Exploring the intersection of art and technology",
		"role":             "user",
		"reputation_score": 890,
	},
	{
		"wallet_address":   "0x1234567890123456789012345678901234567890",
		"email":            "carol2@web3.com",
		"nickname":         "Carol DAO",
		"avatar_url":       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
		"bio":              "DAO governance expert | Community builder | Empowering decentralized decision making",
		"role":             "moderator",
		"reputation_score": 2100,
	},
	{
		"wallet_address":   "0x9876543210987654321098765432109876543210",
		"email":            "dave2@web3.com",
		"nickname":         "Dave DeFi",
		"avatar_url":       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
		"bio":              "DeFi strategist | Yield farmer | Sharing insights on the latest protocols",
		"role":             "user",
		"reputation_score": 1560,
	},
	{
		"wallet_address":   "0xabcdef1234567890abcdef1234567890abcdef12",
		"email":            "eve2@web3.com",
		"nickname":         "Eve NFT",
		"avatar_url":       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
		"bio":              "NFT collector | Digital art curator | Building bridges between traditional and digital art",
		"role":             "user",
		"reputation_score": 980,
	},
	{
		"wallet_address":   "0xfedcba0987654321fedcba0987654321fedcba09",
		"email":            "frank2@web3.com",
		"nickname":         "Frank Layer2",
		"avatar_url":       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
		"bio":              "Layer 2 researcher | Scaling solutions | Making blockchain accessible to everyone",
		"role":             "user",
		"reputation_score": 1340,
	},
	{
		"wallet_address":   "0x1111111111111111111111111111111111111111",
		"email":            "grace2@web3.com",
		"nickname":         "Grace Governance",
		"avatar_url":       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
		"bio":              "Governance specialist | Tokenomics expert | Designing sustainable token economies",
		"role":             "admin",
		"reputation_score": 3200,
	},
	{
		"wallet_address":   "0x2222222222222222222222222222222222222222",
		"email":            "henry2@web3.com",
		"nickname":         "Henry Hash",
		"avatar_url":       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
		"bio":              "Cryptography researcher | Zero-knowledge proofs | Privacy in the digital age",
		"role":             "user",
		"reputation_score": 1780,
	},
}

// 文章数据
var posts = []map[string]interface{}{
	{
		"title": "Bondly: Revolutionizing Web3 Social Media with Content Monetization",
		"content": `# Bondly: Revolutionizing Web3 Social Media with Content Monetization

Welcome to Bondly, the next-generation decentralized social media platform that's redefining how creators monetize their content through blockchain technology. Our platform combines the best of traditional social media with the power of Web3, creating a truly innovative ecosystem for content creators and consumers alike.

## 🚀 Core Innovation: Content-as-NFT

Bondly introduces a groundbreaking concept where every piece of content can be minted as an NFT, giving creators unprecedented control over their work. This isn't just about digital art – it's about transforming articles, blog posts, and social content into valuable, tradeable assets.

### Key Benefits:
- **True Ownership**: Creators maintain full control over their content
- **Monetization**: Direct revenue through NFT sales and royalties
- **Transparency**: All transactions recorded on the blockchain
- **Interoperability**: NFTs can be traded across multiple platforms

## 💎 Interactive Staking Mechanism

Our platform features a unique interactive staking system that rewards both creators and consumers:

### For Content Creators:
- Earn rewards when users interact with your content
- Build a loyal community through engagement incentives
- Receive BOND tokens for quality content creation

### For Content Consumers:
- Stake tokens to show support for creators
- Earn rewards for meaningful interactions
- Participate in content curation and discovery

## 🔗 Seamless Wallet Integration

Bondly supports multiple blockchain networks, making it accessible to users across the entire Web3 ecosystem:

- **Ethereum**: Main network for high-value transactions
- **Polygon**: Low-cost transactions for everyday interactions
- **Arbitrum**: Fast and efficient Layer 2 scaling
- **Optimism**: Optimistic rollups for enhanced performance
- **BSC**: Binance Smart Chain for broader accessibility

The future of social media is here, and it's decentralized! 🌟`,
		"cover_image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
		"tags":            []string{"bondly", "web3", "nft", "social-media"},
		"likes":           156,
		"views":           3200,
		"is_published":    true,
	},
	{
		"title": "The Bondly Token Economy: A Sustainable Creator Ecosystem",
		"content": `# The Bondly Token Economy: A Sustainable Creator Ecosystem

At the heart of Bondly lies our innovative token economy, designed to create a sustainable and rewarding ecosystem for all participants. The BOND token serves as the foundation for our platform's economic model, enabling seamless interactions and value exchange.

## 🏦 Token Distribution & Utility

### BOND Token Features:
- **Total Supply**: 100,000,000 BOND tokens
- **Initial Airdrop**: 1,000 BOND for new users
- **Staking Rewards**: Earn through content interaction
- **Governance Rights**: Participate in platform decisions

### Economic Model:
1. **Content Creation Rewards**: Creators earn BOND for quality content
2. **Interaction Incentives**: Users earn for meaningful engagement
3. **Staking Mechanisms**: Lock tokens to earn additional rewards
4. **Governance Participation**: Token holders vote on platform proposals

## 🎯 Reputation System

Bondly implements a sophisticated reputation scoring system that rewards quality contributions:

### Reputation Factors:
- **Content Quality**: Engagement rates and user feedback
- **Community Contribution**: Helpful comments and curation
- **Consistency**: Regular activity and reliable participation
- **Innovation**: Unique content and creative approaches

### Benefits of High Reputation:
- Increased visibility for content
- Higher staking rewards
- Governance voting power
- Exclusive platform features

## 🔄 Circular Economy

Our token economy creates a virtuous cycle:
- Creators produce quality content → Earn BOND tokens
- Users engage with content → Earn interaction rewards
- Platform grows → Token value increases
- Community thrives → Sustainable ecosystem

This creates a self-sustaining ecosystem where everyone benefits! 💎`,
		"cover_image_url": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop",
		"tags":            []string{"tokenomics", "bond-token", "reputation", "governance"},
		"likes":           234,
		"views":           4100,
		"is_published":    true,
	},
	{
		"title": "Bondly's Technical Architecture: Building the Future of Social Media",
		"content": `# Bondly's Technical Architecture: Building the Future of Social Media

Bondly's technical foundation represents a cutting-edge approach to decentralized social media, combining robust backend infrastructure with seamless blockchain integration. Our architecture ensures scalability, security, and user experience excellence.

## 🏗️ Backend Infrastructure

### Technology Stack:
- **Go + Gin**: High-performance API framework
- **PostgreSQL**: Reliable relational database
- **Redis**: Fast caching and session management
- **GORM**: Elegant database ORM
- **JWT**: Secure authentication system

### Key Features:
- **RESTful APIs**: Clean, intuitive API design
- **Real-time Updates**: WebSocket support for live interactions
- **File Upload**: IPFS integration for decentralized storage
- **Email Service**: Automated notifications and alerts

## 🔗 Blockchain Integration

### Smart Contract Ecosystem:
- **BondlyToken**: ERC-20 token with governance capabilities
- **ContentNFT**: NFT standard for content tokenization
- **InteractionStaking**: Innovative staking mechanism
- **ReputationVault**: Reputation scoring and rewards
- **BondlyDAO**: Decentralized governance system

### Multi-Chain Support:
- **Ethereum Mainnet**: Primary network for high-value transactions
- **Polygon**: Cost-effective transactions for daily use
- **Arbitrum**: Layer 2 scaling for enhanced performance
- **Optimism**: Optimistic rollups for faster confirmations

## 🛡️ Security & Privacy

### Security Measures:
- **Private Key Encryption**: Secure wallet management
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **Audit Trail**: Complete transaction logging

### Privacy Features:
- **Optional Anonymity**: Users can choose privacy levels
- **Data Ownership**: Users control their personal information
- **Transparent Algorithms**: Open-source reputation system
- **No Centralized Control**: Truly decentralized platform

## 🚀 Performance & Scalability

### Optimization Strategies:
- **Database Indexing**: Optimized query performance
- **Caching Layers**: Redis for fast data access
- **CDN Integration**: Global content delivery
- **Load Balancing**: Horizontal scaling capabilities

The technical excellence behind Bondly ensures a smooth, secure, and scalable user experience! ⚡`,
		"cover_image_url": "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&h=400&fit=crop",
		"tags":            []string{"architecture", "blockchain", "security", "scalability"},
		"likes":           189,
		"views":           2800,
		"is_published":    true,
	},
	{
		"title": "Bondly Governance: Empowering Community-Driven Decisions",
		"content": `# Bondly Governance: Empowering Community-Driven Decisions

Bondly's governance system represents a new paradigm in platform decision-making, where every token holder has a voice in shaping the future of the ecosystem. Our DAO (Decentralized Autonomous Organization) ensures that the platform evolves according to community needs and values.

## 🏛️ Governance Structure

### Proposal System:
- **Community Proposals**: Any token holder can submit proposals
- **Discussion Period**: Open debate and community feedback
- **Voting Mechanism**: Transparent on-chain voting
- **Execution**: Automated implementation of approved proposals

### Voting Power Calculation:
- **Token-Based**: 1 BOND = 1 vote
- **Reputation Bonus**: High-reputation users get additional weight
- **Staking Multiplier**: Staked tokens receive voting bonuses
- **Time Lock**: Long-term holders get increased influence

## 🎯 Governance Categories

### Platform Development:
- **Feature Requests**: New functionality and improvements
- **Technical Upgrades**: Protocol and smart contract updates
- **Integration Proposals**: New blockchain networks and services

### Economic Policy:
- **Token Distribution**: Airdrop and reward adjustments
- **Staking Parameters**: APY rates and lock periods
- **Fee Structures**: Transaction and platform fees

### Community Management:
- **Content Guidelines**: Moderation policies and standards
- **Reputation Rules**: Scoring algorithm adjustments
- **Dispute Resolution**: Conflict resolution mechanisms

## 🔄 Governance Process

### 1. Proposal Submission
- Minimum token requirement for proposal creation
- Clear documentation and rationale required
- Community discussion and feedback period

### 2. Voting Period
- Transparent on-chain voting mechanism
- Real-time vote tracking and results
- Quorum requirements for proposal approval

### 3. Implementation
- Automated execution of approved proposals
- Transparent implementation tracking
- Community oversight and accountability

## 🌟 Benefits of Decentralized Governance

- **Community Ownership**: Users truly own the platform
- **Transparency**: All decisions are publicly visible
- **Innovation**: Rapid iteration based on user feedback
- **Alignment**: Platform evolution matches user needs

Bondly's governance system ensures that the platform remains truly community-driven! 🗳️`,
		"cover_image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
		"tags":            []string{"dao", "governance", "community", "voting"},
		"likes":           145,
		"views":           1900,
		"is_published":    true,
	},
	{
		"title": "Bondly's User Experience: Bridging Web2 and Web3 Seamlessly",
		"content": `# Bondly's User Experience: Bridging Web2 and Web3 Seamlessly

Bondly's user interface and experience design represents a breakthrough in making Web3 technology accessible to mainstream users. We've created an intuitive platform that feels familiar to social media users while unlocking the full potential of blockchain technology.

## 🎨 Design Philosophy

### User-Centric Approach:
- **Familiar Interface**: Social media layout with Web3 enhancements
- **Progressive Disclosure**: Advanced features revealed gradually
- **Clear Onboarding**: Step-by-step guidance for new users
- **Responsive Design**: Seamless experience across all devices

### Visual Identity:
- **Dark Theme**: Modern, professional appearance
- **Consistent Branding**: Cohesive Bondly visual language
- **Accessibility**: WCAG compliant design standards
- **Performance**: Fast loading and smooth interactions

## 🔐 Wallet Integration

### Seamless Connection:
- **Multiple Wallets**: MetaMask, WalletConnect, and more
- **One-Click Login**: Instant wallet-based authentication
- **Cross-Chain Support**: Automatic network detection
- **Security Features**: Encrypted private key storage

### User-Friendly Features:
- **Balance Display**: Real-time token and NFT balances
- **Transaction History**: Clear record of all activities
- **Gas Optimization**: Smart fee estimation and optimization
- **Error Handling**: Helpful messages for common issues

## 📱 Mobile Experience

### Responsive Design:
- **Mobile-First**: Optimized for smartphone users
- **Touch-Friendly**: Intuitive touch interactions
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Real-time updates and alerts

### Performance Optimization:
- **Fast Loading**: Optimized assets and caching
- **Smooth Scrolling**: 60fps animations and transitions
- **Battery Efficient**: Minimal resource consumption
- **Data Saving**: Compressed images and lazy loading

## 🎯 Key User Journeys

### New User Onboarding:
1. **Welcome Screen**: Introduction to Bondly's features
2. **Wallet Connection**: Simple wallet setup process
3. **Airdrop Claim**: Automatic BOND token distribution
4. **Profile Setup**: Customize avatar and bio
5. **First Post**: Guided content creation experience

### Content Creation:
- **Rich Text Editor**: Markdown support with live preview
- **Media Upload**: Drag-and-drop file management
- **NFT Minting**: One-click content tokenization
- **Publishing Options**: Public, private, or token-gated content

### Social Interaction:
- **Like & Comment**: Familiar social media interactions
- **Staking Support**: Show appreciation with token stakes
- **Content Discovery**: AI-powered recommendation engine
- **Community Building**: Follow creators and join discussions

## 🌟 Accessibility Features

- **Screen Reader Support**: Full compatibility with assistive technologies
- **Keyboard Navigation**: Complete keyboard-only operation
- **High Contrast Mode**: Enhanced visibility options
- **Font Scaling**: Adjustable text sizes for readability

Bondly proves that Web3 can be both powerful and user-friendly! ✨`,
		"cover_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
		"tags":            []string{"ux-design", "mobile", "accessibility", "wallet"},
		"likes":           267,
		"views":           3500,
		"is_published":    true,
	},
}

// 评论数据
var comments = []map[string]interface{}{
	{
		"content": "This is exactly what the Web3 social media space needs! The content-as-NFT concept is revolutionary. Can't wait to mint my first article! 🚀",
		"likes":   45,
	},
	{
		"content": "The interactive staking mechanism is brilliant! It creates a real incentive for quality engagement. This could change how we think about content creation.",
		"likes":   32,
	},
	{
		"content": "Finally, a platform that puts creators first! The BOND token economy looks well-designed. How does the reputation system work exactly?",
		"likes":   28,
	},
	{
		"content": "The multi-chain support is a game-changer. Being able to use Polygon for low-cost interactions while keeping high-value content on Ethereum is perfect.",
		"likes":   41,
	},
	{
		"content": "I love how Bondly combines the best of traditional social media with Web3 innovation. The user experience looks seamless!",
		"likes":   23,
	},
	{
		"content": "The token distribution model is fair and sustainable. 1,000 BOND initial airdrop is generous for new users. When can we start earning rewards?",
		"likes":   37,
	},
	{
		"content": "This addresses the biggest problem with current social media - users don't own their data or get rewarded for their contributions. Bondly fixes both!",
		"likes":   52,
	},
	{
		"content": "The reputation system is sophisticated. It's not just about quantity but quality of engagement. This will encourage meaningful interactions.",
		"likes":   29,
	},
	{
		"content": "Governance rights for token holders is a great addition. Community-driven development is the future of social platforms.",
		"likes":   34,
	},
	{
		"content": "The technical architecture looks solid. Backend infrastructure with blockchain integration - this is what we need for mass adoption.",
		"likes":   26,
	},
	{
		"content": "Content monetization through NFTs is genius! Creators can finally capture the full value of their work. This is the future! 💎",
		"likes":   48,
	},
	{
		"content": "I'm excited about the staking rewards. Earning BOND tokens for meaningful interactions creates a positive feedback loop.",
		"likes":   31,
	},
	{
		"content": "The circular economy design is well thought out. Everyone benefits as the platform grows. This could be the next big thing in Web3!",
		"likes":   39,
	},
	{
		"content": "Multi-chain support means accessibility for everyone. Whether you're on Ethereum, Polygon, or BSC, you can participate. Brilliant!",
		"likes":   25,
	},
	{
		"content": "The reputation scoring system will help surface quality content. No more algorithm manipulation - just genuine community curation.",
		"likes":   36,
	},
	{
		"content": "This is the social media platform I've been waiting for! Decentralized, user-owned, and creator-friendly. Count me in! 🌟",
		"likes":   44,
	},
	{
		"content": "The BOND token utility is comprehensive. Staking, governance, rewards - it's a complete ecosystem token. Well designed!",
		"likes":   27,
	},
	{
		"content": "Content-as-NFTs will revolutionize how we think about digital ownership. This is bigger than just social media - it's a paradigm shift.",
		"likes":   50,
	},
	{
		"content": "The interactive staking feature is innovative. Users can show support for creators while earning rewards themselves. Win-win!",
		"likes":   33,
	},
	{
		"content": "I appreciate the focus on user experience. Web3 platforms often sacrifice UX for decentralization, but Bondly seems to balance both perfectly.",
		"likes":   30,
	},
}

// 提案数据
var proposals = []map[string]interface{}{
	{
		"title":         "Implement Token-Gated Content Features",
		"description":   "Proposal to add token-gated content features where users can create exclusive content for token holders. This will incentivize token holding and create new monetization opportunities for creators.",
		"status":        "active",
		"votes_for":     156,
		"votes_against": 23,
		"start_time":    time.Now().AddDate(0, 0, -5),
		"end_time":      time.Now().AddDate(0, 0, 10),
	},
	{
		"title":         "Add Support for Polygon Network",
		"description":   "Proposal to add native support for the Polygon network, allowing users to interact with the platform using MATIC and reducing gas fees for transactions.",
		"status":        "active",
		"votes_for":     89,
		"votes_against": 45,
		"start_time":    time.Now().AddDate(0, 0, -3),
		"end_time":      time.Now().AddDate(0, 0, 12),
	},
	{
		"title":         "Implement Reputation-Based Moderation",
		"description":   "Proposal to implement a reputation-based content moderation system where users with higher reputation scores can help moderate content and earn rewards for their contributions.",
		"status":        "passed",
		"votes_for":     234,
		"votes_against": 67,
		"start_time":    time.Now().AddDate(0, 0, -15),
		"end_time":      time.Now().AddDate(0, 0, -5),
	},
}

// 交易数据
var transactions = []map[string]interface{}{
	{
		"hash":         "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
		"from_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
		"to_address":   "0x8ba1f109551bD432803012645Hac136c772c3c3",
		"value":        "1000000000000000000", // 1 ETH
		"gas_used":     21000,
		"gas_price":    "20000000000", // 20 Gwei
		"status":       "confirmed",
		"block_number": 18500000,
	},
	{
		"hash":         "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
		"from_address": "0x8ba1f109551bD432803012645Hac136c772c3c3",
		"to_address":   "0x1234567890123456789012345678901234567890",
		"value":        "500000000000000000", // 0.5 ETH
		"gas_used":     65000,
		"gas_price":    "25000000000", // 25 Gwei
		"status":       "confirmed",
		"block_number": 18500001,
	},
	{
		"hash":         "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
		"from_address": "0xabcdef1234567890abcdef1234567890abcdef12",
		"to_address":   "0xfedcba0987654321fedcba0987654321fedcba09",
		"value":        "2000000000000000000", // 2 ETH
		"gas_used":     21000,
		"gas_price":    "18000000000", // 18 Gwei
		"status":       "pending",
		"block_number": 0,
	},
}

// 内容数据
var contents = []map[string]interface{}{
	{
		"title":           "Web3 Social: The Next Generation",
		"content":         "Web3 social platforms are redefining digital interaction. This is a draft article.",
		"type":            "article",
		"status":          "draft",
		"likes":           0,
		"dislikes":        0,
		"views":           0,
		"cover_image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
	},
	{
		"title":           "DAO Governance Deep Dive",
		"content":         "A comprehensive guide to DAO governance models and best practices.",
		"type":            "article",
		"status":          "published",
		"likes":           23,
		"dislikes":        1,
		"views":           120,
		"cover_image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
	},
	{
		"title":           "NFT Use Cases in 2025",
		"content":         "NFTs are more than art. Explore their use in gaming, identity, and real estate.",
		"type":            "article",
		"status":          "published",
		"likes":           45,
		"dislikes":        2,
		"views":           340,
		"cover_image_url": "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&h=400&fit=crop",
	},
	{
		"title":           "DeFi Security Checklist",
		"content":         "How to stay safe in DeFi: audits, multisig, and best practices.",
		"type":            "guide",
		"status":          "archived",
		"likes":           12,
		"dislikes":        0,
		"views":           80,
		"cover_image_url": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop",
	},
	{
		"title":           "Layer2 Scaling Solutions",
		"content":         "A technical overview of Layer2 solutions: Optimistic Rollups, ZK Rollups, and more.",
		"type":            "tech",
		"status":          "published",
		"likes":           31,
		"dislikes":        0,
		"views":           210,
		"cover_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
	},
	{
		"title":           "Web3 Community Building",
		"content":         "Tips and tricks for building a strong Web3 community.",
		"type":            "guide",
		"status":          "draft",
		"likes":           0,
		"dislikes":        0,
		"views":           0,
		"cover_image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
	},
}

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 连接数据库
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.CloseConnection(db)

	seeder := &DataSeeder{db: db}

	fmt.Println("🌱 Starting data seeding for Bondly Web3 Social Platform...")
	fmt.Println()

	// 清空现有数据（可选）
	fmt.Println("🧹 Clearing existing data...")
	seeder.clearData()

	// 插入用户数据
	fmt.Println("👥 Seeding users...")
	userIDs := seeder.seedUsers()

	// 插入文章数据
	fmt.Println("📝 Seeding posts...")
	postIDs := seeder.seedPosts(userIDs)

	// 插入内容数据
	fmt.Println("📄 Seeding contents...")
	seeder.seedContents(userIDs)

	// 插入评论数据
	fmt.Println("💬 Seeding comments...")
	seeder.seedComments(userIDs, postIDs)

	// 插入用户关注关系
	fmt.Println("👥 Seeding user followers...")
	seeder.seedUserFollowers(userIDs)

	// 插入钱包绑定
	fmt.Println("🔗 Seeding wallet bindings...")
	seeder.seedWalletBindings(userIDs)

	// 插入提案数据
	fmt.Println("🏛️ Seeding proposals...")
	proposalIDs := seeder.seedProposals(userIDs)

	// 插入投票数据
	fmt.Println("🗳️ Seeding votes...")
	seeder.seedVotes(userIDs, proposalIDs)

	// 插入交易数据
	fmt.Println("💸 Seeding transactions...")
	seeder.seedTransactions()

	fmt.Println()
	fmt.Println("✅ Data seeding completed successfully!")
	fmt.Println("🎉 Your Bondly Web3 Social Platform now has realistic sample data!")
}

func (s *DataSeeder) clearData() {
	// 按依赖关系顺序删除数据
	s.db.Exec("DELETE FROM votes")
	s.db.Exec("DELETE FROM proposals")
	s.db.Exec("DELETE FROM comments")
	s.db.Exec("DELETE FROM posts")
	s.db.Exec("DELETE FROM content_interactions") // 先删除内容互动表
	s.db.Exec("DELETE FROM contents")
	s.db.Exec("DELETE FROM user_followers")
	s.db.Exec("DELETE FROM wallet_bindings")
	s.db.Exec("DELETE FROM transactions")
	s.db.Exec("DELETE FROM airdrop_records") // 添加空投记录表清理
	s.db.Exec("DELETE FROM users")
}

func (s *DataSeeder) seedUsers() []int64 {
	var userIDs []int64

	for _, userData := range users {
		// 设置创建和更新时间
		userData["created_at"] = time.Now().AddDate(0, 0, -rand.Intn(365)) // 随机过去一年内
		userData["updated_at"] = time.Now()
		userData["last_login_at"] = time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour) // 随机过去3天内
		userData["has_received_airdrop"] = false                                              // 添加空投字段

		// 插入用户
		result := s.db.Exec(`
			INSERT INTO users (
				wallet_address, email, nickname, avatar_url, bio, role, 
				reputation_score, has_received_airdrop, last_login_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, userData["wallet_address"], userData["email"], userData["nickname"],
			userData["avatar_url"], userData["bio"], userData["role"],
			userData["reputation_score"], userData["has_received_airdrop"], userData["last_login_at"],
			userData["created_at"], userData["updated_at"])

		if result.Error != nil {
			log.Printf("Error inserting user %s: %v", userData["nickname"], result.Error)
			continue
		}

		// 获取插入的用户ID
		var userID int64
		s.db.Raw("SELECT id FROM users WHERE wallet_address = ?", userData["wallet_address"]).Scan(&userID)
		userIDs = append(userIDs, userID)

		fmt.Printf("  ✅ Created user: %s (ID: %d)\n", userData["nickname"], userID)
	}

	return userIDs
}

func (s *DataSeeder) seedPosts(userIDs []int64) []int64 {
	var postIDs []int64

	for i, postData := range posts {
		authorID := userIDs[i%len(userIDs)] // 循环分配作者

		// 设置创建和更新时间
		postData["author_id"] = authorID
		postData["created_at"] = time.Now().AddDate(0, 0, -rand.Intn(30)) // 随机过去30天内
		postData["updated_at"] = time.Now().AddDate(0, 0, -rand.Intn(7))  // 随机过去7天内

		// 插入文章
		result := s.db.Exec(`
			INSERT INTO posts (
				author_id, title, content, cover_image_url, tags, 
				likes, views, is_published, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, postData["author_id"], postData["title"], postData["content"],
			postData["cover_image_url"], postData["tags"], postData["likes"],
			postData["views"], postData["is_published"], postData["created_at"],
			postData["updated_at"])

		if result.Error != nil {
			log.Printf("Error inserting post %s: %v", postData["title"], result.Error)
			continue
		}

		// 获取插入的文章ID
		var postID int64
		s.db.Raw("SELECT id FROM posts WHERE title = ?", postData["title"]).Scan(&postID)
		postIDs = append(postIDs, postID)

		fmt.Printf("  ✅ Created post: %s (ID: %d)\n", postData["title"], postID)
	}

	return postIDs
}

func (s *DataSeeder) seedContents(userIDs []int64) {
	if len(userIDs) == 0 {
		fmt.Println("  ⚠️  Skipping contents: no users available")
		return
	}
	for i, contentData := range contents {
		authorID := userIDs[i%len(userIDs)]
		contentData["author_id"] = authorID
		contentData["created_at"] = time.Now().AddDate(0, 0, -rand.Intn(60))
		contentData["updated_at"] = time.Now().AddDate(0, 0, -rand.Intn(30))
		// 插入内容
		result := s.db.Exec(`
			INSERT INTO contents (
				author_id, title, content, type, status, likes, dislikes, views, cover_image_url, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, contentData["author_id"], contentData["title"], contentData["content"], contentData["type"], contentData["status"], contentData["likes"], contentData["dislikes"], contentData["views"], contentData["cover_image_url"], contentData["created_at"], contentData["updated_at"])
		if result.Error != nil {
			log.Printf("Error inserting content %s: %v", contentData["title"], result.Error)
			continue
		}
		fmt.Printf("  ✅ Created content: %s (author ID: %d)\n", contentData["title"], authorID)
	}
}

func (s *DataSeeder) seedComments(userIDs, postIDs []int64) {
	// 检查是否有可用的用户和文章
	if len(userIDs) == 0 || len(postIDs) == 0 {
		fmt.Println("  ⚠️  Skipping comments: no users or posts available")
		return
	}

	for _, commentData := range comments {
		authorID := userIDs[rand.Intn(len(userIDs))]
		postID := postIDs[rand.Intn(len(postIDs))]

		// 设置创建和更新时间
		commentData["post_id"] = postID
		commentData["author_id"] = authorID
		commentData["created_at"] = time.Now().AddDate(0, 0, -rand.Intn(14)) // 随机过去14天内
		commentData["updated_at"] = time.Now().AddDate(0, 0, -rand.Intn(7))  // 随机过去7天内

		// 插入评论
		result := s.db.Exec(`
			INSERT INTO comments (
				post_id, author_id, content, likes, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?)
		`, commentData["post_id"], commentData["author_id"], commentData["content"],
			commentData["likes"], commentData["created_at"], commentData["updated_at"])

		if result.Error != nil {
			log.Printf("Error inserting comment: %v", result.Error)
			continue
		}

		fmt.Printf("  ✅ Created comment by user ID %d on post ID %d\n", authorID, postID)
	}
}

func (s *DataSeeder) seedUserFollowers(userIDs []int64) {
	// 检查用户数量
	if len(userIDs) < 2 {
		fmt.Println("  ⚠️  Skipping user followers: not enough users")
		return
	}

	// 创建一些关注关系（确保索引在范围内）
	followRelations := [][]int64{
		{0, 1}, {0, 2}, {0, 3}, // Alice follows Bob, Carol, Dave
		{1, 0}, {1, 2}, {1, 4}, // Bob follows Alice, Carol, Eve
		{2, 0}, {2, 1}, {2, 5}, // Carol follows Alice, Bob, Frank
		{3, 0}, {3, 1}, {3, 6}, // Dave follows Alice, Bob, Grace
		{4, 0}, {4, 2}, {4, 6}, // Eve follows Alice, Carol, Grace
		{5, 1}, {5, 3}, {5, 6}, // Frank follows Bob, Dave, Grace
		{6, 2}, {6, 4}, {6, 5}, // Grace follows Carol, Eve, Frank
	}

	for _, relation := range followRelations {
		followerID := userIDs[relation[0]]
		followedID := userIDs[relation[1]]

		createdAt := time.Now().AddDate(0, 0, -rand.Intn(60)) // 随机过去60天内

		result := s.db.Exec(`
			INSERT INTO user_followers (follower_id, followed_id, created_at)
			VALUES (?, ?, ?)
		`, followerID, followedID, createdAt)

		if result.Error != nil {
			log.Printf("Error inserting follower relation: %v", result.Error)
			continue
		}

		fmt.Printf("  ✅ User %d now follows User %d\n", followerID, followedID)
	}
}

func (s *DataSeeder) seedWalletBindings(userIDs []int64) {
	networks := []string{"ethereum", "polygon", "arbitrum", "optimism", "bsc"}

	for _, userID := range userIDs {
		// 每个用户绑定1-3个不同网络的钱包
		numBindings := rand.Intn(3) + 1

		for j := 0; j < numBindings; j++ {
			network := networks[rand.Intn(len(networks))]

			// 生成随机钱包地址
			walletAddress := fmt.Sprintf("0x%040x", rand.Int63())

			createdAt := time.Now().AddDate(0, 0, -rand.Intn(90)) // 随机过去90天内

			result := s.db.Exec(`
				INSERT INTO wallet_bindings (user_id, wallet_address, network, created_at)
				VALUES (?, ?, ?, ?)
			`, userID, walletAddress, network, createdAt)

			if result.Error != nil {
				log.Printf("Error inserting wallet binding: %v", result.Error)
				continue
			}

			fmt.Printf("  ✅ User %d bound %s wallet: %s\n", userID, network, walletAddress)
		}
	}
}

func (s *DataSeeder) seedProposals(userIDs []int64) []int64 {
	var proposalIDs []int64

	for _, proposalData := range proposals {
		proposerID := userIDs[rand.Intn(len(userIDs))]

		// 设置提案人ID和创建时间
		proposalData["proposer_id"] = proposerID
		proposalData["created_at"] = proposalData["start_time"]
		proposalData["updated_at"] = time.Now()

		// 插入提案
		result := s.db.Exec(`
			INSERT INTO proposals (
				title, description, proposer_id, status, votes_for, votes_against,
				start_time, end_time, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, proposalData["title"], proposalData["description"], proposalData["proposer_id"],
			proposalData["status"], proposalData["votes_for"], proposalData["votes_against"],
			proposalData["start_time"], proposalData["end_time"], proposalData["created_at"],
			proposalData["updated_at"])

		if result.Error != nil {
			log.Printf("Error inserting proposal %s: %v", proposalData["title"], result.Error)
			continue
		}

		// 获取插入的提案ID
		var proposalID int64
		s.db.Raw("SELECT id FROM proposals WHERE title = ?", proposalData["title"]).Scan(&proposalID)
		proposalIDs = append(proposalIDs, proposalID)

		fmt.Printf("  ✅ Created proposal: %s (ID: %d)\n", proposalData["title"], proposalID)
	}

	return proposalIDs
}

func (s *DataSeeder) seedVotes(userIDs, proposalIDs []int64) {
	// 为每个提案创建一些投票
	for _, proposalID := range proposalIDs {
		// 随机选择一些用户进行投票
		numVoters := rand.Intn(5) + 3 // 3-7个投票者

		for j := 0; j < numVoters; j++ {
			voterID := userIDs[rand.Intn(len(userIDs))]
			vote := rand.Float32() > 0.3   // 70%赞成，30%反对
			weight := rand.Int63n(100) + 1 // 1-100的权重

			createdAt := time.Now().AddDate(0, 0, -rand.Intn(10)) // 随机过去10天内

			result := s.db.Exec(`
				INSERT INTO votes (proposal_id, voter_id, vote, weight, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)
			`, proposalID, voterID, vote, weight, createdAt, createdAt)

			if result.Error != nil {
				log.Printf("Error inserting vote: %v", result.Error)
				continue
			}

			voteText := "FOR"
			if !vote {
				voteText = "AGAINST"
			}
			fmt.Printf("  ✅ User %d voted %s on proposal %d (weight: %d)\n", voterID, voteText, proposalID, weight)
		}
	}
}

func (s *DataSeeder) seedTransactions() {
	for _, txData := range transactions {
		createdAt := time.Now().AddDate(0, 0, -rand.Intn(30)) // 随机过去30天内
		updatedAt := createdAt.Add(time.Duration(rand.Intn(24)) * time.Hour)

		result := s.db.Exec(`
			INSERT INTO transactions (
				hash, from_address, to_address, value, gas_used, gas_price,
				status, block_number, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, txData["hash"], txData["from_address"], txData["to_address"],
			txData["value"], txData["gas_used"], txData["gas_price"],
			txData["status"], txData["block_number"], createdAt, updatedAt)

		if result.Error != nil {
			log.Printf("Error inserting transaction: %v", result.Error)
			continue
		}

		fmt.Printf("  ✅ Created transaction: %s\n", txData["hash"])
	}
}
