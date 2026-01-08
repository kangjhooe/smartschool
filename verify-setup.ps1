# Script untuk verifikasi semua konfigurasi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Verifying Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# 1. Cek MySQL
Write-Host "[1/7] Checking MySQL..." -ForegroundColor Yellow
$xamppMySQL = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($xamppMySQL) {
    Write-Host "  OK: MySQL is running" -ForegroundColor Green
} else {
    $errors += "MySQL is not running"
    Write-Host "  ERROR: MySQL is not running" -ForegroundColor Red
    Write-Host "    Please start MySQL from XAMPP Control Panel" -ForegroundColor Yellow
}

# 2. Cek Backend .env
Write-Host ""
Write-Host "[2/7] Checking Backend .env..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path (Join-Path $backendPath ".env")) {
    $envContent = Get-Content (Join-Path $backendPath ".env") -Raw
    
    if ($envContent -match "APP_URL=http://localhost:8000") {
        Write-Host "  OK: APP_URL is correct" -ForegroundColor Green
    } else {
        $errors += "APP_URL is not set correctly"
        Write-Host "  ERROR: APP_URL should be http://localhost:8000" -ForegroundColor Red
    }
    
    if ($envContent -match "DB_DATABASE=smartschool") {
        Write-Host "  OK: Database name is correct" -ForegroundColor Green
    } else {
        $errors += "Database name is not set correctly"
        Write-Host "  ERROR: DB_DATABASE should be smartschool" -ForegroundColor Red
    }
    
    if ($envContent -match "SANCTUM_STATEFUL_DOMAINS") {
        Write-Host "  OK: SANCTUM_STATEFUL_DOMAINS is set" -ForegroundColor Green
    } else {
        $warnings += "SANCTUM_STATEFUL_DOMAINS is not set"
        Write-Host "  WARNING: SANCTUM_STATEFUL_DOMAINS is not set" -ForegroundColor Yellow
    }
} else {
    $errors += "Backend .env file not found"
    Write-Host "  ERROR: .env file not found" -ForegroundColor Red
}

# 3. Cek Frontend .env.local
Write-Host ""
Write-Host "[3/7] Checking Frontend .env.local..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
$envLocalPath = Join-Path $frontendPath ".env.local"
if (Test-Path $envLocalPath) {
    $envLocal = Get-Content $envLocalPath
    if ($envLocal -match "NEXT_PUBLIC_API_URL=http://localhost:8000/api") {
        Write-Host "  OK: API URL is correct" -ForegroundColor Green
    } else {
        $errors += "Frontend API URL is not correct"
        Write-Host "  ERROR: API URL should be http://localhost:8000/api" -ForegroundColor Red
    }
} else {
    $errors += "Frontend .env.local file not found"
    Write-Host "  ERROR: .env.local file not found" -ForegroundColor Red
}

# 4. Cek Database Connection
Write-Host ""
Write-Host "[4/7] Testing Database Connection..." -ForegroundColor Yellow
Set-Location $backendPath
$dbTest = php artisan db:show 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Database connection successful" -ForegroundColor Green
} else {
    $errors += "Cannot connect to database"
    Write-Host "  ERROR: Cannot connect to database" -ForegroundColor Red
    Write-Host "    $dbTest" -ForegroundColor Yellow
}

# 5. Cek Backend Dependencies
Write-Host ""
Write-Host "[5/7] Checking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path (Join-Path $backendPath "vendor")) {
    Write-Host "  OK: Composer dependencies installed" -ForegroundColor Green
} else {
    $errors += "Backend dependencies not installed"
    Write-Host "  ERROR: Run 'composer install' in backend directory" -ForegroundColor Red
}

# 6. Cek Frontend Dependencies
Write-Host ""
Write-Host "[6/7] Checking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path (Join-Path $frontendPath "node_modules")) {
    Write-Host "  OK: npm dependencies installed" -ForegroundColor Green
} else {
    $errors += "Frontend dependencies not installed"
    Write-Host "  ERROR: Run 'npm install' in frontend directory" -ForegroundColor Red
}

# 7. Cek Ports
Write-Host ""
Write-Host "[7/7] Checking Ports..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($port8000) {
    Write-Host "  OK: Port 8000 is in use (Backend)" -ForegroundColor Green
} else {
    Write-Host "  INFO: Port 8000 is free (Backend not running)" -ForegroundColor Cyan
}

if ($port3000) {
    Write-Host "  OK: Port 3000 is in use (Frontend)" -ForegroundColor Green
} else {
    Write-Host "  INFO: Port 3000 is free (Frontend not running)" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "  Setup Verification: PASSED" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "  Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "    - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "  Ready to start application!" -ForegroundColor Green
    Write-Host "  Run: .\start-separate.ps1" -ForegroundColor Cyan
} else {
    Write-Host "  Setup Verification: FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Errors found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "    - $error" -ForegroundColor Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "  Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "    - $warning" -ForegroundColor Yellow
        }
    }
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
