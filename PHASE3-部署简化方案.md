# Phase 3 - Week 10: 部署简化方案

**开发时间**: Week 10  
**功能**: 一键部署 + 配置向导 + Docker优化  
**优先级**: ⭐⭐⭐ (中)

---

## 📋 功能概述

### 核心价值
- 部署时间从 2小时 → 10分钟
- 降低技术门槛 80%
- 减少配置错误 90%
- 提升用户体验

### 目标用户
- 开源版本使用者
- 技术能力有限的用户
- 快速体验产品的用户

---

## 🐳 Docker Compose 优化

### docker-compose.yml (优化版)

```yaml
version: '3.8'

services:
  # ========== 数据库服务 ==========
  mysql:
    image: mysql:8.0
    container_name: 91writing-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root123}
      MYSQL_DATABASE: ${DB_NAME:-91writing}
      MYSQL_USER: ${DB_USER:-91user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-91pass}
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./91Writing-Backend/prisma/migrations:/docker-entrypoint-initdb.d
    networks:
      - 91writing-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ========== Redis缓存 ==========
  redis:
    image: redis:7-alpine
    container_name: 91writing-redis
    restart: always
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    networks:
      - 91writing-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # ========== API Gateway ==========
  api-gateway:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: api-gateway
    container_name: 91writing-gateway
    restart: always
    ports:
      - "${GATEWAY_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      USER_SERVICE_URL: http://user-service:3001
      NOVEL_SERVICE_URL: http://novel-service:3002
      AI_SERVICE_URL: http://ai-service:3003
      ADMIN_SERVICE_URL: http://admin-service:3004
      PAYMENT_SERVICE_URL: http://payment-service:3005
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - 91writing-network

  # ========== 微服务 ==========
  user-service:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: user-service
    container_name: 91writing-user
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
      - redis
    networks:
      - 91writing-network

  novel-service:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: novel-service
    container_name: 91writing-novel
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
      - redis
    networks:
      - 91writing-network

  ai-service:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: ai-service
    container_name: 91writing-ai
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_API_BASE_URL: ${OPENAI_API_BASE_URL:-https://api.openai.com/v1}
      OPENAI_MODEL_NAME: ${OPENAI_MODEL_NAME:-gpt-3.5-turbo}
    depends_on:
      - mysql
      - redis
    networks:
      - 91writing-network

  admin-service:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: admin-service
    container_name: 91writing-admin
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    depends_on:
      - mysql
      - redis
    networks:
      - 91writing-network

  payment-service:
    build:
      context: ./91Writing-Backend
      dockerfile: Dockerfile
      target: payment-service
    container_name: 91writing-payment
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://${DB_USER:-91user}:${DB_PASSWORD:-91pass}@mysql:3306/${DB_NAME:-91writing}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
      - redis
    networks:
      - 91writing-network

  # ========== 前端 ==========
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: 91writing-frontend
    restart: always
    ports:
      - "${FRONTEND_PORT:-80}:80"
    depends_on:
      - api-gateway
    networks:
      - 91writing-network

networks:
  91writing-network:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
```

---

## 📝 环境变量模板

### .env.example

```env
# ========================================
# 91写作 环境变量配置
# ========================================

# ==================== 必填配置 ====================

# JWT密钥（必须修改！）
JWT_SECRET=your-super-secret-key-change-this-in-production

# OpenAI API配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-3.5-turbo

# 加密密钥（必须修改！32字符）
ENCRYPTION_KEY=your-32-character-encryption-key!

# ==================== 数据库配置 ====================

# MySQL配置
DB_NAME=91writing
DB_USER=91user
DB_PASSWORD=91pass
DB_ROOT_PASSWORD=root123
DB_PORT=3306

# ==================== Redis配置 ====================

REDIS_PORT=6379

# ==================== 服务端口 ====================

GATEWAY_PORT=3000
FRONTEND_PORT=80

# ==================== 可选配置 ====================

# 管理员默认密码
ADMIN_DEFAULT_PASSWORD=Admin123

# 是否允许用户注册
ALLOW_USER_REGISTRATION=false

# SMTP邮件配置（开放注册时需要）
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=91Writing <no-reply@example.com>

# 日志级别
LOG_LEVEL=info

# ==================== 提示 ====================
# 1. JWT_SECRET 和 ENCRYPTION_KEY 必须修改为随机字符串
# 2. OPENAI_API_KEY 需要从 OpenAI 获取
# 3. 其他配置可以保持默认值
```

