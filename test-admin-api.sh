#!/bin/bash

# 管理后台API测试脚本
# 用于验证所有管理后台接口是否正常工作

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3000/api/v1"
ADMIN_EMAIL="admin@91writing.com"
ADMIN_PASSWORD="admin123456"
TOKEN=""

echo "======================================"
echo "   管理后台API接口测试"
echo "======================================"
echo ""

# 1. 登录获取Token
echo "1️⃣  正在登录获取管理员Token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败，无法获取Token${NC}"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 登录成功${NC}"
echo ""

# 测试函数
test_api() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_status=${4:-200}
  
  echo -n "测试: $name ... "
  
  response=$(curl -s -w "\n%{http_code}" -X $method "${API_BASE}${endpoint}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "$expected_status" ]; then
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

# 2. 测试仪表盘统计接口
echo "2️⃣  测试仪表盘统计接口"
test_api "获取仪表盘统计数据" "GET" "/admin/dashboard/stats" && ((passed++)) || ((failed++))
((total++))
test_api "获取图表数据" "GET" "/admin/dashboard/charts" && ((passed++)) || ((failed++))
((total++))
echo ""

# 3. 测试用户管理接口
echo "3️⃣  测试用户管理接口"
test_api "获取用户列表" "GET" "/admin/users?page=1&limit=10" && ((passed++)) || ((failed++))
((total++))

# 动态获取第一个用户的ID
USER_ID=$(curl -s "${API_BASE}/admin/users?page=1&limit=1" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$USER_ID" ]; then
  test_api "获取用户详情" "GET" "/admin/users/${USER_ID}" && ((passed++)) || ((failed++))
  ((total++))
else
  echo -e "${YELLOW}⚠️  跳过用户详情测试（无可用用户）${NC}"
fi
echo ""

# 4. 测试订阅管理接口
echo "4️⃣  测试订阅管理接口"
test_api "获取订阅列表" "GET" "/admin/subscriptions?page=1&limit=10" && ((passed++)) || ((failed++))
((total++))
test_api "获取订阅统计" "GET" "/admin/subscriptions/stats" && ((passed++)) || ((failed++))
((total++))
echo ""

# 5. 测试支付订单管理接口
echo "5️⃣  测试支付订单管理接口"
test_api "获取订单列表" "GET" "/admin/orders?page=1&limit=10" && ((passed++)) || ((failed++))
((total++))
test_api "获取支付统计" "GET" "/admin/orders/stats" && ((passed++)) || ((failed++))
((total++))
echo ""

# 6. 测试套餐管理接口
echo "6️⃣  测试套餐管理接口"
test_api "获取套餐列表" "GET" "/admin/packages" && ((passed++)) || ((failed++))
((total++))
echo ""

# 7. 测试系统配置接口
echo "7️⃣  测试系统配置接口"
test_api "获取系统配置" "GET" "/admin/system/config" && ((passed++)) || ((failed++))
((total++))
test_api "获取系统日志" "GET" "/admin/system/logs?page=1&limit=10" && ((passed++)) || ((failed++))
((total++))
echo ""

# 8. 测试数据分析接口（验证未受影响）
echo "8️⃣  测试数据分析接口（验证未受影响）"
test_api "获取分析概览" "GET" "/admin/analytics/overview" && ((passed++)) || ((failed++))
((total++))
test_api "获取用户增长趋势" "GET" "/admin/analytics/user-growth?days=30" && ((passed++)) || ((failed++))
((total++))
test_api "获取功能使用统计" "GET" "/admin/analytics/feature-usage?limit=10" && ((passed++)) || ((failed++))
((total++))
test_api "获取AI使用统计" "GET" "/admin/analytics/ai-usage" && ((passed++)) || ((failed++))
((total++))
test_api "获取收入统计" "GET" "/admin/analytics/revenue" && ((passed++)) || ((failed++))
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
  echo -e "${GREEN}🎉 所有测试通过！${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  有 $failed 个测试失败${NC}"
  exit 1
fi
