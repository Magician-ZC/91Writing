#!/bin/bash

# 批量视频生成功能部署脚本
# 使用方法: ./scripts/deploy-batch-video.sh

echo "=========================================="
echo "  91Writing 批量视频生成功能部署脚本"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 91Writing-Backend 目录下运行此脚本"
    exit 1
fi

# 步骤1: 检查依赖
echo "步骤1: 检查依赖..."
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm: $(npm -v)"

# 检查FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg 未安装，视频合成功能可能无法使用"
    echo "   安装方法："
    echo "   - Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Windows: 下载并添加到PATH"
else
    echo "✅ FFmpeg: $(ffmpeg -version | head -n 1)"
fi

# 检查Redis
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis CLI 未安装，无法测试Redis连接"
else
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis: 运行中"
    else
        echo "⚠️  Redis: 未运行，请启动Redis服务"
        echo "   启动方法: redis-server"
    fi
fi

echo ""

# 步骤2: 安装npm依赖
echo "步骤2: 检查npm依赖..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

echo ""

# 步骤3: 生成Prisma Client
echo "步骤3: 生成Prisma Client..."
echo ""

npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client 生成成功"
else
    echo "❌ Prisma Client 生成失败"
    exit 1
fi

echo ""

# 步骤4: 数据库迁移
echo "步骤4: 数据库迁移..."
echo ""

read -p "是否执行数据库迁移？这将创建新的表。(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "执行迁移..."
    
    # 检查DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️  DATABASE_URL 环境变量未设置"
        echo "请在 .env 文件中配置数据库连接"
        read -p "按Enter键继续..."
    fi
    
    # 执行迁移
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库迁移成功"
    else
        echo "❌ 数据库迁移失败"
        echo "你可以手动执行SQL："
        echo "mysql -u root -p 91writing < prisma/migrations/add_batch_video_generation.sql"
    fi
else
    echo "⚠️  跳过数据库迁移"
    echo "请稍后手动执行："
    echo "npx prisma migrate deploy"
    echo "或："
    echo "mysql -u root -p 91writing < prisma/migrations/add_batch_video_generation.sql"
fi

echo ""

# 步骤5: 检查环境变量
echo "步骤5: 检查环境变量..."
echo ""

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env 文件不存在"
    echo "请创建 .env 文件并配置以下变量："
    echo ""
    echo "# Redis配置"
    echo "REDIS_HOST=localhost"
    echo "REDIS_PORT=6379"
    echo ""
    echo "# 视频存储配置"
    echo "VIDEO_STORAGE_PATH=./data/videos"
    echo "VIDEO_TEMP_DIR=./data/temp"
    echo "VIDEO_CDN_URL=http://localhost:3000/videos"
    echo ""
    echo "# 视频Provider"
    echo "VIDEO_PROVIDER=jimeng"
    echo ""
    echo "# 即梦API"
    echo "JIMENG_API_KEY=your_key"
    echo "JIMENG_API_URL=https://api.jimeng.ai"
else
    echo "✅ .env 文件存在"
    
    # 检查关键配置
    if grep -q "JIMENG_API_KEY" "$ENV_FILE"; then
        echo "✅ 即梦API配置已设置"
    else
        echo "⚠️  即梦API配置未设置，请添加："
        echo "   JIMENG_API_KEY=your_key"
        echo "   JIMENG_API_URL=https://api.jimeng.ai"
    fi
    
    if grep -q "REDIS_HOST" "$ENV_FILE"; then
        echo "✅ Redis配置已设置"
    else
        echo "⚠️  Redis配置未设置，请添加："
        echo "   REDIS_HOST=localhost"
        echo "   REDIS_PORT=6379"
    fi
fi

echo ""

# 步骤6: 创建视频存储目录
echo "步骤6: 创建视频存储目录..."
echo ""

mkdir -p ./data/videos
mkdir -p ./data/temp

echo "✅ 目录创建完成"
echo "   - ./data/videos (视频存储)"
echo "   - ./data/temp (临时文件)"

echo ""

# 步骤7: 编译TypeScript
echo "步骤7: 编译TypeScript代码..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo "✅ 编译成功"
else
    echo "❌ 编译失败，请检查代码错误"
    exit 1
fi

echo ""

# 完成
echo "=========================================="
echo "  🎉 部署完成！"
echo "=========================================="
echo ""
echo "📝 后续步骤："
echo ""
echo "1. 启动AI服务:"
echo "   npm run start:dev ai-service"
echo ""
echo "2. 验证功能:"
echo "   curl http://localhost:3004/health"
echo ""
echo "3. 查看Swagger文档:"
echo "   浏览器访问: http://localhost:3004/api-docs"
echo "   查找\"批量视频生成\"标签"
echo ""
echo "4. 开始使用:"
echo "   参考文档: docs/BATCH-VIDEO-FINAL-SUMMARY.md"
echo ""
echo "=========================================="
echo "  📚 相关文档"
echo "=========================================="
echo ""
echo "- 使用指南: docs/BATCH-VIDEO-GENERATION-GUIDE.md"
echo "- 部署指南: docs/BATCH-VIDEO-DEPLOYMENT.md"
echo "- API路由: docs/BATCH-VIDEO-API-ROUTES.md"
echo "- 即梦API说明: docs/JIMENG-API-COMPATIBILITY.md"
echo ""
echo "🎊 祝使用愉快！"
echo ""

