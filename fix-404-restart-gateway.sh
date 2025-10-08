#!/bin/bash

# 一键修复用户端404错误 - 重启API Gateway

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}======================================"
echo "   修复用户端404错误"
echo "   重启API Gateway"
echo "======================================${NC}"
echo ""

# 进入后端目录
cd 91Writing-Backend

# 1. 编译API Gateway
echo -e "${YELLOW}[1/4] 编译API Gateway...${NC}"
npx nest build api-gateway
echo -e "${GREEN}✅ 编译完成${NC}"
echo ""

# 2. 停止旧进程
echo -e "${YELLOW}[2/4] 停止旧的API Gateway进程...${NC}"
OLD_PID=$(ps aux | grep "dist/apps/api-gateway/main" | grep -v grep | awk '{print $2}')
if [ -n "$OLD_PID" ]; then
  kill $OLD_PID
  echo -e "${GREEN}✅ 已停止进程 $OLD_PID${NC}"
else
  echo -e "${YELLOW}⚠️  未找到运行中的API Gateway${NC}"
fi
echo ""

# 3. 等待端口释放
echo -e "${YELLOW}[3/4] 等待端口3000释放...${NC}"
sleep 2
echo -e "${GREEN}✅ 端口已释放${NC}"
echo ""

# 4. 启动新进程
echo -e "${YELLOW}[4/4] 启动API Gateway...${NC}"
npm run start:gateway > /dev/null 2>&1 &
NEW_PID=$!
echo -e "${GREEN}✅ API Gateway已启动 (PID: $NEW_PID)${NC}"
echo ""

# 5. 等待服务启动
echo -e "${CYAN}等待服务启动...${NC}"
sleep 5

# 6. 测试服务
echo -e "${YELLOW}测试服务状态...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:3000/api/v1/health 2>/dev/null)
if [ -n "$HEALTH_CHECK" ]; then
  echo -e "${GREEN}✅ API Gateway启动成功！${NC}"
  echo ""
  echo -e "${CYAN}======================================"
  echo "   修复完成！"
  echo "======================================${NC}"
  echo ""
  echo -e "${GREEN}✅ 用户端接口已修复${NC}"
  echo -e "${CYAN}现在可以刷新浏览器页面测试${NC}"
  echo ""
  echo -e "测试URL:"
  echo -e "  - 个人资料: ${YELLOW}http://localhost:7520/profile${NC}"
  echo ""
  echo -e "运行自动化测试:"
  echo -e "  ${YELLOW}cd .. && ./test-user-api.sh${NC}"
  echo ""
else
  echo -e "${RED}❌ API Gateway可能启动失败${NC}"
  echo -e "${YELLOW}请检查日志或手动启动${NC}"
  exit 1
fi
