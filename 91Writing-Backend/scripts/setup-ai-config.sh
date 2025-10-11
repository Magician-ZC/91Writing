#!/bin/bash

# AI配置系统快速部署脚本
# 用途：自动完成数据库迁移和环境配置

set -e

echo "================================="
echo "91Writing AI配置系统部署脚本"
echo "================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo -e "${RED}错误: 请在91Writing-Backend目录下运行此脚本${NC}"
  exit 1
fi

# 步骤1: 检查.env文件
echo -e "${YELLOW}步骤1: 检查环境变量配置...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}未找到.env文件，正在创建...${NC}"
  cat > .env << 'EOF'
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/91writing"

# JWT密钥
JWT_SECRET="91writing_jwt_secret_key_change_this_in_production"
JWT_EXPIRES_IN="7d"

# AI配置加密密钥（32字符）
AI_CONFIG_ENCRYPTION_KEY="91writing-ai-encryption-key-32c"

# API Gateway
API_GATEWAY_PORT=3000

# 微服务端口
USER_SERVICE_PORT=3001
AUTH_SERVICE_PORT=3002
NOVEL_SERVICE_PORT=3003
AI_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
ADMIN_SERVICE_PORT=3006

# 微服务URL
USER_SERVICE_URL="http://localhost:3001"
AUTH_SERVICE_URL="http://localhost:3002"
NOVEL_SERVICE_URL="http://localhost:3003"
AI_SERVICE_URL="http://localhost:3004"
PAYMENT_SERVICE_URL="http://localhost:3005"
ADMIN_SERVICE_URL="http://localhost:3006"
EOF
  echo -e "${GREEN}✓ .env文件已创建${NC}"
else
  # 检查是否已有AI_CONFIG_ENCRYPTION_KEY
  if ! grep -q "AI_CONFIG_ENCRYPTION_KEY" .env; then
    echo -e "${YELLOW}添加AI配置加密密钥到.env...${NC}"
    echo "" >> .env
    echo "# AI配置加密密钥（32字符）" >> .env
    echo "AI_CONFIG_ENCRYPTION_KEY=\"91writing-ai-encryption-key-32c\"" >> .env
    echo -e "${GREEN}✓ AI配置加密密钥已添加${NC}"
  else
    echo -e "${GREEN}✓ .env文件已存在且包含AI配置${NC}"
  fi
fi

echo ""

# 步骤2: 安装依赖
echo -e "${YELLOW}步骤2: 检查依赖包...${NC}"
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖包..."
  npm install
  echo -e "${GREEN}✓ 依赖包安装完成${NC}"
else
  echo -e "${GREEN}✓ 依赖包已安装${NC}"
fi

echo ""

# 步骤3: 生成Prisma Client
echo -e "${YELLOW}步骤3: 生成Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client已生成${NC}"

echo ""

# 步骤4: 数据库迁移
echo -e "${YELLOW}步骤4: 执行数据库迁移...${NC}"
echo "选择迁移方式："
echo "1) db push (开发环境，快速推送)"
echo "2) migrate dev (创建正式migration)"
read -p "请选择 (1 或 2) [默认: 1]: " migration_choice
migration_choice=${migration_choice:-1}

if [ "$migration_choice" = "1" ]; then
  echo "正在执行 db push..."
  npx prisma db push
  echo -e "${GREEN}✓ 数据库schema已更新${NC}"
else
  echo "正在创建migration..."
  npx prisma migrate dev --name add_ai_config_tables
  echo -e "${GREEN}✓ Migration已创建并执行${NC}"
fi

echo ""

# 步骤5: 初始化全局AI配置
echo -e "${YELLOW}步骤5: 初始化全局AI配置...${NC}"
echo "是否要创建默认的全局AI配置？ (y/n) [默认: y]"
read -p "> " init_config
init_config=${init_config:-y}

if [ "$init_config" = "y" ] || [ "$init_config" = "Y" ]; then
  echo "请输入OpenAI API密钥（可选，留空跳过）："
  read -p "> " openai_key
  
  if [ -n "$openai_key" ]; then
    cat > /tmp/init-ai-config.js << EOF
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = {
    models: [
      {
        id: 'openai-gpt4',
        name: 'GPT-4',
        provider: 'OPENAI',
        model: 'gpt-4',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: '${openai_key}',
        enabled: true,
        isDefault: true,
        tier: 'FREE',
        limits: {
          maxTokens: 4000,
          dailyLimit: 50,
          concurrentLimit: 3
        },
        parameters: {
          temperature: 0.7,
          topP: 1.0,
          maxTokens: 2000
        }
      }
    ]
  };

  await prisma.systemConfig.upsert({
    where: { configKey: 'ai.global' },
    create: {
      configKey: 'ai.global',
      configValue: config,
      description: '全局AI模型配置'
    },
    update: {
      configValue: config
    }
  });

  console.log('✓ 全局AI配置已初始化');
}

main()
  .catch(e => console.error('初始化失败:', e))
  .finally(async () => await prisma.\$disconnect());
EOF

    node /tmp/init-ai-config.js
    rm /tmp/init-ai-config.js
    echo -e "${GREEN}✓ 全局AI配置已初始化${NC}"
  else
    echo -e "${YELLOW}跳过全局AI配置初始化${NC}"
  fi
else
  echo -e "${YELLOW}跳过全局AI配置初始化${NC}"
fi

echo ""
echo "================================="
echo -e "${GREEN}AI配置系统部署完成！${NC}"
echo "================================="
echo ""
echo "接下来："
echo "1. 启动服务: npm run start:dev"
echo "2. 访问管理后台: http://localhost:3006/admin/ai-config/system"
echo "3. 测试用户API: http://localhost:3001/ai-config/available"
echo ""
echo "相关文档："
echo "- AI配置设计方案: AI-CONFIG-UNIFIED-DESIGN.md"
echo "- 后端完成报告: AI-CONFIG-BACKEND-COMPLETE.md"
echo ""
echo "祝开发顺利！"
echo ""

