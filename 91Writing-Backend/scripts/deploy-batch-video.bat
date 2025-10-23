@echo off
chcp 65001 >nul
REM 批量视频生成功能部署脚本 (Windows版)
REM 使用方法: scripts\deploy-batch-video.bat

echo ==========================================
echo   91Writing 批量视频生成功能部署脚本
echo ==========================================
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误: 请在 91Writing-Backend 目录下运行此脚本
    pause
    exit /b 1
)

REM 步骤1: 检查依赖
echo 步骤1: 检查依赖...
echo.

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm: %NPM_VERSION%

REM 检查FFmpeg
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  FFmpeg 未安装，视频合成功能可能无法使用
    echo    下载地址: https://ffmpeg.org/download.html
    echo    安装后请添加到系统PATH
) else (
    for /f "tokens=*" %%i in ('ffmpeg -version ^| findstr /C:"ffmpeg version"') do set FFMPEG_VERSION=%%i
    echo ✅ FFmpeg: %FFMPEG_VERSION%
)

REM 检查Redis
where redis-cli >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Redis CLI 未安装
    echo    Windows版下载: https://github.com/microsoftarchive/redis/releases
) else (
    redis-cli ping >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Redis: 运行中
    ) else (
        echo ⚠️  Redis: 未运行，请启动Redis服务
    )
)

echo.

REM 步骤2: 安装npm依赖
echo 步骤2: 检查npm依赖...
echo.

if not exist "node_modules" (
    echo 安装依赖...
    call npm install
) else (
    echo ✅ 依赖已安装
)

echo.

REM 步骤3: 生成Prisma Client
echo 步骤3: 生成Prisma Client...
echo.

call npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo ✅ Prisma Client 生成成功
) else (
    echo ❌ Prisma Client 生成失败
    pause
    exit /b 1
)

echo.

REM 步骤4: 数据库迁移
echo 步骤4: 数据库迁移...
echo.

set /p MIGRATE="是否执行数据库迁移？这将创建新的表。(y/n) "

if /i "%MIGRATE%"=="y" (
    echo 执行迁移...
    
    REM 检查DATABASE_URL
    if not defined DATABASE_URL (
        echo ⚠️  DATABASE_URL 环境变量未设置
        echo 请在 .env 文件中配置数据库连接
        pause
    )
    
    REM 执行迁移
    call npx prisma migrate deploy
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 数据库迁移成功
    ) else (
        echo ❌ 数据库迁移失败
        echo 你可以手动执行SQL：
        echo mysql -u root -p 91writing ^< prisma\migrations\add_batch_video_generation.sql
    )
) else (
    echo ⚠️  跳过数据库迁移
    echo 请稍后手动执行：
    echo npx prisma migrate deploy
    echo 或：
    echo mysql -u root -p 91writing ^< prisma\migrations\add_batch_video_generation.sql
)

echo.

REM 步骤5: 检查环境变量
echo 步骤5: 检查环境变量...
echo.

if exist ".env" (
    echo ✅ .env 文件存在
    
    REM 检查关键配置
    findstr /C:"JIMENG_API_KEY" .env >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 即梦API配置已设置
    ) else (
        echo ⚠️  即梦API配置未设置，请添加：
        echo    JIMENG_API_KEY=your_key
        echo    JIMENG_API_URL=https://api.jimeng.ai
    )
    
    findstr /C:"REDIS_HOST" .env >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Redis配置已设置
    ) else (
        echo ⚠️  Redis配置未设置，请添加：
        echo    REDIS_HOST=localhost
        echo    REDIS_PORT=6379
    )
) else (
    echo ⚠️  .env 文件不存在
    echo 请创建 .env 文件并配置必要的环境变量
)

echo.

REM 步骤6: 创建视频存储目录
echo 步骤6: 创建视频存储目录...
echo.

if not exist "data\videos" mkdir data\videos
if not exist "data\temp" mkdir data\temp

echo ✅ 目录创建完成
echo    - data\videos (视频存储)
echo    - data\temp (临时文件)

echo.

REM 步骤7: 编译TypeScript
echo 步骤7: 编译TypeScript代码...
echo.

call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ 编译成功
) else (
    echo ❌ 编译失败，请检查代码错误
    pause
    exit /b 1
)

echo.

REM 完成
echo ==========================================
echo   🎉 部署完成！
echo ==========================================
echo.
echo 📝 后续步骤：
echo.
echo 1. 启动AI服务:
echo    npm run start:dev ai-service
echo.
echo 2. 验证功能:
echo    curl http://localhost:3004/health
echo.
echo 3. 查看Swagger文档:
echo    浏览器访问: http://localhost:3004/api-docs
echo    查找"批量视频生成"标签
echo.
echo 4. 开始使用:
echo    参考文档: docs\BATCH-VIDEO-FINAL-SUMMARY.md
echo.
echo ==========================================
echo   📚 相关文档
echo ==========================================
echo.
echo - 使用指南: docs\BATCH-VIDEO-GENERATION-GUIDE.md
echo - 部署指南: docs\BATCH-VIDEO-DEPLOYMENT.md
echo - API路由: docs\BATCH-VIDEO-API-ROUTES.md
echo - 即梦API说明: docs\JIMENG-API-COMPATIBILITY.md
echo.
echo 🎊 祝使用愉快！
echo.

pause

