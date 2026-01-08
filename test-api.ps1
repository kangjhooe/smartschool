# Script untuk test API connection
Write-Host "Testing API Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Test API endpoint
Write-Host "[1] Testing GET http://localhost:8000/api" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api" -Method GET -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Test login endpoint (should return validation error, not network error)
Write-Host "[2] Testing POST http://localhost:8000/api/login" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@test.com"
        password = "test"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "  Status: $statusCode" -ForegroundColor Yellow
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Yellow
    } else {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  This might be a network/CORS issue!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "If you see errors above, check:" -ForegroundColor Cyan
Write-Host "  1. Backend server is running (php artisan serve)" -ForegroundColor Yellow
Write-Host "  2. Port 8000 is not blocked by firewall" -ForegroundColor Yellow
Write-Host "  3. CORS is properly configured" -ForegroundColor Yellow
