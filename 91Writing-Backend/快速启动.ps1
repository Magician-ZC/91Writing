# 91Writing 快速启动脚本 (PowerShell版本)
# 适用于Windows PowerShell环境

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "       91Writing 快速启动脚本" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1：环境变量
Write-Host "[1/4] 设置环境变量..." -ForegroundColor Yellow
$env:DATABASE_URL = "mysql://writing:writing123@localhost:3306/writing_platform"
$env:JWT_SECRET = "91writing_jwt_secret_dev_2024" 
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"
$env:NODE_ENV = "development"
Write-Host "✅ 环境变量已设置" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] 检查数据库连接..." -ForegroundColor Yellow
try {
    npm run db:push *> $null
    Write-Host "✅ 数据库连接成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 数据库连接失败" -ForegroundColor Red
    Write-Host "请确保MySQL运行: docker-compose up -d mysql redis" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "[3/4] 构建所有微服务..." -ForegroundColor Yellow
Write-Host "  - 构建主应用..." -ForegroundColor Gray
npm run build *> $null
Write-Host "  - 构建所有微服务..." -ForegroundColor Gray  
npm run build:services *> $null
Write-Host "✅ 所有服务构建完成" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] 启动所有微服务..." -ForegroundColor Yellow
Write-Host "⚠️  按Ctrl+C可停止所有服务" -ForegroundColor Yellow
Write-Host ""

# 启动所有服务
try {
    npm run start:all
} catch {
    Write-Host "❌ 服务启动失败" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "        所有服务启动完成! 🎉" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 API网关: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📖 API文档: http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host "🔐 认证服务: http://localhost:3002" -ForegroundColor Cyan
Write-Host "👤 用户服务: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📚 小说服务: http://localhost:3003" -ForegroundColor Cyan
Write-Host "🤖 AI服务: http://localhost:3004" -ForegroundColor Cyan
Write-Host ""
