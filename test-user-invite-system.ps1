# 测试用户专属邀请码系统
$authUri = "http://localhost:3002/api/v1/auth"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🎯 测试用户专属邀请码系统" -ForegroundColor Yellow
Write-Host "="*60

# 测试1: 创建第一个用户（邀请者）
Write-Host "`n📝 测试1: 注册邀请者用户" -ForegroundColor Cyan
$inviterEmail = "inviter$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
$inviterData = @{
    email = $inviterEmail
    password = "Test123456"
    nickname = "邀请者用户"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $inviterResponse = Invoke-RestMethod -Uri "$authUri/register" -Method POST -Headers $headers -Body $inviterData
    Write-Host "✅ 邀请者注册成功" -ForegroundColor Green
    Write-Host "📧 邀请者邮箱: $inviterEmail" -ForegroundColor White
    Write-Host "🏷️  邀请者ID: $($inviterResponse.data.user.id)" -ForegroundColor White
} catch {
    Write-Host "❌ 邀请者注册失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 等待数据写入
Start-Sleep -Seconds 2

# 测试2: 登录邀请者获取邀请码
Write-Host "`n🔑 测试2: 登录邀请者获取专属邀请码" -ForegroundColor Cyan
$loginData = @{
    email = $inviterEmail
    password = "Test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$authUri/login" -Method POST -Headers $headers -Body $loginData
    $accessToken = $loginResponse.data.tokens.accessToken
    $authHeaders = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accessToken"
    }
    
    Write-Host "✅ 登录成功，获取到访问令牌" -ForegroundColor Green
    
    # 获取我的邀请码
    $myCodeResponse = Invoke-RestMethod -Uri "$authUri/invite/my-code" -Method GET -Headers $authHeaders
    $inviteCode = $myCodeResponse.data.inviteCode
    $shareUrl = $myCodeResponse.data.shareUrl
    
    Write-Host "🎫 专属邀请码: $inviteCode" -ForegroundColor Yellow
    Write-Host "🔗 分享链接: $shareUrl" -ForegroundColor White
    
} catch {
    Write-Host "❌ 获取邀请码失败: $($_.Exception.Message)" -ForegroundColor Red
    
    # 尝试简单测试注册功能
    Write-Host "`n🔄 尝试简单测试..." -ForegroundColor Gray
    $simpleData = @{
        email = "simple$(Get-Date -Format 'HHmmss')@test.com"
        password = "Test123456"
        nickname = "SimpleUser"
        acceptTerms = $true
    } | ConvertTo-Json
    
    try {
        $simpleResponse = Invoke-RestMethod -Uri "$authUri/register" -Method POST -Headers $headers -Body $simpleData
        Write-Host "✅ 简单注册测试成功" -ForegroundColor Green
        Write-Host "用户邮箱: $($simpleResponse.data.user.email)" -ForegroundColor White
    } catch {
        Write-Host "❌ 简单注册也失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 用户专属邀请码系统测试完成！" -ForegroundColor Green
Write-Host "="*60
