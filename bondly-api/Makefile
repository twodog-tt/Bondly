.PHONY: build run test clean deps lint docker-build docker-run dev-build dev-up dev-down dev-logs restart-api api-status api-logs stop-api start-api

# 构建变量
BINARY_NAME=bondly-api
BUILD_DIR=build
DOCKER_IMAGE=bondly-api

# 构建应用
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./main.go

# 开发环境构建（适用于 Docker）
dev-build:
	@echo "Building for development environment..."
	GOOS=linux GOARCH=amd64 go build -o bondly-api main.go
	@echo "Binary built for Linux container"

# 运行应用
run:
	@echo "Running $(BINARY_NAME)..."
	go run ./main.go

# 安装依赖
deps:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

# 运行测试
test:
	@echo "Running tests..."
	go test -v ./...

# 运行测试并生成覆盖率报告
test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# 代码格式化
fmt:
	@echo "Formatting code..."
	go fmt ./...

# 代码检查
lint:
	@echo "Linting code..."
	golangci-lint run

# 清理构建文件
clean:
	@echo "Cleaning build files..."
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

# Docker 构建
docker-build:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE) .

# Docker 运行
docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

# 开发环境启动
dev-up:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started"

# 开发环境停止
dev-down:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down
	@echo "Development environment stopped"

# 查看开发环境日志
dev-logs:
	@echo "Showing bondly-api logs..."
	docker logs bondly-api

# 重启 bondly-api 服务
restart-api:
	@echo "Restarting bondly-api service..."
	docker-compose -f docker-compose.dev.yml restart bondly-api
	@echo "✅ bondly-api service restarted successfully"

# 查看 bondly-api 服务状态
api-status:
	@echo "Checking bondly-api service status..."
	docker-compose -f docker-compose.dev.yml ps bondly-api

# 查看 bondly-api 实时日志
api-logs:
	@echo "Following bondly-api logs (Press Ctrl+C to exit)..."
	docker-compose -f docker-compose.dev.yml logs -f bondly-api

# 停止 bondly-api 服务
stop-api:
	@echo "Stopping bondly-api service..."
	docker-compose -f docker-compose.dev.yml stop bondly-api
	@echo "✅ bondly-api service stopped"

# 启动 bondly-api 服务
start-api:
	@echo "Starting bondly-api service..."
	docker-compose -f docker-compose.dev.yml start bondly-api
	@echo "✅ bondly-api service started"

# 重新构建并启动开发环境
dev-rebuild:
	@echo "Rebuilding and starting development environment..."
	$(MAKE) dev-build
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment rebuilt and started"

# 开发模式运行
dev:
	@echo "Running in development mode..."
	go run main.go

# 生成 API 文档
docs:
	@echo "Generating API documentation..."
	swag init -g main.go

# 数据库迁移
migrate:
	@echo "Running database migrations..."
	go run ./cmd/migrate/main.go

# 帮助信息
help:
	@echo "Available commands:"
	@echo ""
	@echo "Development Environment (推荐):"
	@echo "  dev-build    - Build binary for Linux container"
	@echo "  dev-up       - Start development environment"
	@echo "  dev-down     - Stop development environment"
	@echo "  dev-logs     - Show bondly-api logs"
	@echo "  dev-rebuild  - Rebuild and start dev environment"
	@echo ""
	@echo "API Service Management:"
	@echo "  restart-api  - Restart bondly-api service only"
	@echo "  start-api    - Start bondly-api service"
	@echo "  stop-api     - Stop bondly-api service"
	@echo "  api-status   - Check bondly-api service status"
	@echo "  api-logs     - Follow bondly-api real-time logs"
	@echo ""
	@echo "Local Development:"
	@echo "  build        - Build the application"
	@echo "  run          - Run the application"
	@echo "  dev          - Run in development mode"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo ""
	@echo "Code Quality:"
	@echo "  fmt          - Format code"
	@echo "  lint         - Lint code"
	@echo "  test         - Run tests"
	@echo "  test-coverage- Run tests with coverage"
	@echo ""
	@echo "Database:"
	@echo "  migrate      - Run database migrations"
	@echo ""
	@echo "Utilities:"
	@echo "  deps         - Install dependencies"
	@echo "  clean        - Clean build files"
	@echo "  docs         - Generate API documentation"
	@echo "  help         - Show this help"
	@echo ""
	@echo "Architecture:"
	@echo "  Handlers → Services → Repositories → Database"
	@echo "  Use 'make dev-rebuild' after code changes" 