@echo off
chcp 65001 >nul
echo ======================================
echo       91Writing 一键启动脚本
echo ======================================
echo.

echo [1/4] 设置环境变量...
set DATABASE_URL=mysql://writing:writing123@localhost:3306/writing_platform
set JWT_SECRET=91writing_jwt_secret_dev_2024
set REDIS_HOST=localhost
set REDIS_PORT=6379
set NODE_ENV=development
echo ✅ 环境变量已设置

echo.
echo [2/4] 检查数据库连接...
npm run db:push >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 数据库连接失败
    echo 请确保MySQL运行: docker-compose up -d mysql redis
    pause
    exit /b 1
)
echo ✅ 数据库连接成功

echo.
echo [3/4] 构建所有微服务...
echo   - 构建主应用...
call npx nest build >nul 2>&1
echo   - 构建API网关...
call npx nest build api-gateway >nul 2>&1
echo   - 构建认证服务...
call npx nest build auth-service >nul 2>&1
echo   - 构建用户服务...
call npx nest build user-service >nul 2>&1
echo   - 构建小说服务...
call npx nest build novel-service >nul 2>&1
echo   - 构建AI服务...
call npx nest build ai-service >nul 2>&1

echo ✅ 所有服务构建完成

echo.
echo [4/4] 启动所有微服务...
echo ⚠️  按Ctrl+C可停止所有服务
echo.

start "API网关" cmd /k "echo API网关启动中... && node dist/apps/api-gateway/main.js"
timeout /t 2 >nul

start "认证服务" cmd /k "echo 认证服务启动中... && node dist/apps/auth-service/main.js"
timeout /t 2 >nul

start "用户服务" cmd /k "echo 用户服务启动中... && node dist/apps/user-service/main.js"
timeout /t 2 >nul

start "小说服务" cmd /k "echo 小说服务启动中... && node dist/apps/novel-service/main.js"
timeout /t 2 >nul

if exist "dist\apps\ai-service\main.js" (
    start "AI服务" cmd /k "echo AI服务启动中... && node dist/apps/ai-service/main.js"
    timeout /t 2 >nul
)

echo.
echo ======================================
echo        所有服务启动完成! 🎉
echo ======================================
echo.
echo 📡 API网关: http://localhost:3000
echo 📖 API文档: http://localhost:3000/api/docs
echo 🔐 认证服务: http://localhost:3002
echo 👤 用户服务: http://localhost:3001  
echo 📚 小说服务: http://localhost:3003
echo 🤖 AI服务: http://localhost:3004
echo.
echo 💡 提示：每个服务在独立窗口运行
echo 💡 要停止服务，请关闭对应的窗口
echo.
pause
