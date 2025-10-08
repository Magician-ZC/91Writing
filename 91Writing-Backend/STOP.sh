#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "    停止所有91Writing后端服务"
echo "======================================"
echo ""

# 查找所有Node.js进程
echo -e "${YELLOW}正在查找91Writing相关进程...${NC}"
echo ""

# 停止所有相关服务
pkill -f "nest start" 2>/dev/null
pkill -f "node dist/apps" 2>/dev/null
pkill -f "concurrently" 2>/dev/null

# 等待进程完全停止
sleep 2

# 检查端口占用
echo -e "${YELLOW}检查端口占用情况...${NC}"
echo ""

for port in 3000 3001 3002 3003 3004 3005 3006; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}端口 $port 仍被占用 (PID: $pid)，正在强制关闭...${NC}"
        kill -9 $pid 2>/dev/null
    else
        echo -e "${GREEN}端口 $port 已释放${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ 所有服务已停止！${NC}"
echo ""
