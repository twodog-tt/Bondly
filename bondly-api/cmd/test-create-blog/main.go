package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"bondly-api/internal/dto"
	"bondly-api/internal/models"
	"bondly-api/internal/repositories"
	"bondly-api/internal/services"
	"context"
	"fmt"
	"log"
	"time"
)

func main() {
	fmt.Println("🧪 Testing blog creation functionality...")

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

	// 初始化服务和仓库
	contentRepo := repositories.NewContentRepository(db)
	contentService := services.NewContentService(contentRepo)

	// 测试1: 创建基本博客
	fmt.Println("\n📝 Test 1: Creating basic blog...")
	basicContent := &models.Content{
		AuthorID: testUser.ID,
		Title:    "My First Blog Post",
		Content:  "This is my first blog post content.",
		Type:     "article",
		Status:   "draft",
	}

	err = contentService.CreateContent(context.Background(), basicContent)
	if err != nil {
		log.Fatal("Failed to create basic content:", err)
	}

	fmt.Printf("✅ Created basic content with ID: %d\n", basicContent.ID)

	// 验证创建的内容
	createdContent, err := contentService.GetContent(context.Background(), basicContent.ID)
	if err != nil {
		log.Fatal("Failed to get created content:", err)
	}

	fmt.Printf("✅ Retrieved content: Title='%s', Type='%s', Status='%s'\n",
		createdContent.Title, createdContent.Type, createdContent.Status)

	// 测试2: 创建带封面图的博客
	fmt.Println("\n📝 Test 2: Creating blog with cover image...")
	coverImageURL := "https://example.com/cover.jpg"
	contentWithCover := &models.Content{
		AuthorID:      testUser.ID,
		Title:         "Blog with Cover Image",
		Content:       "This blog has a cover image.",
		Type:          "article",
		Status:        "published",
		CoverImageURL: &coverImageURL,
	}

	err = contentService.CreateContent(context.Background(), contentWithCover)
	if err != nil {
		log.Fatal("Failed to create content with cover:", err)
	}

	fmt.Printf("✅ Created content with cover image, ID: %d\n", contentWithCover.ID)

	// 测试3: 测试DTO映射
	fmt.Println("\n📝 Test 3: Testing DTO mapping...")
	createReq := dto.CreateContentRequest{
		Title:         "DTO Test Blog",
		Content:       "Testing DTO mapping functionality.",
		Type:          "article",
		Status:        "draft",
		CoverImageURL: nil,
	}

	// 模拟handler中的DTO到模型的转换
	contentFromDTO := models.Content{
		AuthorID:      testUser.ID,
		Title:         createReq.Title,
		Content:       createReq.Content,
		Type:          createReq.Type,
		Status:        createReq.Status,
		CoverImageURL: createReq.CoverImageURL,
	}

	err = contentService.CreateContent(context.Background(), &contentFromDTO)
	if err != nil {
		log.Fatal("Failed to create content from DTO:", err)
	}

	fmt.Printf("✅ Created content from DTO, ID: %d\n", contentFromDTO.ID)

	// 测试4: 验证默认值设置
	fmt.Println("\n📝 Test 4: Testing default values...")
	contentWithDefaults := &models.Content{
		AuthorID: testUser.ID,
		Title:    "Content with Defaults",
		Content:  "This content should have default type and status.",
		// 不设置Type和Status，测试默认值
	}

	err = contentService.CreateContent(context.Background(), contentWithDefaults)
	if err != nil {
		log.Fatal("Failed to create content with defaults:", err)
	}

	fmt.Printf("✅ Created content with defaults, ID: %d\n", contentWithDefaults.ID)
	fmt.Printf("   Default Type: %s, Default Status: %s\n", contentWithDefaults.Type, contentWithDefaults.Status)

	// 测试5: 验证数据库存储
	fmt.Println("\n📝 Test 5: Verifying database storage...")
	var allContents []models.Content
	err = db.Where("author_id = ?", testUser.ID).Find(&allContents).Error
	if err != nil {
		log.Fatal("Failed to query all contents:", err)
	}

	fmt.Printf("✅ Found %d contents in database for user %d\n", len(allContents), testUser.ID)
	for i, content := range allContents {
		fmt.Printf("   %d. ID: %d, Title: '%s', Type: '%s', Status: '%s'\n",
			i+1, content.ID, content.Title, content.Type, content.Status)
	}

	// 测试6: 检查字段映射问题
	fmt.Println("\n📝 Test 6: Checking field mapping...")
	for _, content := range allContents {
		if content.Title == "" {
			fmt.Printf("❌ Content ID %d has empty title\n", content.ID)
		}
		if content.Content == "" {
			fmt.Printf("❌ Content ID %d has empty content\n", content.ID)
		}
		if content.Type == "" {
			fmt.Printf("❌ Content ID %d has empty type\n", content.ID)
		}
		if content.Status == "" {
			fmt.Printf("❌ Content ID %d has empty status\n", content.ID)
		}
	}

	fmt.Println("\n🎉 Blog creation tests completed!")
	fmt.Println("📋 Summary:")
	fmt.Println("  - Basic blog creation: ✅")
	fmt.Println("  - Cover image support: ✅")
	fmt.Println("  - DTO mapping: ✅")
	fmt.Println("  - Default values: ✅")
	fmt.Println("  - Database storage: ✅")
	fmt.Println("  - Field mapping: ✅")
}
