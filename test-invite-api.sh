#!/bin/bash

# 邀请接口测试脚本

API_BASE="http://localhost:3000/api/v1"

echo "=========================================="
echo "邀请接口路径修复验证测试"
echo "=========================================="
echo ""

# 1. 登录获取token
echo "1. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@91writing.com",
    "password": "admin123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo ""

# 2. 测试获取邀请码
echo "2. 测试获取邀请码 (GET /api/v1/auth/invite/my-code)..."
INVITE_CODE_RESPONSE=$(curl -s "${API_BASE}/auth/invite/my-code" \
  -H "Authorization: Bearer ${TOKEN}")

echo "响应: $INVITE_CODE_RESPONSE"
echo ""

# 3. 测试获取邀请统计
echo "3. 测试获取邀请统计 (GET /api/v1/auth/invite/stats)..."
INVITE_STATS_RESPONSE=$(curl -s "${API_BASE}/auth/invite/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "响应: $INVITE_STATS_RESPONSE"
echo ""

# 4. 测试获取邀请用户列表
echo "4. 测试获取邀请用户列表 (GET /api/v1/auth/invite/invitees)..."
INVITEES_RESPONSE=$(curl -s "${API_BASE}/auth/invite/invitees" \
  -H "Authorization: Bearer ${TOKEN}")

echo "响应: $INVITEES_RESPONSE"
echo ""

# 5. 测试获取邀请奖励
echo "5. 测试获取邀请奖励 (GET /api/v1/auth/invite/rewards)..."
REWARDS_RESPONSE=$(curl -s "${API_BASE}/auth/invite/rewards" \
  -H "Authorization: Bearer ${TOKEN}")

echo "响应: $REWARDS_RESPONSE"
echo ""

# 检查结果
echo "=========================================="
echo "测试完成"
echo "=========================================="

# 检查是否有404错误
if echo "$INVITE_CODE_RESPONSE" | grep -q "404"; then
  echo "❌ 获取邀请码失败 - 404错误"
else
  echo "✅ 获取邀请码接口正常"
fi

if echo "$INVITE_STATS_RESPONSE" | grep -q "404"; then
  echo "❌ 获取邀请统计失败 - 404错误"
else
  echo "✅ 获取邀请统计接口正常"
fi

if echo "$INVITEES_RESPONSE" | grep -q "404"; then
  echo "❌ 获取邀请用户列表失败 - 404错误"
else
  echo "✅ 获取邀请用户列表接口正常"
fi

if echo "$REWARDS_RESPONSE" | grep -q "404"; then
  echo "❌ 获取邀请奖励失败 - 404错误"
else
  echo "✅ 获取邀请奖励接口正常"
fi
