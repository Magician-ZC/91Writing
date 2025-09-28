# Test with detailed request body logging
$uri = "http://localhost:3002/api/v1/auth/register"
$headers = @{ "Content-Type" = "application/json" }

# Test with empty invite code
Write-Host "Test: Empty invite code" -ForegroundColor Yellow
$body1 = @{
    email = "empty$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "Test123456"
    nickname = "EmptyUser"
    inviteCode = ""  # Empty string
    acceptTerms = $true
} | ConvertTo-Json

Write-Host "Request body:" $body1
try {
    $response1 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body1
    Write-Host "Success (should be okay):" -ForegroundColor Green
    $response1.message
} catch {
    Write-Host "Failed:" -ForegroundColor Red
    $_.Exception.Message
}

Write-Host "`n" + "="*50

# Test with null invite code
Write-Host "Test: No invite code field" -ForegroundColor Yellow
$body2 = @{
    email = "null$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "Test123456"
    nickname = "NullUser"
    # No inviteCode field at all
    acceptTerms = $true
} | ConvertTo-Json

Write-Host "Request body:" $body2
try {
    $response2 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body2
    Write-Host "Success (should be okay):" -ForegroundColor Green
    $response2.message
} catch {
    Write-Host "Failed:" -ForegroundColor Red  
    $_.Exception.Message
}

Write-Host "`n" + "="*50

# Test with non-empty invalid invite code
Write-Host "Test: Invalid invite code (non-empty)" -ForegroundColor Yellow
$body3 = @{
    email = "invalid$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "Test123456"
    nickname = "InvalidUser"
    inviteCode = "DEFINITELY_INVALID_CODE_123"
    acceptTerms = $true
} | ConvertTo-Json

Write-Host "Request body:" $body3
try {
    $response3 = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body3
    Write-Host "Unexpected success:" -ForegroundColor Red
    $response3.message
} catch {
    Write-Host "Expected failure:" -ForegroundColor Green
    $_.Exception.Message
}
