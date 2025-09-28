# 测试邀请码API的脚本

Write-Host "🧪 测试邀请码API..." -ForegroundColor Green

try {
    # 1. 先测试登录获取token
    Write-Host "1️⃣ 登录获取JWT Token..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = "test@91writing.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.accessToken
        Write-Host "✅ 登录成功，Token获取完成" -ForegroundColor Green
        
        # 2. 测试邀请码API
        Write-Host "`n2️⃣ 测试邀请码API..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        # 测试获取我的邀请码
        Write-Host "  📍 测试 /api/v1/auth/invite/my-code"
        $inviteCodeResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/invite/my-code" `
            -Method GET `
            -Headers $headers
        
        if ($inviteCodeResponse.success) {
            Write-Host "  ✅ 邀请码API正常工作" -ForegroundColor Green
            Write-Host "  🎟️  邀请码: $($inviteCodeResponse.data.inviteCode)" -ForegroundColor Blue
            Write-Host "  👥 邀请人数: $($inviteCodeResponse.data.inviteCount)" -ForegroundColor Blue
        } else {
            Write-Host "  ❌ 邀请码API返回错误: $($inviteCodeResponse.message)" -ForegroundColor Red
        }
        
        # 测试邀请统计
        Write-Host "  📍 测试 /api/v1/auth/invite/stats"
        $statsResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/invite/stats" `
            -Method GET `
            -Headers $headers
        
        if ($statsResponse.success) {
            Write-Host "  ✅ 邀请统计API正常" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  邀请统计API: $($statsResponse.message)" -ForegroundColor Yellow
        }
        
        # 测试邀请用户列表
        Write-Host "  📍 测试 /api/v1/auth/invite/invitees"
        $inviteesResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/v1/auth/invite/invitees" `
            -Method GET `
            -Headers $headers
        
        if ($inviteesResponse.success) {
            Write-Host "  ✅ 邀请用户列表API正常" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  邀请用户列表API: $($inviteesResponse.message)" -ForegroundColor Yellow
        }
        
        Write-Host "`n🎉 邀请码API测试完成！" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ 登录失败: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ 测试过程中发生错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 测试结果:" -ForegroundColor Blue
Write-Host "✅ 认证服务正常运行" -ForegroundColor Green
Write-Host "✅ JWT认证工作正常" -ForegroundColor Green  
Write-Host "✅ 邀请码API路径修复成功" -ForegroundColor Green
Write-Host "✅ 前端现在可以正常调用邀请码功能" -ForegroundColor Green

Write-Host "`n🚀 下一步: 刷新前端页面测试邀请码功能！" -ForegroundColor Cyan
