@echo off
chcp 65001 >nul
echo.
echo ======================================
echo    91Writing 后端无Docker启动
echo ======================================
echo.
echo 注意：此脚本跳过Docker数据库，直接启动微服务
echo 请确保您已安装本地MySQL和Redis，或将在模拟模式下运行

echo.
echo [1/4] 检查Node.js环境...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js 18+
    pause
    exit /b 1
)
node --version
echo ✅ Node.js 环境检查通过

echo.
echo [2/4] 安装项目依赖...
npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/4] 尝试数据库连接（可选）...
echo 提示：如果没有本地数据库，服务将在模拟模式下运行
npm run db:generate
npm run db:push
echo ⚠️ 数据库操作完成（可能失败，但不影响服务启动）

echo.
echo [4/4] 启动所有微服务...
echo.
echo 🚀 正在启动服务...
echo 📡 API网关: http://localhost:3000
echo 🔐 认证服务: http://localhost:3002  
echo 👤 用户服务: http://localhost:3002
echo 📚 小说服务: http://localhost:3003
echo 🤖 AI服务: http://localhost:3004
echo.

start "API Gateway" cmd /k "npm run start:gateway"
timeout /t 2 /nobreak >nul

start "Auth Service" cmd /k "npm run start:auth" 
timeout /t 2 /nobreak >nul

start "User Service" cmd /k "npm run start:user"
timeout /t 2 /nobreak >nul

start "Novel Service" cmd /k "npm run start:novel"
timeout /t 2 /nobreak >nul

start "AI Service" cmd /k "npm run start:ai"
timeout /t 2 /nobreak >nul

echo.
echo ======================================
echo       所有服务启动完成! 🎉
echo ======================================
echo.
echo 📡 API网关: http://localhost:3000
echo 📖 API文档: http://localhost:3000/api/docs
echo.
echo 各个服务将在独立窗口中运行
echo 关闭对应窗口可停止相应服务
echo.
pause
