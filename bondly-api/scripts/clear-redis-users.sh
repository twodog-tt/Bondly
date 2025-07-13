#!/bin/bash

# Redis用户信息清除脚本
# 用于清除Bondly项目中的用户相关缓存数据

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
REDIS_HOST=${REDIS_HOST:-"localhost"}
REDIS_PORT=${REDIS_PORT:-"6379"}
REDIS_PASSWORD=${REDIS_PASSWORD:-""}
REDIS_DB=${REDIS_DB:-"0"}
CACHE_PREFIX=${CACHE_PREFIX:-"bondly"}
USE_DOCKER=${USE_DOCKER:-"false"}
REDIS_CONTAINER=${REDIS_CONTAINER:-"bondly-redis"}

# 显示帮助信息
show_help() {
    echo -e "${BLUE}Bondly Redis用户信息清除脚本${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --host HOST        Redis主机地址 (默认: localhost)"
    echo "  -p, --port PORT        Redis端口 (默认: 6379)"
    echo "  -a, --password PASS    Redis密码 (默认: 无)"
    echo "  -d, --db DB            Redis数据库编号 (默认: 0)"
    echo "  -c, --prefix PREFIX    缓存前缀 (默认: bondly)"
    echo "  --docker               通过Docker容器连接Redis"
    echo "  --container NAME       Docker容器名称 (默认: bondly-redis)"
    echo "  --all-users            清除所有用户相关缓存"
    echo "  --sessions             只清除会话缓存"
    echo "  --tokens               只清除令牌缓存"
    echo "  --user-data            只清除用户数据缓存"
    echo "  --dry-run              预览将要删除的键（不实际删除）"
    echo "  --help                 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --all-users                    # 清除所有用户相关缓存"
    echo "  $0 --sessions --dry-run           # 预览会话缓存"
    echo "  $0 --docker --all-users           # 通过Docker清除所有缓存"
    echo "  $0 -h 192.168.1.100 -p 6380       # 连接到指定Redis服务器"
    echo ""
}

# 构建Redis命令
build_redis_cmd() {
    local cmd="redis-cli"
    
    if [ "$USE_DOCKER" = "true" ]; then
        cmd="docker exec $REDIS_CONTAINER redis-cli"
    else
        if [ -n "$REDIS_HOST" ]; then
            cmd="$cmd -h $REDIS_HOST"
        fi
        
        if [ -n "$REDIS_PORT" ]; then
            cmd="$cmd -p $REDIS_PORT"
        fi
        
        if [ -n "$REDIS_PASSWORD" ]; then
            cmd="$cmd -a $REDIS_PASSWORD"
        fi
        
        if [ -n "$REDIS_DB" ]; then
            cmd="$cmd -n $REDIS_DB"
        fi
    fi
    
    echo "$cmd"
}

# 检查Redis连接
check_redis_connection() {
    local redis_cmd=$(build_redis_cmd)
    echo -e "${BLUE}检查Redis连接...${NC}"
    
    if [ "$USE_DOCKER" = "true" ]; then
        echo -e "${BLUE}使用Docker容器: $REDIS_CONTAINER${NC}"
        # 检查Docker容器是否运行
        if ! docker ps | grep -q "$REDIS_CONTAINER"; then
            echo -e "${RED}❌ Redis容器 $REDIS_CONTAINER 未运行${NC}"
            echo "请先启动开发环境: make dev-up"
            exit 1
        fi
    fi
    
    if ! $redis_cmd ping > /dev/null 2>&1; then
        echo -e "${RED}❌ 无法连接到Redis服务器${NC}"
        if [ "$USE_DOCKER" = "true" ]; then
            echo "请检查以下配置:"
            echo "  - 容器名称: $REDIS_CONTAINER"
            echo "  - 容器状态: $(docker ps | grep $REDIS_CONTAINER || echo '未找到')"
        else
            echo "请检查以下配置:"
            echo "  - 主机: $REDIS_HOST"
            echo "  - 端口: $REDIS_PORT"
            echo "  - 密码: ${REDIS_PASSWORD:-"无"}"
            echo "  - 数据库: $REDIS_DB"
        fi
        echo ""
        echo "💡 提示: 如果使用Docker环境，请尝试: $0 --docker --all-users --dry-run"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Redis连接成功${NC}"
}

# 获取键数量
get_key_count() {
    local pattern="$1"
    local redis_cmd=$(build_redis_cmd)
    $redis_cmd --raw keys "$pattern" | wc -l
}

# 显示键信息
show_keys_info() {
    local pattern="$1"
    local description="$2"
    local count=$(get_key_count "$pattern")
    
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}📊 $description: $count 个键${NC}"
        if [ "$DRY_RUN" = "true" ]; then
            echo -e "${BLUE}预览前10个键:${NC}"
            local redis_cmd=$(build_redis_cmd)
            $redis_cmd --raw keys "$pattern" | head -10 | sed 's/^/  /'
            if [ "$count" -gt 10 ]; then
                echo -e "${BLUE}  ... 还有 $((count - 10)) 个键${NC}"
            fi
        fi
    else
        echo -e "${GREEN}✅ $description: 无数据${NC}"
    fi
}

