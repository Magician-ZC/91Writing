@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo          91Writing 服务启动
echo ========================================
echo.

echo 设置环境变量...
set DATABASE_URL=mysql://writing:writing123@localhost:3306/writing_platform
set JWT_SECRET=91writing_jwt_secret_dev_2024
set NODE_ENV=development
set AUTH_SERVICE_PORT=3002

echo 构建项目...
call npm run build:services
if %ERRORLEVEL% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo 启动 auth-service...
start "Auth Service" cmd /k "node dist/apps/auth-service/main.js"

echo 等待服务启动...
timeout /t 3 /nobreak >nul

echo 测试服务...
curl -X GET "http://localhost:3002/api/v1/auth/check-token" 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Auth Service 启动成功！端口: 3002
) else (
    echo ❌ Auth Service 启动失败
)

echo.
echo ========================================
echo 🎉 服务启动完成！现在可以注册了！
echo ========================================
echo.
echo 请在前端使用以下邀请链接测试：
echo http://localhost:7520/#/register?invite=TEST01
echo.
pause
