# 测试注册接口的PowerShell脚本

$uri = "http://localhost:3002/api/v1/auth/register"
$headers = @{ "Content-Type" = "application/json" }

# 测试1: 正常注册
Write-Host "测试1: 正常注册"
$body1 = @{
    email = "test1@91writing.com"
    password = "Test123456"
    nickname = "TestUser1" 
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body1
    Write-Host "✅ 注册成功:" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 注册失败:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody"
    }
}

Write-Host "`n" + "="*50

# 测试2: 弱密码
Write-Host "测试2: 弱密码"
$body2 = @{
    email = "test2@91writing.com"
    password = "test123"  # 缺少大写字母
    nickname = "TestUser2"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body2
    Write-Host "✅ 意外成功:" -ForegroundColor Yellow
    $response2 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 预期失败:" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody"
    }
}

Write-Host "`n" + "="*50

# 测试3: 无效邮箱
Write-Host "测试3: 无效邮箱"
$body3 = @{
    email = "invalid-email"
    password = "Test123456"
    nickname = "TestUser3"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body3
    Write-Host "✅ 意外成功:" -ForegroundColor Yellow
    $response3 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 预期失败:" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody"
    }
}
