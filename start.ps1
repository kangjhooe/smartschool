# Script untuk menjalankan SmartSchool Application
# Backend (Laravel) dan Frontend (Next.js)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setup Backend
Write-Host "[1/2] Setting up Backend (Laravel)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "  ERROR: Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Cek file .env
if (-not (Test-Path ".env")) {
    Write-Host "  WARNING: .env file not found, copying from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  OK: .env file created" -ForegroundColor Green
        Write-Host "  WARNING: Please configure database settings in backend/.env" -ForegroundColor Yellow
    }
}

# Cek apakah vendor folder ada
if (-not (Test-Path "vendor")) {
    Write-Host "  Installing Composer dependencies..." -ForegroundColor Yellow
    composer install
}

# Start Backend Server
Write-Host "  Starting Laravel server on http://localhost:8000..." -ForegroundColor Cyan
$backendCmd = "cd '$backendPath'; php artisan serve"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Minimized
Start-Sleep -Seconds 2

# Setup Frontend
Write-Host ""
Write-Host "[2/2] Setting up Frontend (Next.js)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "  ERROR: Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Buat .env.local jika belum ada
if (-not (Test-Path ".env.local")) {
    Write-Host "  Creating .env.local file..." -ForegroundColor Cyan
    "NEXT_PUBLIC_API_URL=http://localhost:8000/api" | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "  OK: .env.local created" -ForegroundColor Green
}

# Cek apakah node_modules ada
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

# Start Frontend Server
Write-Host "  Starting Next.js server on http://localhost:3000..." -ForegroundColor Cyan
$frontendCmd = "cd '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Minimized
Start-Sleep -Seconds 3

# Summary
Write-Host ""
Write-Host "Application Status" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:8000" -ForegroundColor Green
Write-Host "  Frontend App: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  Open your browser and visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To stop servers, close the PowerShell windows" -ForegroundColor Yellow
Write-Host "  or press Ctrl+C in each terminal window" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
