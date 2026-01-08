# Script untuk build frontend untuk shared hosting
# Script ini akan build Next.js sebagai static files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Frontend untuk Shared Hosting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah Node.js terinstall
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js ditemukan: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js tidak ditemukan!" -ForegroundColor Red
    Write-Host "  Silakan install Node.js 20+ terlebih dahulu" -ForegroundColor Yellow
    exit 1
}

# Masuk ke direktori frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "✗ Folder frontend tidak ditemukan!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath
Write-Host "✓ Masuk ke direktori frontend" -ForegroundColor Green

# Cek apakah node_modules ada
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Gagal install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies terinstall" -ForegroundColor Green
}

# Cek file .env.local
$envLocalPath = Join-Path $frontendPath ".env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Host ""
    Write-Host "File .env.local tidak ditemukan!" -ForegroundColor Yellow
    $apiUrl = Read-Host "Masukkan URL API backend (contoh: https://yourdomain.com/api)"
    
    if ([string]::IsNullOrWhiteSpace($apiUrl)) {
        Write-Host "✗ URL API tidak boleh kosong!" -ForegroundColor Red
        exit 1
    }
    
    "NEXT_PUBLIC_API_URL=$apiUrl" | Out-File -FilePath $envLocalPath -Encoding utf8
    Write-Host "✓ File .env.local dibuat" -ForegroundColor Green
} else {
    Write-Host "✓ File .env.local ditemukan" -ForegroundColor Green
    Write-Host "  Pastikan NEXT_PUBLIC_API_URL sudah benar!" -ForegroundColor Yellow
}

# Build dan export
Write-Host ""
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run export

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build gagal!" -ForegroundColor Red
    exit 1
}

# Cek apakah folder out ada
$outPath = Join-Path $frontendPath "out"
if (Test-Path $outPath) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Build berhasil!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "File static ada di: $outPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Langkah selanjutnya:" -ForegroundColor Yellow
    Write-Host "1. Upload semua isi folder 'out' ke shared hosting" -ForegroundColor White
    Write-Host "2. Pastikan file .htaccess juga di-upload" -ForegroundColor White
    Write-Host "3. Sesuaikan konfigurasi backend Laravel" -ForegroundColor White
    Write-Host ""
    Write-Host "Lihat DEPLOY_SHARED_HOSTING.md untuk panduan lengkap" -ForegroundColor Cyan
} else {
    Write-Host "✗ Folder 'out' tidak ditemukan setelah build!" -ForegroundColor Red
    exit 1
}
