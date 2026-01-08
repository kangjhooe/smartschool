# Script untuk Setup Database SmartSchool

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartSchool - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek MySQL Service
Write-Host "[1/6] Checking MySQL Service..." -ForegroundColor Yellow
$xamppMySQL = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($xamppMySQL) {
    Write-Host "  OK: MySQL process found (XAMPP)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: MySQL process not found" -ForegroundColor Yellow
    Write-Host "  Please start MySQL from XAMPP Control Panel first!" -ForegroundColor Red
    Write-Host "  Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Setup Backend .env
Write-Host ""
Write-Host "[2/6] Configuring Backend .env..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  OK: .env file created from .env.example" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Generate application key
Write-Host "  Generating application key..." -ForegroundColor Cyan
php artisan key:generate --force | Out-Null
Write-Host "  OK: Application key generated" -ForegroundColor Green

# Update .env dengan konfigurasi database
Write-Host "  Updating database configuration..." -ForegroundColor Cyan
$dbName = "smartschool"
$dbUser = "root"
$dbPass = ""

$envLines = Get-Content ".env"
$newEnvLines = @()
foreach ($line in $envLines) {
    if ($line -match "^DB_CONNECTION=") {
        $newEnvLines += "DB_CONNECTION=mysql"
    } elseif ($line -match "^DB_HOST=") {
        $newEnvLines += "DB_HOST=127.0.0.1"
    } elseif ($line -match "^DB_PORT=") {
        $newEnvLines += "DB_PORT=3306"
    } elseif ($line -match "^DB_DATABASE=") {
        $newEnvLines += "DB_DATABASE=$dbName"
    } elseif ($line -match "^DB_USERNAME=") {
        $newEnvLines += "DB_USERNAME=$dbUser"
    } elseif ($line -match "^DB_PASSWORD=") {
        $newEnvLines += "DB_PASSWORD=$dbPass"
    } else {
        $newEnvLines += $line
    }
}
$newEnvLines | Set-Content ".env"
Write-Host "  OK: Database configuration updated" -ForegroundColor Green

# Buat Database menggunakan PHP
Write-Host ""
Write-Host "[3/6] Creating Database..." -ForegroundColor Yellow
Write-Host "  Creating database: $dbName" -ForegroundColor Cyan

# Buat script PHP temporary untuk create database
$createDbScript = @"
<?php
`$host = '127.0.0.1';
`$user = '$dbUser';
`$pass = '$dbPass';
`$db = '$dbName';

try {
    `$pdo = new PDO("mysql:host=`$host", `$user, `$pass);
    `$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    `$pdo->exec("CREATE DATABASE IF NOT EXISTS `$db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created successfully\n";
} catch (PDOException `$e) {
    if (strpos(`$e->getMessage(), 'database exists') !== false) {
        echo "Database already exists\n";
    } else {
        echo "Error: " . `$e->getMessage() . "\n";
        exit(1);
    }
}
"@

$tempScript = Join-Path $env:TEMP "create_db.php"
$createDbScript | Out-File -FilePath $tempScript -Encoding utf8

$createResult = php $tempScript 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Database '$dbName' ready" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Could not create database automatically" -ForegroundColor Yellow
    Write-Host "  Please create database manually in phpMyAdmin:" -ForegroundColor Yellow
    Write-Host "    1. Open http://localhost/phpmyadmin" -ForegroundColor White
    Write-Host "    2. Click 'New' to create database" -ForegroundColor White
    Write-Host "    3. Database name: $dbName" -ForegroundColor White
    Write-Host "    4. Collation: utf8mb4_unicode_ci" -ForegroundColor White
    Write-Host "    5. Click 'Create'" -ForegroundColor White
    Write-Host ""
    Write-Host "  Waiting 10 seconds for you to create the database..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Remove-Item $tempScript -ErrorAction SilentlyContinue

# Test Database Connection
Write-Host ""
Write-Host "[4/6] Testing Database Connection..." -ForegroundColor Yellow
$testResult = php artisan db:show 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Database connection successful" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Cannot connect to database" -ForegroundColor Red
    Write-Host "  Please ensure:" -ForegroundColor Yellow
    Write-Host "    1. MySQL is running" -ForegroundColor White
    Write-Host "    2. Database '$dbName' exists" -ForegroundColor White
    Write-Host "    3. Username and password in .env are correct" -ForegroundColor White
    Write-Host ""
    Write-Host "  You can create the database manually:" -ForegroundColor Yellow
    Write-Host "    - Open: http://localhost/phpmyadmin" -ForegroundColor Cyan
    Write-Host "    - Create database: $dbName" -ForegroundColor Cyan
    exit 1
}

# Clear config cache
Write-Host ""
Write-Host "[5/6] Clearing Configuration Cache..." -ForegroundColor Yellow
php artisan config:clear | Out-Null
Write-Host "  OK: Configuration cache cleared" -ForegroundColor Green

# Run Migrations
Write-Host ""
Write-Host "[6/6] Running Migrations..." -ForegroundColor Yellow
Write-Host "  Creating database tables..." -ForegroundColor Cyan

$migrateResult = php artisan migrate --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Migrations completed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Tables created:" -ForegroundColor Cyan
    php artisan db:show --table | Select-String -Pattern "Tables:" -Context 0,20
} else {
    Write-Host "  ERROR: Migration failed" -ForegroundColor Red
    Write-Host $migrateResult
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Database Name: $dbName" -ForegroundColor White
Write-Host "  Database User: $dbUser" -ForegroundColor White
Write-Host "  Connection: OK" -ForegroundColor Green
Write-Host "  Tables: Created" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Yellow
Write-Host "    1. Run: .\start.ps1 (to start the application)" -ForegroundColor Cyan
Write-Host "    2. Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "    3. Register a new school to begin" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot
