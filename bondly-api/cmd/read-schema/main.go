package main

import (
	"bondly-api/config"
	"bondly-api/internal/database"
	"fmt"
	"log"
	"strings"

	"gorm.io/gorm"
)

// TableInfo 表信息结构
type TableInfo struct {
	TableName   string
	Columns     []ColumnInfo
	Indexes     []IndexInfo
	Constraints []ConstraintInfo
}

// ColumnInfo 列信息结构
type ColumnInfo struct {
	ColumnName    string
	DataType      string
	IsNullable    string
	ColumnDefault *string
	Comment       *string
}

// IndexInfo 索引信息结构
type IndexInfo struct {
	IndexName string
	Columns   string
	IsUnique  bool
}

// ConstraintInfo 约束信息结构
type ConstraintInfo struct {
	ConstraintName string
	ConstraintType string
	Definition     string
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

	// 获取所有表名
	tables, err := getAllTables(db)
	if err != nil {
		log.Fatalf("Failed to get tables: %v", err)
	}

	fmt.Println("=== 数据库表结构分析 ===")
	fmt.Printf("数据库: %s\n", cfg.Database.Name)
	fmt.Printf("总表数: %d\n\n", len(tables))

	// 遍历每个表，获取详细信息
	for _, tableName := range tables {
		tableInfo, err := getTableInfo(db, tableName)
		if err != nil {
			log.Printf("Failed to get info for table %s: %v", tableName, err)
			continue
		}

		printTableInfo(tableInfo)
		fmt.Println()
	}
}

// getAllTables 获取所有表名
func getAllTables(db *gorm.DB) ([]string, error) {
	var tables []string
	query := `
		SELECT table_name 
		FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_type = 'BASE TABLE'
		ORDER BY table_name
	`

	rows, err := db.Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}

	return tables, nil
}

// getTableInfo 获取表的详细信息
func getTableInfo(db *gorm.DB, tableName string) (*TableInfo, error) {
	tableInfo := &TableInfo{
		TableName: tableName,
	}

	// 获取列信息
	columns, err := getColumns(db, tableName)
	if err != nil {
		return nil, err
	}
	tableInfo.Columns = columns

	// 获取索引信息
	indexes, err := getIndexes(db, tableName)
	if err != nil {
		return nil, err
	}
	tableInfo.Indexes = indexes

	// 获取约束信息
	constraints, err := getConstraints(db, tableName)
	if err != nil {
		return nil, err
	}
	tableInfo.Constraints = constraints

	return tableInfo, nil
}

// getColumns 获取表的列信息
func getColumns(db *gorm.DB, tableName string) ([]ColumnInfo, error) {
	var columns []ColumnInfo
	query := `
		SELECT 
			c.column_name,
			c.data_type,
			c.is_nullable,
			c.column_default,
			COALESCE(pgd.description, '') as comment
		FROM information_schema.columns c
		LEFT JOIN pg_catalog.pg_statio_all_tables st ON c.table_name = st.relname
		LEFT JOIN pg_catalog.pg_description pgd ON (
			pgd.objoid = st.relid AND 
			pgd.objsubid = c.ordinal_position
		)
		WHERE c.table_schema = 'public' 
		AND c.table_name = ?
		ORDER BY c.ordinal_position
	`

	rows, err := db.Raw(query, tableName).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var col ColumnInfo
		var comment string
		if err := rows.Scan(&col.ColumnName, &col.DataType, &col.IsNullable, &col.ColumnDefault, &comment); err != nil {
			return nil, err
		}
		if comment != "" {
			col.Comment = &comment
		}
		columns = append(columns, col)
	}

	return columns, nil
}

// getIndexes 获取表的索引信息
func getIndexes(db *gorm.DB, tableName string) ([]IndexInfo, error) {
	var indexes []IndexInfo
	query := `
		SELECT 
			i.relname as index_name,
			array_to_string(array_agg(a.attname), ', ') as columns,
			ix.indisunique as is_unique
		FROM pg_class t
		JOIN pg_index ix ON t.oid = ix.indrelid
		JOIN pg_class i ON ix.indexrelid = i.oid
		JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
		WHERE t.relname = ?
		AND t.relkind = 'r'
		GROUP BY i.relname, ix.indisunique
		ORDER BY i.relname
	`

	rows, err := db.Raw(query, tableName).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var idx IndexInfo
		if err := rows.Scan(&idx.IndexName, &idx.Columns, &idx.IsUnique); err != nil {
			return nil, err
		}
		indexes = append(indexes, idx)
	}

	return indexes, nil
}

// getConstraints 获取表的约束信息
func getConstraints(db *gorm.DB, tableName string) ([]ConstraintInfo, error) {
	var constraints []ConstraintInfo
	query := `
		SELECT 
			conname as constraint_name,
			contype as constraint_type,
			pg_get_constraintdef(oid) as definition
		FROM pg_constraint
		WHERE conrelid = (
			SELECT oid FROM pg_class WHERE relname = ? AND relnamespace = (
				SELECT oid FROM pg_namespace WHERE nspname = 'public'
			)
		)
		ORDER BY conname
	`

	rows, err := db.Raw(query, tableName).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var constraint ConstraintInfo
		if err := rows.Scan(&constraint.ConstraintName, &constraint.ConstraintType, &constraint.Definition); err != nil {
			return nil, err
		}
		constraints = append(constraints, constraint)
	}

	return constraints, nil
}

// printTableInfo 打印表信息
func printTableInfo(tableInfo *TableInfo) {
	fmt.Printf("📋 表名: %s\n", tableInfo.TableName)
	fmt.Println(strings.Repeat("-", 50))

	// 打印列信息
	fmt.Println("📊 列信息:")
	for _, col := range tableInfo.Columns {
		nullable := "NOT NULL"
		if col.IsNullable == "YES" {
			nullable = "NULL"
		}

		defaultVal := ""
		if col.ColumnDefault != nil {
			defaultVal = fmt.Sprintf(" DEFAULT %s", *col.ColumnDefault)
		}

		comment := ""
		if col.Comment != nil && *col.Comment != "" {
			comment = fmt.Sprintf(" -- %s", *col.Comment)
		}

		fmt.Printf("  %-20s %-15s %-8s%s%s\n",
			col.ColumnName,
			col.DataType,
			nullable,
			defaultVal,
			comment)
	}

	// 打印索引信息
	if len(tableInfo.Indexes) > 0 {
		fmt.Println("\n🔍 索引信息:")
		for _, idx := range tableInfo.Indexes {
			unique := ""
			if idx.IsUnique {
				unique = " (UNIQUE)"
			}
			fmt.Printf("  %-30s %s%s\n", idx.IndexName, idx.Columns, unique)
		}
	}

	// 打印约束信息
	if len(tableInfo.Constraints) > 0 {
		fmt.Println("\n🔒 约束信息:")
		for _, constraint := range tableInfo.Constraints {
			fmt.Printf("  %-20s %-10s %s\n",
				constraint.ConstraintName,
				constraint.ConstraintType,
				constraint.Definition)
		}
	}
}
