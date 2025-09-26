@echo off
chcp 65001 >nul
echo.
echo ======================================
echo    91Writing 后端开发环境初始化
echo ======================================
echo.

echo [1/6] 检查环境依赖...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js 18+
    pause
    exit /b 1
)

where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

node --version
echo ✅ Node.js 环境检查通过

echo.
echo [2/6] 安装项目依赖...
npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/6] 启动数据库服务...
docker-compose up -d mysql redis
if %ERRORLEVEL% neq 0 (
    echo ❌ 数据库启动失败
    pause
    exit /b 1
)
echo ✅ 数据库服务启动成功

echo.
echo [4/6] 等待数据库就绪...
timeout /t 10 /nobreak >nul
echo ✅ 数据库就绪等待完成

echo.
echo [5/6] 初始化数据库...
npm run db:push
if %ERRORLEVEL% neq 0 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)

npm run db:generate
if %ERRORLEVEL% neq 0 (
    echo ❌ Prisma Client 生成失败
    pause
    exit /b 1
)

npm run db:seed
if %ERRORLEVEL% neq 0 (
    echo ❌ 种子数据初始化失败
    pause
    exit /b 1
)
echo ✅ 数据库初始化完成

echo.
echo [6/6] 启动开发服务...
npm run start:dev

echo.
echo ======================================
echo         开发环境启动完成! 🎉
echo ======================================
echo.
echo 📡 API网关: http://localhost:3000
echo 📖 API文档: http://localhost:3000/api/docs
echo 🗄️ 数据库管理: http://localhost:8080
echo 📊 Redis管理: http://localhost:8081
echo.
echo 测试账号:
echo 📧 邮箱: test@91writing.com
echo 🔑 密码: password123
echo.
echo 按任意键退出...
pause >nul