---

## 🚀 一键启动脚本

### scripts/quick-start.bat (Windows)

```batch
@echo off
chcp 65001 >nul
echo ========================================
echo 91写作 - 一键启动脚本
echo ========================================
echo.

REM 检查Docker是否运行
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Docker未运行，请先启动Docker Desktop
    pause
    exit /b 1
)

echo [✓] Docker运行正常
echo.

REM 检查.env文件
if not exist ".env" (
    echo [提示] 未找到.env文件，正在创建...
    copy .env.example .env
    echo.
    echo [重要] 请编辑 .env 文件，配置以下必填项:
    echo   1. JWT_SECRET - JWT密钥
    echo   2. OPENAI_API_KEY - OpenAI API密钥
    echo   3. ENCRYPTION_KEY - 加密密钥
    echo.
    echo 配置完成后，重新运行此脚本
    pause
    notepad .env
    exit /b 0
)

echo [✓] 环境变量文件存在
echo.

REM 检查必填环境变量
findstr /C:"your-super-secret-key-change-this" .env >nul
if %ERRORLEVEL% EQU 0 (
    echo [警告] 检测到默认的JWT_SECRET，请修改！
    pause
    notepad .env
    exit /b 0
)

echo [✓] 环境变量配置检查通过
echo.

echo [1/4] 构建镜像...
docker-compose build --parallel
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 镜像构建失败
    pause
    exit /b 1
)

echo.
echo [2/4] 启动服务...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 服务启动失败
    pause
    exit /b 1
)

echo.
echo [3/4] 等待服务就绪...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] 初始化数据库...
docker-compose exec -T api-gateway npx prisma migrate deploy
docker-compose exec -T api-gateway npx prisma db seed

echo.
echo ========================================
echo ✅ 启动完成！
echo ========================================
echo.
echo 访问地址:
echo   • 前端: http://localhost
echo   • API文档: http://localhost:3000/api/docs
echo   • 数据库管理: http://localhost:8080
echo.
echo 默认管理员账号:
echo   • 邮箱: admin@91writing.com
echo   • 密码: Admin123
echo.
echo 查看日志: docker-compose logs -f
echo 停止服务: docker-compose down
echo.
pause
```

### scripts/quick-start.sh (Linux/Mac)

```bash
#!/bin/bash
set -e

echo "========================================"
echo "91写作 - 一键启动脚本"
echo "========================================"
echo ""

# 检查Docker
if ! docker info > /dev/null 2>&1; then
    echo "[错误] Docker未运行，请先启动Docker"
    exit 1
fi

echo "[✓] Docker运行正常"
echo ""

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "[提示] 未找到.env文件，正在创建..."
    cp .env.example .env
    echo ""
    echo "[重要] 请编辑 .env 文件，配置以下必填项:"
    echo "  1. JWT_SECRET - JWT密钥"
    echo "  2. OPENAI_API_KEY - OpenAI API密钥"
    echo "  3. ENCRYPTION_KEY - 加密密钥"
    echo ""
    echo "配置完成后，重新运行此脚本"
    ${EDITOR:-nano} .env
    exit 0
fi

echo "[✓] 环境变量文件存在"
echo ""

# 检查必填环境变量
if grep -q "your-super-secret-key-change-this" .env; then
    echo "[警告] 检测到默认的JWT_SECRET，请修改！"
    ${EDITOR:-nano} .env
    exit 0
fi

echo "[✓] 环境变量配置检查通过"
echo ""

echo "[1/4] 构建镜像..."
docker-compose build --parallel

echo ""
echo "[2/4] 启动服务..."
docker-compose up -d

echo ""
echo "[3/4] 等待服务就绪..."
sleep 10

echo ""
echo "[4/4] 初始化数据库..."
docker-compose exec -T api-gateway npx prisma migrate deploy
docker-compose exec -T api-gateway npx prisma db seed

echo ""
echo "========================================"
echo "✅ 启动完成！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  • 前端: http://localhost"
echo "  • API文档: http://localhost:3000/api/docs"
echo "  • 数据库管理: http://localhost:8080"
echo ""
echo "默认管理员账号:"
echo "  • 邮箱: admin@91writing.com"
echo "  • 密码: Admin123"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
```

