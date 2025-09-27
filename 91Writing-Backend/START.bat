@echo off
chcp 65001 >nul
echo ======================================
echo       91Writing 后端一键启动
echo ======================================
echo.
echo 🔧 已清理所有多余脚本，只保留这一个！
echo.
echo [1/2] 设置环境变量...
set DATABASE_URL=mysql://writing:writing123@localhost:3306/writing_platform
set JWT_SECRET=91writing_jwt_secret_dev_2024
set REDIS_HOST=localhost
set REDIS_PORT=6379
set NODE_ENV=development
echo ✅ 环境变量已设置

echo.
echo [2/3] 检查数据库连接...
npm run db:push
if %ERRORLEVEL% neq 0 (
    echo ❌ 数据库连接失败
    echo 请确保Docker MySQL正在运行: docker-compose up -d mysql redis  
    pause
    exit /b 1
)
echo ✅ 数据库连接成功！

echo.
echo [3/4] 构建所有微服务...
npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成！

echo.
echo [4/4] 启动所有微服务...
npm run start:all

echo.
echo ======================================
echo        服务启动完成! 🎉
echo ======================================
echo.
echo 📡 API网关: http://localhost:3000
echo 📖 API文档: http://localhost:3000/api/docs
echo 🔐 认证服务: http://localhost:3002
echo 👤 用户服务: http://localhost:3001  
echo 📚 小说服务: http://localhost:3003
echo 🤖 AI服务: http://localhost:3004
echo.
pause
