#!/bin/bash

# 视频生成API测试脚本
# 用于测试所有视频生成相关的API端点

set -e

# 配置
BASE_URL="http://localhost:3000"
TOKEN=""
NOVEL_ID=""
CHAPTER_ID=""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   章节视频生成系统 API 测试脚本${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 读取配置
read -p "请输入API Base URL [默认: http://localhost:3000]: " input_url
BASE_URL="${input_url:-$BASE_URL}"

read -p "请输入认证Token: " TOKEN

read -p "请输入测试小说ID: " NOVEL_ID

read -p "请输入测试章节ID: " CHAPTER_ID

# 测试函数
test_api() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -e "\n${YELLOW}━━━ 测试: $name ━━━${NC}"
  echo "方法: $method"
  echo "端点: $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    echo "数据: $data"
    response=$(curl -s -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  echo "响应:"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"

  if echo "$response" | jq -e '.success == true or .id != null' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 测试通过${NC}"
    return 0
  else
    echo -e "${RED}❌ 测试失败${NC}"
    return 1
  fi
}

echo -e "\n${BLUE}开始执行API测试...${NC}\n"

# 1. 测试健康检查
test_api "健康检查" "GET" "/api/health" ""

# 2. 测试一致性配置API
echo -e "\n${BLUE}【一致性配置API测试】${NC}"

# 2.1 创建一致性配置
consistency_data='{
  "novelId": "'$NOVEL_ID'",
  "characters": [
    {
      "name": "主角",
      "baseAppearance": "黑发蓝眼的年轻剑士",
      "keywords": ["black hair", "blue eyes", "swordsman"],
      "dynamicState": {},
      "importance": 100
    }
  ],
  "visualStyle": {
    "overall": "realistic",
    "colorTone": "natural",
    "artStyle": "cinematic",
    "lighting": "natural"
  }
}'

test_api "创建一致性配置" "POST" "/api/novel/consistency" "$consistency_data"

# 2.2 获取一致性配置
test_api "获取一致性配置" "GET" "/api/novel/consistency/$NOVEL_ID" ""

# 2.3 自动提取配置
extract_data='{
  "novelId": "'$NOVEL_ID'",
  "startChapter": 1,
  "endChapter": 3,
  "overwrite": false
}'

test_api "自动提取一致性配置" "POST" "/api/novel/consistency/auto-extract" "$extract_data"

# 3. 测试视频生成API
echo -e "\n${BLUE}【视频生成API测试】${NC}"

# 3.1 生成视频
video_gen_data='{
  "chapterId": "'$CHAPTER_ID'",
  "sceneCount": 3,
  "videoDuration": 10,
  "visualStyle": "realistic",
  "forceRegenerate": false
}'

test_api "生成章节视频" "POST" "/api/ai/video-generation/generate" "$video_gen_data"

# 3.2 查询生成状态
test_api "查询视频状态" "GET" "/api/ai/video-generation/status/$CHAPTER_ID" ""

# 3.3 查询章节视频状态（通过novel service）
test_api "查询章节视频状态" "GET" "/api/novel/novels/$NOVEL_ID/chapters/$CHAPTER_ID/video-status" ""

# 4. 测试Agent配置API (需要管理员权限)
echo -e "\n${BLUE}【Agent配置API测试（管理员）】${NC}"

# 4.1 获取Agent配置列表
test_api "获取Agent配置列表" "GET" "/api/admin/agent-prompts" ""

# 4.2 获取激活的配置
test_api "获取激活的分镜Agent配置" "GET" "/api/admin/agent-prompts/active/SCRIPT_GENERATOR" ""

# 测试总结
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ API测试完成！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📝 注意事项：${NC}"
echo "1. 视频生成是异步过程，需要轮询状态查看进度"
echo "2. 首次生成建议先配置一致性配置"
echo "3. 管理员API需要ADMIN角色权限"
echo "4. 视频生成需要配置外部API密钥"

echo -e "\n${YELLOW}🔍 下一步操作：${NC}"
echo "1. 持续轮询视频生成状态"
echo "   curl $BASE_URL/api/ai/video-generation/status/$CHAPTER_ID"
echo ""
echo "2. 查看生成日志"
echo "   检查数据库 video_generation_logs 表"
echo ""
echo "3. 优化Agent配置"
echo "   访问管理后台 /admin/agent-config"

