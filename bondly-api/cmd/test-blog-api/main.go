package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"bondly-api/internal/services"
	"bondly-api/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

func main() {
	fmt.Println("🧪 Testing blog API with real JWT authentication...")

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

	// 初始化JWT工具
	utils.InitJWTUtil(cfg.JWT.Secret, cfg.JWT.ExpiresIn)

	// 创建测试用户
	email := fmt.Sprintf("test%d@example.com", time.Now().Unix())
	nickname := "Test User"

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

	// 生成JWT token
	token, err := utils.GenerateJWT(testUser.ID, email, testUser.Role, "")
	if err != nil {
		log.Fatal("Failed to generate JWT token:", err)
	}

	fmt.Printf("✅ Generated JWT token: %s...\n", token[:20])

	// 初始化服务和仓库
	contentRepo := repositories.NewContentRepository(db)
	contentService := services.NewContentService(contentRepo)

	// 测试1: 模拟前端创建博客的请求
	fmt.Println("\n📝 Test 1: Simulating frontend blog creation request...")

	// 模拟前端发送的CreateContentRequest
	createReq := dto.CreateContentRequest{
		Title:         "My Test Blog Post",
		Content:       "This is the content of my test blog post.",
		Type:          "article",
		Status:        "draft",
		CoverImageURL: nil,
	}

	fmt.Printf("Request data: %+v\n", createReq)

	// 模拟handler中的处理逻辑
	content := models.Content{
		AuthorID:      testUser.ID,
		Title:         createReq.Title,
		Content:       createReq.Content,
		Type:          createReq.Type,
		Status:        createReq.Status,
		CoverImageURL: createReq.CoverImageURL,
	}

	// 调用service创建内容
	err = contentService.CreateContent(context.Background(), &content)
	if err != nil {
		log.Fatal("Failed to create content via service:", err)
	}

	fmt.Printf("✅ Created content via service, ID: %d\n", content.ID)

	// 测试2: 验证JWT token
	fmt.Println("\n📝 Test 2: Validating JWT token...")
	claims, err := utils.ValidateJWT(token)
	if err != nil {
		log.Fatal("Failed to validate JWT token:", err)
	}

	fmt.Printf("✅ JWT token validated successfully\n")
	fmt.Printf("   User ID: %d\n", claims.UserID)
	fmt.Printf("   Role: %s\n", claims.Role)
	fmt.Printf("   Expires at: %v\n", claims.ExpiresAt)

	// 测试3: 模拟NFT更新
	fmt.Println("\n📝 Test 3: Simulating NFT update...")

	// 模拟NFT数据
	nftTokenID := int64(123)
	nftContractAddress := "0xA8D4C5bD21Feba75BF99879B34cf35E82dB5aCEC"
	ipfsHash := "QmTestHash123"
	metadataHash := "QmMetadataHash456"

	// 模拟UpdateContentRequest
	updateReq := dto.UpdateContentRequest{
		NFTTokenID:         &nftTokenID,
		NFTContractAddress: &nftContractAddress,
		IPFSHash:           &ipfsHash,
		MetadataHash:       &metadataHash,
	}

	fmt.Printf("NFT update request: %+v\n", updateReq)

	// 构建更新数据
	updateData := models.Content{}
	if updateReq.NFTTokenID != nil {
		updateData.NFTTokenID = updateReq.NFTTokenID
	}
	if updateReq.NFTContractAddress != nil {
		updateData.NFTContractAddress = updateReq.NFTContractAddress
	}
	if updateReq.IPFSHash != nil {
		updateData.IPFSHash = updateReq.IPFSHash
	}
	if updateReq.MetadataHash != nil {
		updateData.MetadataHash = updateReq.MetadataHash
	}

	// 调用service更新内容
	updatedContent, err := contentService.UpdateContent(context.Background(), content.ID, &updateData)
	if err != nil {
		log.Fatal("Failed to update content with NFT data:", err)
	}

	fmt.Printf("✅ Updated content with NFT data, ID: %d\n", updatedContent.ID)

	// 测试4: 验证最终结果
	fmt.Println("\n📝 Test 4: Verifying final result...")

	// 查询最终的内容
	finalContent, err := contentService.GetContent(context.Background(), content.ID)
	if err != nil {
		log.Fatal("Failed to get final content:", err)
	}

	fmt.Printf("✅ Final content retrieved:\n")
	fmt.Printf("   ID: %d\n", finalContent.ID)
	fmt.Printf("   Title: %s\n", finalContent.Title)
	fmt.Printf("   Type: %s\n", finalContent.Type)
	fmt.Printf("   Status: %s\n", finalContent.Status)
	fmt.Printf("   NFT Token ID: %v\n", finalContent.NFTTokenID)
	fmt.Printf("   NFT Contract Address: %v\n", finalContent.NFTContractAddress)
	fmt.Printf("   IPFS Hash: %v\n", finalContent.IPFSHash)
	fmt.Printf("   Metadata Hash: %v\n", finalContent.MetadataHash)

	// 测试5: 验证JSON序列化
	fmt.Println("\n📝 Test 5: Testing JSON serialization...")

	// 测试CreateContentRequest的JSON序列化
	createReqJSON, err := json.Marshal(createReq)
	if err != nil {
		log.Fatal("Failed to marshal CreateContentRequest:", err)
	}
	fmt.Printf("CreateContentRequest JSON: %s\n", string(createReqJSON))

	// 测试UpdateContentRequest的JSON序列化
	updateReqJSON, err := json.Marshal(updateReq)
	if err != nil {
		log.Fatal("Failed to marshal UpdateContentRequest:", err)
	}
	fmt.Printf("UpdateContentRequest JSON: %s\n", string(updateReqJSON))

	// 测试ContentResponse的JSON序列化
	contentResponse := dto.ContentResponse{
		ID:                 finalContent.ID,
		AuthorID:           finalContent.AuthorID,
		Title:              finalContent.Title,
		Content:            finalContent.Content,
		Type:               finalContent.Type,
		Status:             finalContent.Status,
		CoverImageURL:      finalContent.CoverImageURL,
		NFTTokenID:         finalContent.NFTTokenID,
		NFTContractAddress: finalContent.NFTContractAddress,
		IPFSHash:           finalContent.IPFSHash,
		MetadataHash:       finalContent.MetadataHash,
		Likes:              finalContent.Likes,
		Dislikes:           finalContent.Dislikes,
		Views:              finalContent.Views,
		CreatedAt:          finalContent.CreatedAt,
		UpdatedAt:          finalContent.UpdatedAt,
	}

	contentResponseJSON, err := json.Marshal(contentResponse)
	if err != nil {
		log.Fatal("Failed to marshal ContentResponse:", err)
	}
	fmt.Printf("ContentResponse JSON: %s\n", string(contentResponseJSON))

	fmt.Println("\n🎉 Blog API tests completed successfully!")
	fmt.Println("📋 Summary:")
	fmt.Println("  - JWT authentication: ✅")
	fmt.Println("  - Blog creation: ✅")
	fmt.Println("  - NFT data update: ✅")
	fmt.Println("  - JSON serialization: ✅")
	fmt.Println("  - Database persistence: ✅")

	fmt.Println("\n🔍 Potential issues to check:")
	fmt.Println("  1. Frontend JWT token handling")
	fmt.Println("  2. API request headers (Authorization: Bearer <token>)")
	fmt.Println("  3. CORS configuration")
	fmt.Println("  4. Network connectivity")
	fmt.Println("  5. Server logs for detailed error messages")
}
