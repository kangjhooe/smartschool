# Script untuk menjalankan Backend dan Frontend di 2 terminal terpisah

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Starting Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Start Backend di terminal baru
Write-Host "Starting Backend (Laravel) in new terminal..." -ForegroundColor Yellow
Write-Host "  Terminal will open at: $backendPath" -ForegroundColor Cyan
Write-Host "  Server will run on: http://localhost:8000" -ForegroundColor Cyan

$backendCommand = @"
cd '$backendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  SmartSchool Backend (Laravel)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Starting Laravel development server...' -ForegroundColor Yellow
Write-Host 'Server: http://localhost:8000' -ForegroundColor Green
Write-Host 'API: http://localhost:8000/api' -ForegroundColor Green
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''
php artisan serve
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Start-Sleep -Seconds 2

# Start Frontend di terminal baru
Write-Host ""
Write-Host "Starting Frontend (Next.js) in new terminal..." -ForegroundColor Yellow
Write-Host "  Terminal will open at: $frontendPath" -ForegroundColor Cyan
Write-Host "  Server will run on: http://localhost:3000" -ForegroundColor Cyan

$frontendCommand = @"
cd '$frontendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  SmartSchool Frontend (Next.js)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Starting Next.js development server...' -ForegroundColor Yellow
Write-Host 'Server: http://localhost:3000' -ForegroundColor Green
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two terminal windows have been opened:" -ForegroundColor White
Write-Host "  1. Backend Terminal - Laravel (port 8000)" -ForegroundColor Cyan
Write-Host "  2. Frontend Terminal - Next.js (port 3000)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait a few seconds for servers to start, then:" -ForegroundColor Yellow
Write-Host "  Open browser: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "To stop servers, close the terminal windows" -ForegroundColor Yellow
Write-Host "or press Ctrl+C in each terminal" -ForegroundColor Yellow
Write-Host ""
