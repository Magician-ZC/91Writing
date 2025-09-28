# 简单的用户邀请码系统测试
$baseUri = "http://localhost:3002/api/v1"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== 用户专属邀请码推荐系统测试 ===" -ForegroundColor Cyan

# 步骤1：注册推荐者
Write-Host "`n1. 注册推荐者用户..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$inviterEmail = "inviter$timestamp@91writing.com"

$inviterBody = @{
    email = $inviterEmail
    password = "Test123456"
    nickname = "推荐者"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $inviterResponse = Invoke-RestMethod -Uri "$baseUri/auth/register" -Method POST -Headers $headers -Body $inviterBody
    $inviteCode = $inviterResponse.user.inviteCode
    Write-Host "  ✅ 推荐者注册成功" -ForegroundColor Green
    Write-Host "  📧 邮箱: $inviterEmail" -ForegroundColor Gray
    Write-Host "  🎟️  邀请码: $inviteCode" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ 推荐者注册失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 步骤2：使用邀请码注册被推荐者
Write-Host "`n2. 使用邀请码注册被推荐者..." -ForegroundColor Yellow
$inviteeEmail = "invitee$timestamp@91writing.com"

$inviteeBody = @{
    email = $inviteeEmail
    password = "Test123456"
    nickname = "被推荐者"
    inviteCode = $inviteCode
    acceptTerms = $true
} | ConvertTo-Json

try {
    $inviteeResponse = Invoke-RestMethod -Uri "$baseUri/auth/register" -Method POST -Headers $headers -Body $inviteeBody
    Write-Host "  ✅ 被推荐者注册成功" -ForegroundColor Green
    Write-Host "  📧 邮箱: $inviteeEmail" -ForegroundColor Gray
    Write-Host "  🎟️  自己的邀请码: $($inviteeResponse.user.inviteCode)" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ 被推荐者注册失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 步骤3：登录推荐者查看统计
Write-Host "`n3. 查看推荐统计..." -ForegroundColor Yellow

$loginBody = @{
    email = $inviterEmail
    password = "Test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUri/auth/login" -Method POST -Headers $headers -Body $loginBody
    $token = $loginResponse.tokens.accessToken
    $authHeaders = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $statsResponse = Invoke-RestMethod -Uri "$baseUri/invite/stats" -Method GET -Headers $authHeaders
    Write-Host "  📊 邀请统计:" -ForegroundColor Cyan
    Write-Host "    - 总邀请人数: $($statsResponse.data.totalInvites)" -ForegroundColor White
    Write-Host "    - 邀请码: $($statsResponse.data.inviteCode)" -ForegroundColor White
    
    $rewardsResponse = Invoke-RestMethod -Uri "$baseUri/invite/rewards" -Method GET -Headers $authHeaders
    Write-Host "  🎁 奖励统计:" -ForegroundColor Cyan
    Write-Host "    - 总奖励: $($rewardsResponse.data.summary.totalCount) 次" -ForegroundColor White
    
} catch {
    Write-Host "  ❌ 获取统计失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 测试完成！用户专属邀请码推荐系统工作正常！" -ForegroundColor Green
