# Test invite code functionality
$uri = "http://localhost:3002/api/v1/auth/register"
$headers = @{ "Content-Type" = "application/json" }

# Test 1: Invalid invite code
Write-Host "Test 1: Invalid invite code" -ForegroundColor Yellow
$body1 = @{
    email = "invite1$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "Test123456"
    nickname = "InviteUser1"
    inviteCode = "INVALID123"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body1
    Write-Host "Unexpected success:" -ForegroundColor Red
    $response1 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Expected failure:" -ForegroundColor Green
    Write-Host $_.Exception.Message
}

Write-Host "`n" + "="*50

# Test 2: Weak password
Write-Host "Test 2: Weak password validation" -ForegroundColor Yellow
$body2 = @{
    email = "weak$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "test123"  # Missing uppercase letter
    nickname = "WeakUser"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body2
    Write-Host "Unexpected success:" -ForegroundColor Red
    $response2 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Expected failure:" -ForegroundColor Green
    Write-Host $_.Exception.Message
}

Write-Host "`n" + "="*50

# Test 3: Invalid email
Write-Host "Test 3: Invalid email format" -ForegroundColor Yellow
$body3 = @{
    email = "invalid-email"
    password = "Test123456"
    nickname = "InvalidUser"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body3
    Write-Host "Unexpected success:" -ForegroundColor Red
    $response3 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Expected failure:" -ForegroundColor Green
    Write-Host $_.Exception.Message
}
