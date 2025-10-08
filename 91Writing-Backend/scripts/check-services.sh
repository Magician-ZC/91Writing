#!/bin/bash

# 91Writing 微服务状态检查脚本
# 用途：快速检查所有微服务是否正常运行

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================"
echo "   91Writing 微服务状态检查"
echo "======================================"
echo ""

# 检查函数
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - http://localhost:$port - ${GREEN}运行中${NC}"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - http://localhost:$port - ${RED}未运行${NC}"
        return 1
    fi
}

# 检查所有服务
failed=0

check_service "API Gateway    " "http://localhost:3000/api/v1/health" "3000" || ((failed++))
check_service "User Service   " "http://localhost:3001/api/v1/users/health" "3001" || ((failed++))
check_service "Auth Service   " "http://localhost:3002/api/v1/auth/health" "3002" || ((failed++))
check_service "Novel Service  " "http://localhost:3003/health" "3003" || ((failed++))
check_service "AI Service     " "http://localhost:3004/health" "3004" || ((failed++))
check_service "Payment Service" "http://localhost:3005/health" "3005" || ((failed++))
check_service "Admin Service  " "http://localhost:3006/health" "3006" || ((failed++))

echo ""
echo "======================================"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 所有服务运行正常！${NC}"
    echo ""
    echo -e "${BLUE}📖 API文档: http://localhost:3000/api/docs${NC}"
    echo -e "${BLUE}📊 数据库管理: npm run db:studio${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $failed 个服务未运行${NC}"
    echo ""
    echo -e "${YELLOW}启动所有服务:${NC}"
    echo "  ./START.sh"
    echo "  或"
    echo "  npm run start:all"
    echo ""
    echo -e "${YELLOW}查看端口配置:${NC}"
    echo "  cat MICROSERVICES-CONFIG.md"
    exit 1
fi
