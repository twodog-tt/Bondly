#!/bin/bash

# Bondly API 启动脚本

set -e

echo "🚀 启动 Bondly API..."

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ Go 未安装，请先安装 Go 1.21+"
    exit 1
fi

# 检查 Go 版本
GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
REQUIRED_VERSION="1.21"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$GO_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Go 版本过低，需要 1.21+，当前版本: $GO_VERSION"
    exit 1
fi

echo "✅ Go 版本检查通过: $GO_VERSION"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件配置数据库和其他设置"
fi

# 安装依赖
echo "📦 安装依赖..."
go mod download
go mod tidy

# 检查数据库连接
echo "🔍 检查数据库连接..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL 客户端已安装"
else
    echo "⚠️  PostgreSQL 客户端未安装，请确保数据库服务正在运行"
fi

# 运行数据库迁移
echo "🗄️  运行数据库迁移..."
go run cmd/migrate/main.go

# 启动应用
echo "🎯 启动应用..."
echo "📍 服务将在 http://localhost:8080 启动"
echo "🔍 健康检查: http://localhost:8080/health"
echo ""
echo "按 Ctrl+C 停止服务"

go run main.go 