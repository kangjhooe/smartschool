# Script untuk menghentikan SmartSchool Application

Write-Host "Stopping SmartSchool Application..." -ForegroundColor Yellow

# Stop Laravel server (port 8000)
$laravelProcess = Get-Process | Where-Object { $_.CommandLine -like "*php artisan serve*" -or ($_.ProcessName -eq "php" -and $_.MainWindowTitle -like "*artisan*") }
if ($laravelProcess) {
    $laravelProcess | Stop-Process -Force
    Write-Host "  ✓ Laravel server stopped" -ForegroundColor Green
}

# Stop Node.js/Next.js server (port 3000)
$nodeProcess = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*next*" }
if ($nodeProcess) {
    $nodeProcess | Stop-Process -Force
    Write-Host "  ✓ Next.js server stopped" -ForegroundColor Green
}

# Alternative: Kill processes on specific ports
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    $pid = $port8000.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Process on port 8000 stopped" -ForegroundColor Green
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pid = $port3000.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Process on port 3000 stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "All servers stopped!" -ForegroundColor Green
