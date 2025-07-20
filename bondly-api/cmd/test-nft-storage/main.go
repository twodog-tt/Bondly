package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"bondly-api/internal/models"
	"fmt"
	"log"
	"time"
)

func main() {
	fmt.Println("🧪 Testing NFT storage functionality...")

	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// 初始化数据库连接
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 自动迁移数据库表
	err = database.AutoMigrate(db, &models.User{}, &models.Content{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 直接使用数据库操作
	email := fmt.Sprintf("test%d@example.com", time.Now().Unix())
	nickname := "Test User"

	// 先创建一个测试用户
	testUser := &models.User{
		Email:    &email,
		Nickname: nickname,
		Role:     "user",
	}

	result := db.Create(testUser)
	if result.Error != nil {
		log.Fatal("Failed to create test user:", result.Error)
	}

	fmt.Printf("✅ Created test user with ID: %d\n", testUser.ID)

	// 创建测试内容
	testContent := &models.Content{
		Title:    "Test NFT Article",
		Content:  "This is a test article for NFT functionality",
		Type:     "article",
		Status:   "draft",
		AuthorID: testUser.ID,
	}

	result = db.Create(testContent)
	if result.Error != nil {
		log.Fatal("Failed to create test content:", result.Error)
	}

	fmt.Printf("✅ Created test content with ID: %d\n", testContent.ID)

	// 模拟NFT数据（模拟前端传递的数据）
	nftTokenID := int64(123)
	nftContractAddress := "0xA8D4C5bD21Feba75BF99879B34cf35E82dB5aCEC"
	ipfsHash := "QmTestHash123"
	metadataHash := "QmMetadataHash456"

	// 更新内容，添加NFT信息（模拟前端updateContent调用）
	updateData := map[string]interface{}{
		"nft_token_id":         nftTokenID,
		"nft_contract_address": nftContractAddress,
		"ip_fs_hash":           ipfsHash,
		"metadata_hash":        metadataHash,
	}

	result = db.Model(&models.Content{}).Where("id = ?", testContent.ID).Updates(updateData)
	if result.Error != nil {
		log.Fatal("Failed to update content with NFT data:", result.Error)
	}

	// 查询更新后的内容
	var updatedContent models.Content
	result = db.Select("id, author_id, title, content, type, status, cover_image_url, nft_token_id, nft_contract_address, ip_fs_hash, metadata_hash, likes, dislikes, views, created_at, updated_at").First(&updatedContent, testContent.ID)
	if result.Error != nil {
		log.Fatal("Failed to query updated content:", result.Error)
	}

	fmt.Println("✅ Successfully updated content with NFT data:")
	fmt.Printf("  - NFT Token ID: %v\n", updatedContent.NFTTokenID)
	fmt.Printf("  - NFT Contract Address: %v\n", updatedContent.NFTContractAddress)
	fmt.Printf("  - IPFS Hash: %v\n", updatedContent.IPFSHash)
	fmt.Printf("  - Metadata Hash: %v\n", updatedContent.MetadataHash)

	// 验证数据是否正确保存
	if updatedContent.NFTTokenID == nil || *updatedContent.NFTTokenID != nftTokenID {
		log.Fatal("❌ NFT Token ID not saved correctly")
	}
	if updatedContent.NFTContractAddress == nil || *updatedContent.NFTContractAddress != nftContractAddress {
		log.Fatal("❌ NFT Contract Address not saved correctly")
	}
	if updatedContent.IPFSHash == nil || *updatedContent.IPFSHash != ipfsHash {
		log.Fatal("❌ IPFS Hash not saved correctly")
	}
	if updatedContent.MetadataHash == nil || *updatedContent.MetadataHash != metadataHash {
		log.Fatal("❌ Metadata Hash not saved correctly")
	}

	fmt.Println("🎉 All NFT data saved correctly!")
	fmt.Println("📝 Now the backend should be able to store NFT information properly!")
}
