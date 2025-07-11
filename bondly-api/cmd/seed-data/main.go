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
		"email":            "alice@web3.com",
		"nickname":         "Alice Crypto",
		"avatar_url":       "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
		"bio":              "Web3 enthusiast | DeFi researcher | Building the future of decentralized social media",
		"role":             "user",
		"reputation_score": 1250,
	},
	{
		"wallet_address":   "0x8ba1f109551bd432803012645aac136c772c3c3",
		"email":            "bob@web3.com",
		"nickname":         "Bob Blockchain",
		"avatar_url":       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
		"bio":              "Smart contract developer | NFT artist | Exploring the intersection of art and technology",
		"role":             "user",
		"reputation_score": 890,
	},
	{
		"wallet_address":   "0x1234567890123456789012345678901234567890",
		"email":            "carol@web3.com",
		"nickname":         "Carol DAO",
		"avatar_url":       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
		"bio":              "DAO governance expert | Community builder | Empowering decentralized decision making",
		"role":             "moderator",
		"reputation_score": 2100,
	},
	{
		"wallet_address":   "0x9876543210987654321098765432109876543210",
		"email":            "dave@web3.com",
		"nickname":         "Dave DeFi",
		"avatar_url":       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
		"bio":              "DeFi strategist | Yield farmer | Sharing insights on the latest protocols",
		"role":             "user",
		"reputation_score": 1560,
	},
	{
		"wallet_address":   "0xabcdef1234567890abcdef1234567890abcdef12",
		"email":            "eve@web3.com",
		"nickname":         "Eve NFT",
		"avatar_url":       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
		"bio":              "NFT collector | Digital art curator | Building bridges between traditional and digital art",
		"role":             "user",
		"reputation_score": 980,
	},
	{
		"wallet_address":   "0xfedcba0987654321fedcba0987654321fedcba09",
		"email":            "frank@web3.com",
		"nickname":         "Frank Layer2",
		"avatar_url":       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
		"bio":              "Layer 2 researcher | Scaling solutions | Making blockchain accessible to everyone",
		"role":             "user",
		"reputation_score": 1340,
	},
	{
		"wallet_address":   "0x1111111111111111111111111111111111111111",
		"email":            "grace@web3.com",
		"nickname":         "Grace Governance",
		"avatar_url":       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
		"bio":              "Governance specialist | Tokenomics expert | Designing sustainable token economies",
		"role":             "admin",
		"reputation_score": 3200,
	},
	{
		"wallet_address":   "0x2222222222222222222222222222222222222222",
		"email":            "henry@web3.com",
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
		"title": "The Future of Decentralized Social Media",
		"content": `# The Future of Decentralized Social Media

In the era of Web3, we're witnessing a paradigm shift in how we think about social media. Traditional platforms have centralized control over user data, content moderation, and monetization. But what if we could build a social media platform that's truly owned by its users?

## Key Benefits of Decentralized Social Media

1. **User Ownership**: Users own their data and content
2. **Censorship Resistance**: No single entity can censor content
3. **Monetization**: Direct creator-to-fan relationships
4. **Interoperability**: Cross-platform data portability

## Technical Challenges

Building decentralized social media comes with unique challenges:
- Scalability issues with blockchain
- Content moderation in a decentralized environment
- User experience vs decentralization trade-offs

The future is bright for Web3 social platforms! 🚀`,
		"cover_image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
		"tags":            []string{"web3", "social-media", "decentralization"},
		"likes":           45,
		"views":           1200,
		"is_published":    true,
	},
	{
		"title": "Understanding DeFi Yield Farming Strategies",
		"content": `# Understanding DeFi Yield Farming Strategies

Yield farming has become one of the most popular ways to earn passive income in the DeFi ecosystem. But what exactly is yield farming, and how can you get started?

## What is Yield Farming?

Yield farming is the practice of lending or staking cryptocurrency to earn rewards in the form of additional cryptocurrency. It's essentially earning interest on your crypto holdings.

## Popular Yield Farming Strategies

### 1. Liquidity Provision
Provide liquidity to DEX pairs and earn trading fees plus token rewards.

### 2. Staking
Stake your tokens in various protocols to earn staking rewards.

### 3. Lending
Lend your crypto assets on lending platforms like Aave or Compound.

## Risk Management

Remember: Higher yields often come with higher risks. Always:
- Do your own research
- Understand the smart contracts
- Diversify your investments
- Never invest more than you can afford to lose

Stay safe and happy farming! 🌾`,
		"cover_image_url": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop",
		"tags":            []string{"defi", "yield-farming", "cryptocurrency"},
		"likes":           67,
		"views":           2100,
		"is_published":    true,
	},
	{
		"title": "NFTs: Beyond Digital Art",
		"content": `# NFTs: Beyond Digital Art

While NFTs are often associated with digital art, their potential applications extend far beyond the art world. Let's explore some innovative use cases.

## Real Estate NFTs

Tokenizing real estate properties as NFTs can:
- Fractionalize ownership
- Reduce transaction costs
- Increase liquidity
- Enable global investment

## Identity and Credentials

NFTs can represent:
- Educational certificates
- Professional licenses
- Membership cards
- Identity documents

## Gaming and Virtual Worlds

In gaming, NFTs enable:
- True ownership of in-game assets
- Cross-game interoperability
- Player-driven economies
- Unique digital experiences

## The Future of NFTs

The NFT ecosystem is still in its early stages. As technology evolves, we'll see even more innovative applications that we haven't even imagined yet.

What's your favorite NFT use case? 🤔`,
		"cover_image_url": "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&h=400&fit=crop",
		"tags":            []string{"nft", "blockchain", "innovation"},
		"likes":           89,
		"views":           3400,
		"is_published":    true,
	},
	{
		"title": "DAO Governance: A Complete Guide",
		"content": `# DAO Governance: A Complete Guide

Decentralized Autonomous Organizations (DAOs) are revolutionizing how we think about organizational structure and decision-making.

## What is a DAO?

A DAO is an organization governed by smart contracts and community voting, rather than traditional hierarchical management.

## Governance Models

### 1. Token-Based Voting
Each token represents one vote. More tokens = more voting power.

### 2. Reputation-Based Voting
Voting power based on contribution and reputation within the community.

### 3. Quadratic Voting
Voting power increases with the square root of tokens held.

## Best Practices

- Transparent proposal process
- Clear voting mechanisms
- Effective communication channels
- Regular community engagement

## Challenges

- Voter apathy
- Sybil attacks
- Decision paralysis
- Scalability issues

DAOs represent the future of organizational governance! 🏛️`,
		"cover_image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
		"tags":            []string{"dao", "governance", "decentralization"},
		"likes":           56,
		"views":           1800,
		"is_published":    true,
	},
	{
		"title": "Layer 2 Scaling Solutions Explained",
		"content": `# Layer 2 Scaling Solutions Explained

As Ethereum's popularity grows, so do the challenges of network congestion and high gas fees. Layer 2 solutions offer a promising path forward.

## What are Layer 2 Solutions?

Layer 2 solutions are protocols that run on top of the main blockchain (Layer 1) to improve scalability and reduce transaction costs.

## Popular Layer 2 Solutions

### 1. Optimistic Rollups
- Arbitrum
- Optimism
- Boba Network

### 2. ZK Rollups
- zkSync
- StarkNet
- Polygon zkEVM

### 3. State Channels
- Lightning Network (Bitcoin)
- Raiden Network (Ethereum)

## Benefits

- Lower transaction fees
- Faster transaction times
- Maintained security
- Better user experience

## Trade-offs

- Centralization concerns
- Security assumptions
- User experience complexity

Layer 2 solutions are crucial for mass adoption! ⚡`,
		"cover_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
		"tags":            []string{"layer2", "scaling", "ethereum"},
		"likes":           78,
		"views":           2900,
		"is_published":    true,
	},
}

