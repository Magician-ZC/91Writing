#!/bin/bash

# 用户端接口测试脚本

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:3000/api/v1"
ADMIN_EMAIL="admin@91writing.com"
ADMIN_PASSWORD="admin123456"

echo "======================================"
echo "   用户端接口测试"
echo "======================================"
echo ""

# 1. 登录获取Token
echo "1️⃣  登录获取Token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败${NC}"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 登录成功${NC}"
echo ""

# 测试函数
test_api() {
  local name=$1
  local endpoint=$2
  
  echo -n "测试: $name ... "
  
  response=$(curl -s -w "\n%{http_code}" "${API_BASE}${endpoint}" \
    -H "Authorization: Bearer ${TOKEN}")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ 通过 (HTTP $http_code)${NC}"
    return 0
  else
    echo -e "${RED}❌ 失败 (HTTP $http_code)${NC}"
    echo "响应: $body"
    return 1
  fi
}

# 计数器
total=0
passed=0
failed=0

# 2. 测试订阅接口
echo "2️⃣  测试订阅接口"
test_api "获取当前订阅" "/subscriptions/current" && ((passed++)) || ((failed++))
((total++))
test_api "检查订阅状态" "/subscriptions/status" && ((passed++)) || ((failed++))
((total++))
echo ""

# 3. 测试支付订单接口
echo "3️⃣  测试支付订单接口"
test_api "获取支付订单列表" "/payments/orders" && ((passed++)) || ((failed++))
((total++))
echo ""

# 4. 测试套餐接口
echo "4️⃣  测试套餐接口"
test_api "获取可用套餐列表" "/packages/active" && ((passed++)) || ((failed++))
((total++))
echo ""

# 测试结果总结
echo "======================================"
echo "         测试结果总结"
echo "======================================"
echo -e "总测试数: $total"
echo -e "${GREEN}通过: $passed${NC}"
echo -e "${RED}失败: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}🎉 所有测试通过！用户端接口已修复成功！${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  有 $failed 个测试失败，请检查API Gateway是否已重启${NC}"
  exit 1
fi
