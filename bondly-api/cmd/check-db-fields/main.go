package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"fmt"
	"log"
)

func main() {
	fmt.Println("🔍 Checking database fields...")

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

	// 查询contents表的结构
	var columns []struct {
		ColumnName string `db:"column_name"`
		DataType   string `db:"data_type"`
	}

	result := db.Raw(`
		SELECT column_name, data_type 
		FROM information_schema.columns 
		WHERE table_name = 'contents' 
		AND table_schema = 'public'
		ORDER BY ordinal_position
	`).Scan(&columns)

	if result.Error != nil {
		log.Fatal("Failed to query table structure:", result.Error)
	}

	fmt.Println("📋 Contents table structure:")
	for _, col := range columns {
		fmt.Printf("  - %s (%s)\n", col.ColumnName, col.DataType)
	}

	// 检查是否有NFT相关字段
	nftFields := []string{"nft_token_id", "nft_contract_address", "ipfs_hash", "ip_fs_hash", "metadata_hash"}
	fmt.Println("\n🔍 Checking NFT-related fields:")
	for _, field := range nftFields {
		found := false
		for _, col := range columns {
			if col.ColumnName == field {
				fmt.Printf("  ✅ Found: %s (%s)\n", col.ColumnName, col.DataType)
				found = true
				break
			}
		}
		if !found {
			fmt.Printf("  ❌ Missing: %s\n", field)
		}
	}
}