// 评论数据
var comments = []map[string]interface{}{
	{
		"content": "Great article! I've been following the development of decentralized social media platforms and it's exciting to see the progress being made.",
		"likes":   12,
	},
	{
		"content": "The point about user ownership is crucial. Traditional platforms treat users as products, but Web3 social media puts users first.",
		"likes":   8,
	},
	{
		"content": "I'm curious about how content moderation will work in a truly decentralized environment. Any thoughts on that?",
		"likes":   15,
	},
	{
		"content": "Yield farming has been my main source of income for the past year. This guide is spot on!",
		"likes":   23,
	},
	{
		"content": "Remember to always DYOR (Do Your Own Research) before jumping into any DeFi protocol!",
		"likes":   19,
	},
	{
		"content": "NFTs in gaming are going to be huge. I can't wait to see how this develops!",
		"likes":   31,
	},
	{
		"content": "The real estate NFT concept is fascinating. It could democratize property investment globally.",
		"likes":   14,
	},
	{
		"content": "DAO governance is the future of organizational management. Great breakdown!",
		"likes":   27,
	},
	{
		"content": "Layer 2 solutions are essential for Ethereum's success. Great overview of the different approaches.",
		"likes":   18,
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
		"title":    "Web3 Social: The Next Generation",
		"content":  "Web3 social platforms are redefining digital interaction. This is a draft article.",
		"type":     "article",
		"status":   "draft",
		"likes":    0,
		"dislikes": 0,
		"views":    0,
	},
	{
		"title":    "DAO Governance Deep Dive",
		"content":  "A comprehensive guide to DAO governance models and best practices.",
		"type":     "article",
		"status":   "published",
		"likes":    23,
		"dislikes": 1,
		"views":    120,
	},
	{
		"title":    "NFT Use Cases in 2025",
		"content":  "NFTs are more than art. Explore their use in gaming, identity, and real estate.",
		"type":     "article",
		"status":   "published",
		"likes":    45,
		"dislikes": 2,
		"views":    340,
	},
	{
		"title":    "DeFi Security Checklist",
		"content":  "How to stay safe in DeFi: audits, multisig, and best practices.",
		"type":     "guide",
		"status":   "archived",
		"likes":    12,
		"dislikes": 0,
		"views":    80,
	},
	{
		"title":    "Layer2 Scaling Solutions",
		"content":  "A technical overview of Layer2 solutions: Optimistic Rollups, ZK Rollups, and more.",
		"type":     "tech",
		"status":   "published",
		"likes":    31,
		"dislikes": 0,
		"views":    210,
	},
	{
		"title":    "Web3 Community Building",
		"content":  "Tips and tricks for building a strong Web3 community.",
		"type":     "guide",
		"status":   "draft",
		"likes":    0,
		"dislikes": 0,
		"views":    0,
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
	s.db.Exec("DELETE FROM contents")
	s.db.Exec("DELETE FROM user_followers")
	s.db.Exec("DELETE FROM wallet_bindings")
	s.db.Exec("DELETE FROM transactions")
	s.db.Exec("DELETE FROM users")
}

func (s *DataSeeder) seedUsers() []int64 {
	var userIDs []int64

	for _, userData := range users {
		// 设置创建和更新时间
		userData["created_at"] = time.Now().AddDate(0, 0, -rand.Intn(365)) // 随机过去一年内
		userData["updated_at"] = time.Now()
		userData["last_login_at"] = time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour) // 随机过去3天内

		// 插入用户
		result := s.db.Exec(`
			INSERT INTO users (
				wallet_address, email, nickname, avatar_url, bio, role, 
				reputation_score, last_login_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, userData["wallet_address"], userData["email"], userData["nickname"],
			userData["avatar_url"], userData["bio"], userData["role"],
			userData["reputation_score"], userData["last_login_at"],
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
				author_id, title, content, type, status, likes, dislikes, views, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, contentData["author_id"], contentData["title"], contentData["content"], contentData["type"], contentData["status"], contentData["likes"], contentData["dislikes"], contentData["views"], contentData["created_at"], contentData["updated_at"])
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
