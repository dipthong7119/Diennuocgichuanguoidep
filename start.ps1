# ============================================================
# start.ps1 — Chay toan bo project (Frontend build + Backend)
# Chi can: .\start.ps1
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$FRONTEND = Join-Path $ROOT "frontend"
$STATIC   = Join-Path $ROOT "static"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HE THONG QUAN LY HOA DON DIEN NUOC  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Cai npm packages neu chua co
if (-not (Test-Path (Join-Path $FRONTEND "node_modules"))) {
    Write-Host "[1/3] Cai dat npm packages..." -ForegroundColor Yellow
    Set-Location $FRONTEND
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "LOI: npm install that bai!" -ForegroundColor Red; exit 1 }
} else {
    Write-Host "[1/3] node_modules da co san, bo qua cai dat." -ForegroundColor Green
}

# Buoc 2: Build Frontend
Write-Host ""
Write-Host "[2/3] Build Frontend (React -> static files)..." -ForegroundColor Yellow
Set-Location $FRONTEND
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "LOI: npm run build that bai!" -ForegroundColor Red; exit 1 }

# Buoc 3: Copy dist -> static
Write-Host ""
Write-Host "[3/3] Copy frontend vao thu muc static/..." -ForegroundColor Yellow

if (Test-Path $STATIC) { Remove-Item $STATIC -Recurse -Force }
New-Item -ItemType Directory -Path $STATIC | Out-Null

$DIST = Join-Path $FRONTEND "dist"
Copy-Item -Path "$DIST\*" -Destination $STATIC -Recurse -Force
Write-Host "     Da copy thanh cong!" -ForegroundColor Green

# Khoi dong Backend
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG BACKEND (FastAPI)           " -ForegroundColor Cyan
Write-Host "  UI  : http://localhost:8000            " -ForegroundColor Green
Write-Host "  API : http://localhost:8000/docs       " -ForegroundColor Green
Write-Host "  Nhan Ctrl+C de dung server             " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
