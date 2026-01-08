# Script untuk setup awal SmartSchool Application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Initial Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setup Backend
Write-Host "[1/3] Setting up Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# Install Composer dependencies
if (-not (Test-Path "vendor")) {
    Write-Host "  → Installing Composer dependencies..." -ForegroundColor Cyan
    composer install
} else {
    Write-Host "  ✓ Composer dependencies already installed" -ForegroundColor Green
}

# Setup .env file
if (-not (Test-Path ".env")) {
    Write-Host "  → Creating .env file..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✓ .env file created" -ForegroundColor Green
        Write-Host ""
        Write-Host "  ⚠ IMPORTANT: Please edit backend/.env and configure:" -ForegroundColor Yellow
        Write-Host "     - DB_DATABASE=smartschool" -ForegroundColor White
        Write-Host "     - DB_USERNAME=root" -ForegroundColor White
        Write-Host "     - DB_PASSWORD=(your MySQL password)" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
}

# Generate application key
Write-Host "  → Generating application key..." -ForegroundColor Cyan
php artisan key:generate --force | Out-Null
Write-Host "  ✓ Application key generated" -ForegroundColor Green

# Setup Frontend
Write-Host ""
Write-Host "[2/3] Setting up Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Install npm dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "  → Installing npm dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "  ✓ npm dependencies already installed" -ForegroundColor Green
}

# Setup .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "  → Creating .env.local file..." -ForegroundColor Cyan
    "NEXT_PUBLIC_API_URL=http://localhost:8000/api" | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "  ✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env.local exists" -ForegroundColor Green
}

# Database setup reminder
Write-Host ""
Write-Host "[3/3] Database Setup Reminder" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Before running the application:" -ForegroundColor White
Write-Host "  1. Create database smartschool in MySQL/phpMyAdmin" -ForegroundColor White
Write-Host "  2. Configure database in backend/.env" -ForegroundColor White
Write-Host "  3. Run: cd backend; php artisan migrate" -ForegroundColor White
Write-Host ""
Write-Host "  Then run: .\start.ps1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
