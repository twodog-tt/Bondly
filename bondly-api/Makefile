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

# 查看本地日志文件（宿主机）
logs-info:
	@echo "Following info logs (Press Ctrl+C to exit)..."
	tail -f logs/info.log

# 查看本地错误日志文件（宿主机）
logs-error:
	@echo "Following error logs (Press Ctrl+C to exit)..."
	tail -f logs/error.log

# 监控API服务日志（智能选择）
logs-tail:
	@echo "Monitoring API service logs (Press Ctrl+C to exit)..."
	@if docker-compose -f docker-compose.dev.yml ps bondly-api | grep -q "Up"; then \
		echo "📦 API service running in Docker - using container logs..."; \
		docker-compose -f docker-compose.dev.yml logs -f bondly-api; \
	elif [ -f "logs/info.log" ]; then \
		echo "📄 Using local log file: logs/info.log"; \
		tail -f logs/info.log; \
	elif [ -f "logs/app.log" ]; then \
		echo "📄 Using local log file: logs/app.log"; \
		tail -f logs/app.log; \
	elif [ -f "app.log" ]; then \
		echo "📄 Using local log file: app.log"; \
		tail -f app.log; \
	else \
		echo "❌ No log source found. Available options:"; \
		echo "   - Start Docker service: make dev-up"; \
		echo "   - Use 'make api-logs' for Docker container logs"; \
		echo "   - Use 'make logs-info' for local file logs"; \
		exit 1; \
	fi

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
	swag init -g main.go --parseDependency --parseInternal

# 数据库迁移
migrate:
	@echo "Running database migrations..."
	go run ./cmd/migrate/main.go

# 数据填充
seed:
	@echo "Seeding database with sample data..."
	go run ./cmd/seed-data/main.go

# Redis用户信息清除
redis-clear-users:
	@echo "清除Redis中的用户信息..."
	@./scripts/clear-redis-users.sh --docker --all-users

# Redis用户信息清除（预览模式）
redis-clear-users-dry-run:
	@echo "预览Redis中的用户信息（不实际删除）..."
	@./scripts/clear-redis-users.sh --docker --all-users --dry-run

# 清除Redis会话缓存
redis-clear-sessions:
	@echo "清除Redis中的会话缓存..."
	@./scripts/clear-redis-users.sh --docker --sessions

# 清除Redis令牌缓存
redis-clear-tokens:
	@echo "清除Redis中的令牌缓存..."
	@./scripts/clear-redis-users.sh --docker --tokens

# 清除Redis用户数据缓存
redis-clear-user-data:
	@echo "清除Redis中的用户数据缓存..."
	@./scripts/clear-redis-users.sh --docker --user-data

# 显示Redis缓存状态
redis-status:
	@echo "显示Redis缓存状态..."
	@./scripts/clear-redis-users.sh --docker --dry-run --all-users

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
	@echo "  api-logs     - Follow bondly-api real-time logs (Docker容器)"
	@echo "  logs-info    - Follow local info logs (本地文件)"
	@echo "  logs-error   - Follow local error logs (本地文件)"
	@echo "  logs-tail    - Smart log monitoring (自动选择Docker或本地)"
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
	@echo "  seed         - Seed database with sample data"
	@echo ""
	@echo "Redis Management:"
	@echo "  redis-clear-users        - 清除所有用户相关缓存"
	@echo "  redis-clear-users-dry-run- 预览用户缓存（不删除）"
	@echo "  redis-clear-sessions     - 清除会话缓存"
	@echo "  redis-clear-tokens       - 清除令牌缓存"
	@echo "  redis-clear-user-data    - 清除用户数据缓存"
	@echo "  redis-status             - 显示Redis缓存状态"
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