# 删除键
delete_keys() {
    local pattern="$1"
    local description="$2"
    local redis_cmd=$(build_redis_cmd)
    local count=$(get_key_count "$pattern")
    
    if [ "$count" -gt 0 ]; then
        if [ "$DRY_RUN" = "true" ]; then
            echo -e "${YELLOW}🔍 预览删除 $description ($count 个键)${NC}"
        else
            echo -e "${YELLOW}🗑️  删除 $description ($count 个键)...${NC}"
            $redis_cmd --raw keys "$pattern" | xargs -r $redis_cmd del
            echo -e "${GREEN}✅ $description 删除完成${NC}"
        fi
    else
        echo -e "${GREEN}✅ $description: 无数据需要删除${NC}"
    fi
}

# 清除所有用户相关缓存
clear_all_users() {
    echo -e "${BLUE}🧹 清除所有用户相关缓存${NC}"
    echo ""
    
    # 用户数据缓存
    delete_keys "$CACHE_PREFIX:user:*" "用户数据缓存"
    
    # 用户声誉缓存
    delete_keys "$CACHE_PREFIX:user:*:reputation" "用户声誉缓存"
    
    # 用户余额缓存
    delete_keys "$CACHE_PREFIX:user:*:balance" "用户余额缓存"
    
    # 会话缓存
    delete_keys "$CACHE_PREFIX:session:*" "会话缓存"
    
    # 令牌缓存
    delete_keys "$CACHE_PREFIX:token:*" "令牌缓存"
    
    echo ""
    echo -e "${GREEN}🎉 所有用户相关缓存清除完成！${NC}"
}

# 清除会话缓存
clear_sessions() {
    echo -e "${BLUE}🧹 清除会话缓存${NC}"
    delete_keys "$CACHE_PREFIX:session:*" "会话缓存"
}

# 清除令牌缓存
clear_tokens() {
    echo -e "${BLUE}🧹 清除令牌缓存${NC}"
    delete_keys "$CACHE_PREFIX:token:*" "令牌缓存"
}

# 清除用户数据缓存
clear_user_data() {
    echo -e "${BLUE}🧹 清除用户数据缓存${NC}"
    delete_keys "$CACHE_PREFIX:user:*" "用户数据缓存"
    delete_keys "$CACHE_PREFIX:user:*:reputation" "用户声誉缓存"
    delete_keys "$CACHE_PREFIX:user:*:balance" "用户余额缓存"
}

# 显示当前缓存状态
show_cache_status() {
    echo -e "${BLUE}📊 当前缓存状态${NC}"
    echo ""
    
    show_keys_info "$CACHE_PREFIX:user:*" "用户数据缓存"
    show_keys_info "$CACHE_PREFIX:user:*:reputation" "用户声誉缓存"
    show_keys_info "$CACHE_PREFIX:user:*:balance" "用户余额缓存"
    show_keys_info "$CACHE_PREFIX:session:*" "会话缓存"
    show_keys_info "$CACHE_PREFIX:token:*" "令牌缓存"
    
    echo ""
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--host)
                REDIS_HOST="$2"
                shift 2
                ;;
            -p|--port)
                REDIS_PORT="$2"
                shift 2
                ;;
            -a|--password)
                REDIS_PASSWORD="$2"
                shift 2
                ;;
            -d|--db)
                REDIS_DB="$2"
                shift 2
                ;;
            -c|--prefix)
                CACHE_PREFIX="$2"
                shift 2
                ;;
            --docker)
                USE_DOCKER=true
                shift
                ;;
            --container)
                REDIS_CONTAINER="$2"
                shift 2
                ;;
            --all-users)
                CLEAR_ALL=true
                shift
                ;;
            --sessions)
                CLEAR_SESSIONS=true
                shift
                ;;
            --tokens)
                CLEAR_TOKENS=true
                shift
                ;;
            --user-data)
                CLEAR_USER_DATA=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查Redis连接
    check_redis_connection
    
    # 显示当前状态
    show_cache_status
    
    # 如果没有指定操作，显示帮助
    if [ -z "$CLEAR_ALL" ] && [ -z "$CLEAR_SESSIONS" ] && [ -z "$CLEAR_TOKENS" ] && [ -z "$CLEAR_USER_DATA" ]; then
        echo -e "${YELLOW}⚠️  未指定清除操作${NC}"
        echo "使用 --help 查看可用选项"
        exit 1
    fi
    
    # 执行清除操作
    if [ "$CLEAR_ALL" = "true" ]; then
        clear_all_users
    fi
    
    if [ "$CLEAR_SESSIONS" = "true" ]; then
        clear_sessions
    fi
    
    if [ "$CLEAR_TOKENS" = "true" ]; then
        clear_tokens
    fi
    
    if [ "$CLEAR_USER_DATA" = "true" ]; then
        clear_user_data
    fi
    
    # 显示清除后的状态
    if [ "$DRY_RUN" != "true" ]; then
        echo ""
        echo -e "${BLUE}📊 清除后的缓存状态${NC}"
        show_cache_status
    fi
}

# 运行主函数
main "$@" 