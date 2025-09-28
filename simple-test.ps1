# Simple test
$uri = "http://localhost:3002/api/v1/auth/register"
$headers = @{ "Content-Type" = "application/json" }

$body = @{
    email = "newtest$(Get-Date -Format 'yyyyMMddHHmmss')@91writing.com"
    password = "Test123456"
    nickname = "TestUser"
    acceptTerms = $true
} | ConvertTo-Json

Write-Host "Testing registration..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Success:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