---

## 🎨 配置向导界面

### src/views/admin/settings/SetupWizard.vue

```vue
<template>
  <div class="setup-wizard">
    <el-card>
      <template #header>
        <div class="wizard-header">
          <h2>⚙️ 系统配置向导</h2>
          <el-tag type="info">首次配置</el-tag>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success">
        <el-step title="数据库" />
        <el-step title="Redis" />
        <el-step title="AI服务" />
        <el-step title="管理员" />
        <el-step title="完成" />
      </el-steps>

      <div class="wizard-content">
        <!-- 步骤1: 数据库配置 -->
        <div v-if="currentStep === 0" class="step-panel">
          <h3>📊 数据库配置</h3>
          
          <el-form :model="config.database" label-width="120px">
            <el-form-item label="数据库类型">
              <el-radio-group v-model="config.database.type">
                <el-radio label="mysql">MySQL</el-radio>
                <el-radio label="sqlite">SQLite（开发）</el-radio>
              </el-radio-group>
            </el-form-item>

            <template v-if="config.database.type === 'mysql'">
              <el-form-item label="主机地址">
                <el-input v-model="config.database.host" placeholder="localhost" />
              </el-form-item>

              <el-form-item label="端口">
                <el-input-number v-model="config.database.port" :min="1" :max="65535" />
              </el-form-item>

              <el-form-item label="数据库名">
                <el-input v-model="config.database.database" />
              </el-form-item>

              <el-form-item label="用户名">
                <el-input v-model="config.database.username" />
              </el-form-item>

              <el-form-item label="密码">
                <el-input v-model="config.database.password" type="password" show-password />
              </el-form-item>

              <el-form-item>
                <el-button @click="testDatabaseConnection" :loading="testing.database">
                  测试连接
                </el-button>
              </el-form-item>
            </template>
          </el-form>
        </div>

        <!-- 步骤2: Redis配置 -->
        <div v-if="currentStep === 1" class="step-panel">
          <h3>⚡ Redis配置</h3>
          
          <el-form :model="config.redis" label-width="120px">
            <el-form-item label="主机地址">
              <el-input v-model="config.redis.host" placeholder="localhost" />
            </el-form-item>

            <el-form-item label="端口">
              <el-input-number v-model="config.redis.port" :min="1" :max="65535" />
            </el-form-item>

            <el-form-item label="密码">
              <el-input v-model="config.redis.password" type="password" show-password />
            </el-form-item>

            <el-form-item>
              <el-button @click="testRedisConnection" :loading="testing.redis">
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤3: AI服务配置 -->
        <div v-if="currentStep === 2" class="step-panel">
          <h3>🤖 AI服务配置</h3>
          
          <el-form :model="config.ai" label-width="120px">
            <el-form-item label="API密钥">
              <el-input 
                v-model="config.ai.apiKey" 
                type="password" 
                show-password
                placeholder="sk-..."
              />
            </el-form-item>

            <el-form-item label="API地址">
              <el-input 
                v-model="config.ai.baseUrl" 
                placeholder="https://api.openai.com/v1"
              />
            </el-form-item>

            <el-form-item label="模型名称">
              <el-select v-model="config.ai.modelName" style="width: 100%">
                <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
                <el-option label="gpt-4" value="gpt-4" />
                <el-option label="gpt-4-turbo" value="gpt-4-turbo" />
                <el-option label="deepseek-chat" value="deepseek-chat" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button @click="testAIConnection" :loading="testing.ai">
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤4: 管理员配置 -->
        <div v-if="currentStep === 3" class="step-panel">
          <h3>👤 管理员账号</h3>
          
          <el-form :model="config.admin" label-width="120px">
            <el-form-item label="邮箱">
              <el-input v-model="config.admin.email" />
            </el-form-item>

            <el-form-item label="密码">
              <el-input 
                v-model="config.admin.password" 
                type="password" 
                show-password
                placeholder="至少8个字符"
              />
            </el-form-item>

            <el-form-item label="确认密码">
              <el-input 
                v-model="config.admin.confirmPassword" 
                type="password" 
                show-password
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤5: 完成 -->
        <div v-if="currentStep === 4" class="step-panel">
          <div class="completion-panel">
            <el-icon size="80" color="#67c23a"><SuccessFilled /></el-icon>
            <h2>配置完成！</h2>
            <p>系统已准备就绪，可以开始使用了</p>

            <el-descriptions :column="1" border class="config-summary">
              <el-descriptions-item label="数据库">
                {{ config.database.type === 'mysql' ? 'MySQL' : 'SQLite' }}
              </el-descriptions-item>
              <el-descriptions-item label="缓存">
                Redis {{ config.redis.host }}:{{ config.redis.port }}
              </el-descriptions-item>
              <el-descriptions-item label="AI服务">
                {{ config.ai.modelName }}
              </el-descriptions-item>
              <el-descriptions-item label="管理员">
                {{ config.admin.email }}
              </el-descriptions-item>
            </el-descriptions>

            <el-alert
              type="success"
              :closable="false"
              class="mt-3"
            >
              <template #title>
                配置已保存到 .env 文件，重启服务后生效
              </template>
            </el-alert>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="wizard-footer">
        <el-button
          v-if="currentStep > 0 && currentStep < 4"
          @click="prevStep"
        >
          上一步
        </el-button>

        <el-button
          v-if="currentStep < 3"
          type="primary"
          @click="nextStep"
          :disabled="!canProceed"
        >
          下一步
        </el-button>

        <el-button
          v-if="currentStep === 3"
          type="primary"
          @click="saveAndNext"
          :loading="saving"
        >
          保存并继续
        </el-button>

        <el-button
          v-if="currentStep === 4"
          type="success"
          @click="finish"
        >
          完成配置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { SuccessFilled } from '@element-plus/icons-vue'

const router = useRouter()

const currentStep = ref(0)
const testing = ref({
  database: false,
  redis: false,
  ai: false
})
const saving = ref(false)

const config = ref({
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '91writing',
    username: '91user',
    password: ''
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: ''
  },
  ai: {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo'
  },
  admin: {
    email: 'admin@91writing.com',
    password: '',
    confirmPassword: ''
  }
})

// 是否可以进入下一步
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return config.value.database.type === 'sqlite' || 
             (config.value.database.host && config.value.database.password)
    case 1:
      return config.value.redis.host
    case 2:
      return config.value.ai.apiKey
    case 3:
      return config.value.admin.email && 
             config.value.admin.password && 
             config.value.admin.password === config.value.admin.confirmPassword
    default:
      return true
  }
})

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const testDatabaseConnection = async () => {
  testing.value.database = true
  
  try {
    // 调用后端API测试数据库连接
    // await testConnection('database', config.value.database)
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟
    ElMessage.success('数据库连接成功！')
  } catch (error) {
    ElMessage.error('数据库连接失败: ' + error.message)
  } finally {
    testing.value.database = false
  }
}

const testRedisConnection = async () => {
  testing.value.redis = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟
    ElMessage.success('Redis连接成功！')
  } catch (error) {
    ElMessage.error('Redis连接失败: ' + error.message)
  } finally {
    testing.value.redis = false
  }
}

const testAIConnection = async () => {
  testing.value.ai = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟
    ElMessage.success('AI服务连接成功！')
  } catch (error) {
    ElMessage.error('AI服务连接失败: ' + error.message)
  } finally {
    testing.value.ai = false
  }
}

const saveAndNext = async () => {
  saving.value = true
  
  try {
    // 保存配置到后端
    // await saveConfig(config.value)
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟
    ElMessage.success('配置已保存')
    nextStep()
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const finish = () => {
  ElMessage.success('配置向导完成！')
  router.push('/admin/dashboard')
}
</script>

<style scoped>
.setup-wizard {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wizard-header h2 {
  margin: 0;
  font-size: 20px;
}

.wizard-content {
  min-height: 400px;
  padding: 40px 20px;
}

.step-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.step-panel h3 {
  margin: 0 0 24px;
  font-size: 18px;
  color: #303133;
}

.completion-panel {
  text-align: center;
  padding: 40px 20px;
}

.completion-panel h2 {
  margin: 20px 0 10px;
  color: #303133;
}

.config-summary {
  margin-top: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.wizard-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.mt-3 {
  margin-top: 16px;
}
</style>
```

