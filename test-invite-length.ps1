# Test different invite code lengths and formats
$uri = "http://localhost:3002/api/v1/auth/register"
$headers = @{ "Content-Type" = "application/json" }

$testCodes = @(
    @{ code = "A"; description = "Single character" },
    @{ code = "AB"; description = "Two characters" }, 
    @{ code = "ABC"; description = "Three characters" },
    @{ code = "ABCD"; description = "Four characters" },
    @{ code = "INVALID123"; description = "Original test code" },
    @{ code = "TEST_INVITE"; description = "With underscore" },
    @{ code = "test-invite"; description = "Lowercase with dash" },
    @{ code = "1234567890"; description = "Numbers only" }
)

$counter = 0
foreach ($test in $testCodes) {
    $counter++
    Write-Host "Test $counter`: $($test.description) - '$($test.code)'" -ForegroundColor Yellow
    
    $body = @{
        email = "test$counter$(Get-Date -Format 'HHmmss')@91writing.com"
        password = "Test123456" 
        nickname = "TestUser$counter"
        inviteCode = $test.code
        acceptTerms = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        Write-Host "  ✅ Unexpected success" -ForegroundColor Red
    } catch {
        Write-Host "  ❌ Expected failure: $($_.Exception.Message)" -ForegroundColor Green
    }
    
    Write-Host ""
}
