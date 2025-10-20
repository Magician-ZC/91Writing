#!/bin/bash

# 章节视频生成系统设置脚本
# 用于初始化数据库、安装依赖、配置环境

set -e

echo "🚀 开始设置章节视频生成系统..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查Node.js环境
echo -e "\n${YELLOW}[1/6]${NC} 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装，请先安装Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js版本: $NODE_VERSION${NC}"

# 2. 检查FFmpeg
echo -e "\n${YELLOW}[2/6]${NC} 检查FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg未安装${NC}"
    echo "请安装FFmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt-get install ffmpeg"
    exit 1
fi
FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
echo -e "${GREEN}✅ $FFMPEG_VERSION${NC}"

# 3. 安装npm依赖
echo -e "\n${YELLOW}[3/6]${NC} 安装npm依赖..."
if [ ! -d "node_modules" ]; then
    echo "运行 npm install..."
    npm install
else
    echo -e "${GREEN}✅ node_modules已存在${NC}"
fi

# 4. 检查环境变量配置
echo -e "\n${YELLOW}[4/6]${NC} 检查环境变量配置..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env文件不存在${NC}"
    echo "请根据VIDEO-GENERATION-SETUP.md配置环境变量"
    echo ""
    echo "必需的环境变量："
    echo "  - VOLCENGINE_ACCESS_KEY_ID"
    echo "  - VOLCENGINE_SECRET_ACCESS_KEY"
    echo "  - JIMENG_API_KEY (或 KLING_API_KEY)"
    echo "  - FFMPEG_PATH"
    echo "  - VIDEO_STORAGE_PATH"
    echo ""
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env文件已存在${NC}"
fi

# 5. 创建视频存储目录
echo -e "\n${YELLOW}[5/6]${NC} 创建视频存储目录..."
VIDEO_STORAGE_PATH="${VIDEO_STORAGE_PATH:-/data/videos}"
VIDEO_TEMP_DIR="${VIDEO_TEMP_DIR:-/tmp/video-generation}"

mkdir -p "$VIDEO_STORAGE_PATH"
mkdir -p "$VIDEO_TEMP_DIR"

echo -e "${GREEN}✅ 目录已创建${NC}"
echo "  视频存储: $VIDEO_STORAGE_PATH"
echo "  临时目录: $VIDEO_TEMP_DIR"

# 6. 数据库迁移
echo -e "\n${YELLOW}[6/6]${NC} 执行数据库迁移..."
echo "运行 Prisma 迁移..."

npx prisma migrate dev --name add_video_generation_tables

echo -e "\n${GREEN}✅ 数据库迁移完成${NC}"

# 7. 生成Prisma Client
echo -e "\n${YELLOW}[7/7]${NC} 生成Prisma Client..."
npx prisma generate

echo -e "\n${GREEN}✅ Prisma Client生成完成${NC}"

# 8. 运行Seed脚本（初始化Agent配置）
echo -e "\n${YELLOW}[8/8]${NC} 初始化Agent配置..."
npm run db:seed

echo -e "\n${GREEN}✅ Agent配置初始化完成${NC}"

# 完成
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 章节视频生成系统设置完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n📝 下一步操作："
echo "1. 配置API密钥到.env文件"
echo "2. 启动所有服务: npm run start:all"
echo "3. 访问管理后台配置Agent提示词"
echo "4. 测试视频生成功能"

echo -e "\n📚 相关文档："
echo "- 配置指南: VIDEO-GENERATION-SETUP.md"
echo "- 进度报告: VIDEO-GENERATION-PROGRESS.md"
echo "- 开发总结: VIDEO-GENERATION-SUMMARY.md"

echo -e "\n${YELLOW}⚠️  注意事项：${NC}"
echo "- 确保数据库服务正在运行"
echo "- 确保.env中配置了正确的API密钥"
echo "- 视频生成需要较长时间，建议使用异步队列"
echo "- 视频生成有成本，建议配置用户配额限制"

