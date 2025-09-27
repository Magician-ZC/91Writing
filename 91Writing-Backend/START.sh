#!/bin/bash

# 设置脚本在遇到错误时退出
set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "======================================"
echo "      91Writing 后端一键启动"
echo "======================================"
echo ""
echo "🔧 无Docker版本 - Mac专用启动脚本"
echo ""

echo "[1/5] 检查环境依赖..."

# 检查Docker是否存在
if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    echo -e "${CYAN}🐳 检测到Docker，是否使用Docker启动数据库服务？(y/n):${NC}"
    read -n 1 use_docker
    echo ""
    if [[ $use_docker == "y" || $use_docker == "Y" ]]; then
        echo "启动Docker数据库服务..."
        docker-compose up -d mysql redis
        echo -e "${GREEN}✅ Docker数据库服务已启动${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  未检测到Docker，将使用本地数据库连接${NC}"
    echo ""
    echo -e "${CYAN}使用本地数据库，请确保以下服务正在运行：${NC}"
    echo "📊 MySQL (端口: 3306) - 数据库: writing_platform"  
    echo "🗄️  Redis (端口: 6379)"
    echo ""
    echo -e "${YELLOW}如需配置数据库，可运行: ./setup-database-mac.sh${NC}"
    echo ""
    echo -e "${CYAN}继续启动服务...${NC}"
    sleep 2
fi

echo ""
echo "[2/5] 设置环境变量..."
export DATABASE_URL="mysql://writing:writing123@localhost:3306/writing_platform"
export JWT_SECRET="91writing_jwt_secret_dev_2024"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export REDIS_PASSWORD="redis123"
export NODE_ENV="development"
echo -e "${GREEN}✅ 环境变量已设置${NC}"

echo ""
echo "[3/5] 检查数据库连接..."
if ! npm run db:push; then
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo ""
    echo -e "${YELLOW}可能的解决方案：${NC}"
    echo "1. 如果使用Docker: docker-compose up -d mysql redis"
    echo "2. 如果使用本地数据库，请确保："
    echo "   - MySQL服务正在运行 (brew services start mysql)"
    echo "   - Redis服务正在运行 (brew services start redis)"
    echo "   - 数据库和用户已创建"
    echo ""
    echo "按任意键继续..."
    read -n 1 -s
    exit 1
fi
echo -e "${GREEN}✅ 数据库连接成功！${NC}"

echo ""
echo "[4/5] 构建所有微服务..."
echo "正在构建所有服务..."
if ! npm run build; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 构建完成！${NC}"

echo ""
echo "[5/5] 启动所有微服务..."
npm run start:all &

# 等待服务启动
echo -e "${CYAN}等待服务启动...${NC}"
sleep 8

# 检查服务状态
echo ""
echo "======================================"
echo "        服务启动检查 🔍"
echo "======================================"
echo ""

API_GATEWAY=$(curl -s http://localhost:3000/api/v1/health 2>/dev/null && echo "✅" || echo "❌")
AUTH_SERVICE=$(curl -s http://localhost:3002/api/v1/auth/health 2>/dev/null && echo "✅" || echo "❌")
USER_SERVICE=$(curl -s http://localhost:3001/api/v1/users/health 2>/dev/null && echo "✅" || echo "❌")
NOVEL_SERVICE=$(curl -s http://localhost:3003/health 2>/dev/null && echo "✅" || echo "❌")
AI_SERVICE=$(curl -s http://localhost:3004/health 2>/dev/null && echo "✅" || echo "❌")

echo -e "${BLUE}📡 API网关: http://localhost:3000 ${API_GATEWAY}${NC}"
echo -e "${BLUE}🔐 认证服务: http://localhost:3002 ${AUTH_SERVICE}${NC}"  
echo -e "${BLUE}👤 用户服务: http://localhost:3001 ${USER_SERVICE}${NC}"
echo -e "${BLUE}📚 小说服务: http://localhost:3003 ${NOVEL_SERVICE}${NC}"
echo -e "${BLUE}🤖 AI服务: http://localhost:3004 ${AI_SERVICE}${NC}"
echo ""
echo -e "${GREEN}📖 API文档: http://localhost:3000/api/docs${NC}"
echo ""

if [[ "$API_GATEWAY" == "✅" ]]; then
    echo -e "${GREEN}🎉 所有服务启动成功！${NC}"
else
    echo -e "${YELLOW}⚠️  部分服务可能还在启动中...${NC}"
fi

echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务...${NC}"
trap 'echo -e "\n${RED}正在停止服务...${NC}"; kill $(jobs -p) 2>/dev/null; exit' INT

# 保持脚本运行
wait