# Script Final untuk menjalankan SmartSchool dengan semua konfigurasi yang benar

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Final Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# 1. Pastikan .env backend benar
Write-Host "[1/5] Verifying Backend Configuration..." -ForegroundColor Yellow
Set-Location $backendPath

$envContent = Get-Content .env -Raw
$needsUpdate = $false

if ($envContent -notmatch "APP_URL=http://localhost:8000") {
    $envContent = $envContent -replace "APP_URL=.*", "APP_URL=http://localhost:8000"
    $needsUpdate = $true
}

if ($envContent -notmatch "SANCTUM_STATEFUL_DOMAINS") {
    $envContent += "`nSANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000`n"
    $needsUpdate = $true
}

if ($envContent -match "SESSION_DOMAIN=null") {
    $envContent = $envContent -replace "SESSION_DOMAIN=null", "SESSION_DOMAIN=localhost"
    $needsUpdate = $true
}

if ($needsUpdate) {
    $envContent | Set-Content .env -NoNewline
    Write-Host "  OK: Backend .env updated" -ForegroundColor Green
} else {
    Write-Host "  OK: Backend .env is correct" -ForegroundColor Green
}

# 2. Pastikan .env.local frontend benar
Write-Host ""
Write-Host "[2/5] Verifying Frontend Configuration..." -ForegroundColor Yellow
Set-Location $frontendPath

"NEXT_PUBLIC_API_URL=http://localhost:8000/api" | Out-File -FilePath ".env.local" -Encoding utf8 -Force
Write-Host "  OK: Frontend .env.local is correct" -ForegroundColor Green

# 3. Clear semua cache
Write-Host ""
Write-Host "[3/5] Clearing Caches..." -ForegroundColor Yellow
Set-Location $backendPath
php artisan config:clear | Out-Null
php artisan cache:clear | Out-Null
php artisan route:clear | Out-Null
php artisan view:clear | Out-Null
Write-Host "  OK: All caches cleared" -ForegroundColor Green

# 4. Test Database Connection
Write-Host ""
Write-Host "[4/5] Testing Database..." -ForegroundColor Yellow
$dbTest = php artisan tinker --execute="echo DB::connection()->getPdo() ? 'OK' : 'FAIL';" 2>&1
if ($dbTest -match "OK") {
    Write-Host "  OK: Database connection successful" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Database connection failed!" -ForegroundColor Red
    Write-Host "  Please check MySQL is running and database 'smartschool' exists" -ForegroundColor Yellow
    exit 1
}

# 5. Start Servers
Write-Host ""
Write-Host "[5/5] Starting Servers..." -ForegroundColor Yellow

# Stop existing servers on ports
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Stop-Process -Id $port8000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Start Backend
Write-Host "  Starting Backend (Laravel) on port 8000..." -ForegroundColor Cyan
$backendCmd = @"
cd '$backendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  SmartSchool Backend (Laravel)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Server: http://localhost:8000' -ForegroundColor Green
Write-Host 'API: http://localhost:8000/api' -ForegroundColor Green
Write-Host ''
php artisan serve
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "  Starting Frontend (Next.js) on port 3000..." -ForegroundColor Cyan
$frontendCmd = @"
cd '$frontendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  SmartSchool Frontend (Next.js)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Server: http://localhost:3000' -ForegroundColor Green
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Configuration:" -ForegroundColor White
Write-Host "    Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "    Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "    Database: Connected" -ForegroundColor Green
Write-Host ""
Write-Host "  Two terminal windows have been opened:" -ForegroundColor White
Write-Host "    1. Backend Terminal (Laravel)" -ForegroundColor Cyan
Write-Host "    2. Frontend Terminal (Next.js)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Wait 10-15 seconds for servers to start," -ForegroundColor Yellow
Write-Host "  then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  To stop: Close terminal windows or Ctrl+C" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
