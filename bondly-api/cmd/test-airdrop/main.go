package main

import (
	"bondly-api/config"
	"bondly-api/internal/blockchain"
	"bondly-api/internal/repositories"
	"bondly-api/internal/services"
	"fmt"
	"log"
	"math/big"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("🧪 Testing Airdrop Functionality...")

	// 1. 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. 连接数据库
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.Name, cfg.Database.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 3. 初始化以太坊客户端
	ethClient, err := blockchain.NewEthereumClient(cfg.Ethereum)
	if err != nil {
		log.Fatalf("Failed to initialize ethereum client: %v", err)
	}
	defer ethClient.Close()

	// 4. 初始化用户仓库
	userRepo := repositories.NewUserRepository(db)

	// 5. 初始化空投服务
	_ = services.NewAirdropService(ethClient, userRepo, cfg)

	// 6. 测试中转钱包余额
	relayWalletAddress := "0x2C830B8D1a6A9B840bde165a36df2A69fc9AA075"
	bondTokenAddress := "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E"

	fmt.Printf("\n📊 Checking relay wallet balance...\n")
	fmt.Printf("Relay Wallet: %s\n", relayWalletAddress)
	fmt.Printf("BOND Token: %s\n", bondTokenAddress)

	balance, err := ethClient.GetTokenBalance(bondTokenAddress, relayWalletAddress)
	if err != nil {
		log.Printf("Failed to get balance: %v", err)
	} else {
		fmt.Printf("Balance: %s BOND\n", balance.String())
	}

	// 7. 测试网络连接
	fmt.Printf("\n🌐 Testing network connection...\n")
	networkID, err := ethClient.GetNetworkID()
	if err != nil {
		log.Printf("Failed to get network ID: %v", err)
	} else {
		fmt.Printf("Network ID: %s\n", networkID.String())
	}

	blockNumber, err := ethClient.GetBlockNumber()
	if err != nil {
		log.Printf("Failed to get block number: %v", err)
	} else {
		fmt.Printf("Current Block: %d\n", blockNumber)
	}

	// 8. 测试空投功能（模拟）
	fmt.Printf("\n🎁 Testing airdrop functionality...\n")
	_ = "0x1234567890123456789012345678901234567890" // 测试地址（未使用）

	// 检查配置
	if cfg.Ethereum.RelayWalletKey == "" {
		fmt.Println("⚠️  Warning: ETH_RELAY_WALLET_KEY not configured")
		fmt.Println("   Please set ETH_RELAY_WALLET_KEY in your .env file")
	} else {
		fmt.Println("✅ Relay wallet key is configured")
	}

	// 9. 显示配置信息
	fmt.Printf("\n⚙️  Configuration:\n")
	fmt.Printf("RPC URL: %s\n", cfg.Ethereum.RPCURL)
	fmt.Printf("Relay Wallet Key: %s...\n", cfg.Ethereum.RelayWalletKey[:10]+"...")
	fmt.Printf("BOND Token Address: %s\n", bondTokenAddress)

	// 10. 计算空投金额
	airdropAmount := big.NewInt(1000) // 1000 BOND
	airdropAmountWei := new(big.Int).Mul(airdropAmount, big.NewInt(1e18))
	fmt.Printf("\n💰 Airdrop Amount: %s BOND (%s wei)\n", airdropAmount.String(), airdropAmountWei.String())

	fmt.Println("\n✅ Airdrop test completed!")
	fmt.Println("💡 To test actual airdrop, register a new user with a wallet address")
}
