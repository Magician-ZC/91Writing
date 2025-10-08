#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "  91Writing 服务重启脚本"
echo "======================================"
echo ""

# 1. 强制停止所有服务
echo -e "${YELLOW}[1/4] 停止所有服务...${NC}"
pkill -f "node.*apps" 2>/dev/null || true
sleep 2

# 2. 清理所有端口
echo -e "${YELLOW}[2/4] 清理端口占用...${NC}"
for port in 3000 3001 3002 3003 3004 3005 3006; do
    if lsof -ti :$port > /dev/null 2>&1; then
        echo "  清理端口 $port..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
    fi
done
sleep 1

# 3. 验证端口已释放
echo -e "${YELLOW}[3/4] 验证端口状态...${NC}"
ALL_FREE=true
for port in 3000 3001 3002 3003 3004 3005 3006; do
    if lsof -ti :$port > /dev/null 2>&1; then
        echo -e "  ${RED}❌ 端口 $port 仍被占用${NC}"
        ALL_FREE=false
    else
        echo -e "  ${GREEN}✅ 端口 $port 已释放${NC}"
    fi
done

if [ "$ALL_FREE" = false ]; then
    echo -e "${RED}端口清理失败，请手动检查！${NC}"
    exit 1
fi

# 4. 启动所有服务
echo ""
echo -e "${YELLOW}[4/4] 启动所有服务...${NC}"
echo ""

# 使用concurrently启动（已经在后台）
npx concurrently --kill-others-on-fail \
    "npm run start:gateway" \
    "npm run start:auth" \
    "npm run start:user" \
    "npm run start:novel" \
    "npm run start:ai" \
    "npm run start:payment" \
    "npm run start:admin" \
    > /tmp/91writing-services.log 2>&1 &

CONCURRENTLY_PID=$!
echo "服务启动中... (PID: $CONCURRENTLY_PID)"
echo ""

# 等待服务启动
echo "等待服务启动 (15秒)..."
for i in {1..15}; do
    echo -n "."
    sleep 1
done
echo ""
echo ""

# 验证服务
echo -e "${GREEN}[验证] 检查服务状态...${NC}"
echo ""

ALL_RUNNING=true
declare -A SERVICE_NAMES=(
    [3000]="API Gateway"
    [3001]="User Service"
    [3002]="Auth Service"
    [3003]="Novel Service"
    [3004]="AI Service"
    [3005]="Payment Service"
    [3006]="Admin Service"
)

for port in 3000 3001 3002 3003 3004 3005 3006; do
    if lsof -ti :$port > /dev/null 2>&1; then
        pid=$(lsof -ti :$port)
        echo -e "  ${GREEN}✅ ${SERVICE_NAMES[$port]} - http://localhost:$port (PID: $pid)${NC}"
    else
        echo -e "  ${RED}❌ ${SERVICE_NAMES[$port]} - 未运行${NC}"
        ALL_RUNNING=false
    fi
done

echo ""
echo "======================================"

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 所有服务启动成功！${NC}"
    echo ""
    echo "📖 API文档: http://localhost:3000/api/docs"
    echo "📊 服务日志: tail -f /tmp/91writing-services.log"
    echo "🛑 停止服务: ./STOP.sh"
    echo ""
else
    echo -e "${RED}⚠️  部分服务启动失败！${NC}"
    echo ""
    echo "查看日志: tail -f /tmp/91writing-services.log"
    echo ""
    exit 1
fi
