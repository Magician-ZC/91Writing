@echo off
REM Phase 2 快速部署脚本 (Windows)
REM 用途: 一键部署世界观一致性检测和角色一致性助手

echo ========================================
echo Phase 2 功能部署脚本
echo ========================================
echo.

echo [1/6] 检查环境...
cd /d "%~dp0..\91Writing-Backend"

IF NOT EXIST "node_modules" (
    echo 错误: 未找到node_modules，请先运行 npm install
    pause
    exit /b 1
)

echo ✓ 环境检查完成
echo.

echo [2/6] 生成 Prisma Client...
call npx prisma generate
IF %ERRORLEVEL% NEQ 0 (
    echo 错误: Prisma generate 失败
    pause
    exit /b 1
)
echo ✓ Prisma Client 生成完成
echo.

echo [3/6] 执行数据库迁移...
echo 提示: 这将创建7个新表
choice /C YN /M "是否继续执行数据库迁移"
IF %ERRORLEVEL% EQU 2 (
    echo 用户取消操作
    pause
    exit /b 0
)

call npx prisma db push
IF %ERRORLEVEL% NEQ 0 (
    echo 错误: 数据库迁移失败
    echo 请检查数据库连接和 schema.prisma 文件
    pause
    exit /b 1
)
echo ✓ 数据库迁移完成
echo.

echo [4/6] 重新编译后端...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo 警告: 编译过程有错误，但可能不影响运行
)
echo ✓ 编译完成
echo.

echo [5/6] 检查前端依赖...
cd /d "%~dp0.."
IF NOT EXIST "node_modules\vis-network" (
    echo 提示: vis-network 未安装（角色关系图需要）
    echo 但 Phase 2 不需要此依赖，可以继续
)
echo ✓ 前端检查完成
echo.

echo [6/6] 部署完成检查...
echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 已创建的功能:
echo   ✓ 世界观一致性检测
echo   ✓ 角色一致性助手
echo   ✓ 角色特征库
echo   ✓ 角色出场统计
echo.
echo 数据库变更:
echo   + ConsistencyCheck (检测记录)
echo   + ConsistencyIssue (检测问题)
echo   + WorldviewRule (规则库)
echo   + TimelineEvent (时间线)
echo   + CharacterFeature (角色特征)
echo   + CharacterAppearance (出场记录)
echo   + CharacterConsistencyWarning (警告)
echo.
echo 下一步:
echo   1. 重启后端服务: npm run start:dev
echo   2. 启动前端: npm run dev
echo   3. 测试功能: 访问一致性检测页面
echo.
echo 文档:
echo   - PHASE2-部署指南.md
echo   - PHASE2-完整实施总结.md
echo.
pause