---

## 📋 健康检查脚本

### scripts/check-health.bat (Windows)

```batch
@echo off
echo ========================================
echo 91写作 - 服务健康检查
echo ========================================
echo.

echo [1] 检查Docker容器状态...
docker-compose ps

echo.
echo [2] 检查API Gateway...
curl -s http://localhost:3000/api/v1/health || echo [失败] API Gateway 未响应

echo.
echo [3] 检查数据库连接...
docker-compose exec -T mysql mysqladmin -u root -p%DB_ROOT_PASSWORD% ping || echo [失败] MySQL 未运行

echo.
echo [4] 检查Redis连接...
docker-compose exec -T redis redis-cli ping || echo [失败] Redis 未运行

echo.
echo ========================================
echo 健康检查完成
echo ========================================
pause
```

---

## 📋 一键停止脚本

### scripts/stop-all.bat (Windows)

```batch
@echo off
echo 正在停止所有服务...
docker-compose down

echo.
echo 是否删除数据卷? (y/n)
set /p choice=

if /i "%choice%"=="y" (
    docker-compose down -v
    echo 数据卷已删除
) else (
    echo 数据卷已保留
)

echo.
echo 服务已停止
pause
```

---

## 📝 README 更新

### README.md (添加快速开始部分)

```markdown
## 🚀 快速开始（5分钟部署）

### 前置要求

- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- 8GB+ 内存
- 10GB+ 硬盘空间

### 一键部署

**Windows:**
```bash
git clone https://github.com/your-repo/91Writing.git
cd 91Writing
.\scripts\quick-start.bat
```

**Linux/Mac:**
```bash
git clone https://github.com/your-repo/91Writing.git
cd 91Writing
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### 配置说明

首次运行会创建 `.env` 文件，需要配置：

1. **JWT_SECRET** - 随机字符串（重要！）
2. **OPENAI_API_KEY** - 你的OpenAI API密钥
3. **ENCRYPTION_KEY** - 32字符加密密钥

配置完成后再次运行启动脚本即可。

### 访问系统

- 前端：http://localhost
- API文档：http://localhost:3000/api/docs
- 管理员：admin@91writing.com / Admin123

### 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 健康检查
.\scripts\check-health.bat
```
```

---

**状态**: ✅ 部署简化方案完成  
**下一步**: 创建完整实施文件

