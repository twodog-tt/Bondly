#!/bin/bash

# Bondly 声誉系统 API 测试脚本

echo "🧪 开始测试 Bondly 声誉系统 API..."

# API 基础URL
BASE_URL="http://localhost:8080/api/v1"

# 测试函数
test_api() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "📋 测试: $description"
    echo "🔗 $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$url")
    elif [ "$method" = "POST" ]; then
        if [ -z "$data" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST "$BASE_URL$url")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$url")
        fi
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ 成功: HTTP $http_code"
        echo "📄 响应内容:"
        cat /tmp/response.json | jq '.' 2>/dev/null || cat /tmp/response.json
    else
        echo "❌ 失败: HTTP $http_code"
        echo "📄 错误内容:"
        cat /tmp/response.json | jq '.' 2>/dev/null || cat /tmp/response.json
    fi
}

echo ""
echo "🔍 1. 测试获取用户声誉分数（用户ID: 1）"
test_api "GET" "/reputation/user/1" "" "获取用户声誉分数"

echo ""
echo "🔍 2. 测试获取声誉排行榜（前10名）"
test_api "GET" "/reputation/ranking?limit=10" "" "获取声誉排行榜"

echo ""
echo "🔍 3. 测试检查治理资格（用户ID: 1）"
test_api "GET" "/reputation/governance/eligible/1" "" "检查治理资格"

echo ""
echo "🔍 4. 测试根据钱包地址获取声誉（示例地址）"
test_api "GET" "/reputation/address/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" "" "根据钱包地址获取声誉"

echo ""
echo "🔍 5. 测试同步链上声誉（用户ID: 1）"
test_api "POST" "/reputation/sync/1" "" "从链上同步声誉分数"

echo ""
echo "🔍 6. 测试增加声誉分数（需要认证，预期会失败）"
add_reputation_data='{
    "user_id": 1,
    "amount": 50,
    "reason": "API测试"
}'
test_api "POST" "/reputation/add" "$add_reputation_data" "增加声誉分数（无认证）"

echo ""
echo "🔍 7. 测试减少声誉分数（需要认证，预期会失败）"
subtract_reputation_data='{
    "user_id": 1,
    "amount": 25,
    "reason": "API测试"
}'
test_api "POST" "/reputation/subtract" "$subtract_reputation_data" "减少声誉分数（无认证）"

echo ""
echo "🏁 声誉系统 API 测试完成！"
echo "💡 注意: 增加/减少声誉的API需要认证令牌，未认证的请求会返回401错误。"
echo "🔗 API文档: http://localhost:8080/swagger/index.html"

# 清理临时文件
rm -f /tmp/response.json 