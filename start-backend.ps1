# Script untuk menjalankan Backend Server saja
# Gunakan script ini jika hanya ingin menjalankan backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Starting Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "  ERROR: Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Cek apakah .env ada
if (-not (Test-Path ".env")) {
    Write-Host "  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "  Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Cek apakah vendor folder ada
if (-not (Test-Path "vendor")) {
    Write-Host "  Installing Composer dependencies..." -ForegroundColor Yellow
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Cek apakah port 8000 sudah digunakan
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "  WARNING: Port 8000 is already in use!" -ForegroundColor Yellow
    Write-Host "  Stopping existing process..." -ForegroundColor Yellow
    Stop-Process -Id $port8000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "  Starting Laravel development server..." -ForegroundColor Yellow
Write-Host "  Server: http://localhost:8000" -ForegroundColor Green
Write-Host "  API: http://localhost:8000/api" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

php artisan serve
