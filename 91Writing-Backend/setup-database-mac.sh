#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "========================================="
echo "   91Writing 数据库快速安装配置 (Mac)"
echo "========================================="
echo ""

# 检查Homebrew
if ! command -v brew >/dev/null 2>&1; then
    echo -e "${RED}❌ 未检测到Homebrew${NC}"
    echo ""
    echo -e "${YELLOW}请先安装Homebrew：${NC}"
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 1
fi

echo -e "${GREEN}✅ Homebrew已安装${NC}"
echo ""

echo "[1/3] 安装MySQL和Redis..."
brew install mysql redis
echo -e "${GREEN}✅ 软件包安装完成${NC}"

echo ""
echo "[2/3] 启动服务..."
brew services start mysql
brew services start redis
echo -e "${GREEN}✅ 服务已启动${NC}"

echo ""
echo "[3/3] 配置数据库..."

# 等待MySQL启动
echo "等待MySQL启动完成..."
sleep 5

# 设置MySQL
echo -e "${CYAN}正在配置MySQL数据库...${NC}"
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS writing_platform;
CREATE USER IF NOT EXISTS 'writing'@'localhost' IDENTIFIED BY 'writing123';
GRANT ALL PRIVILEGES ON writing_platform.* TO 'writing'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL配置成功${NC}"
else
    echo -e "${RED}❌ MySQL配置失败，可能需要手动配置${NC}"
    echo ""
    echo -e "${YELLOW}手动配置命令：${NC}"
    echo "mysql -u root -p"
    echo "CREATE DATABASE writing_platform;"
    echo "CREATE USER 'writing'@'localhost' IDENTIFIED BY 'writing123';"
    echo "GRANT ALL PRIVILEGES ON writing_platform.* TO 'writing'@'localhost';"
    echo "FLUSH PRIVILEGES;"
fi

# 设置Redis密码
echo ""
echo -e "${CYAN}正在配置Redis密码...${NC}"
redis-cli CONFIG SET requirepass redis123
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redis配置成功${NC}"
else
    echo -e "${RED}❌ Redis配置失败${NC}"
    echo -e "${YELLOW}手动配置：redis-cli CONFIG SET requirepass redis123${NC}"
fi

echo ""
echo "========================================="
echo "           配置完成! 🎉"
echo "========================================="
echo ""
echo -e "${BLUE}📊 MySQL状态: $(brew services list | grep mysql | awk '{print $2}')${NC}"
echo -e "${BLUE}🗄️  Redis状态: $(brew services list | grep redis | awk '{print $2}')${NC}"
echo ""
echo -e "${GREEN}现在可以运行 ./START.sh 启动后端服务！${NC}"
echo ""

# 测试连接
echo -e "${CYAN}测试数据库连接...${NC}"
if mysql -u writing -pwriting123 -e "USE writing_platform; SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL连接测试成功${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL连接测试失败，请检查配置${NC}"
fi

if redis-cli -a redis123 ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis连接测试成功${NC}"
else
    echo -e "${YELLOW}⚠️  Redis连接测试失败，请检查配置${NC}"
fi