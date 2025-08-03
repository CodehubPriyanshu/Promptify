# Promptify Health Check Script
Write-Host "🔍 Promptify Health Check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js: Not installed or not in PATH" -ForegroundColor Red
}

# Check if backend is running
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 5
    Write-Host "✅ Backend: Running on port 8001" -ForegroundColor Green
    Write-Host "   Status: $($backendResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend: Not running on port 8001" -ForegroundColor Red
}

# Check if frontend is accessible
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Running on port 8080" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend: Responding but with status $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend: Not running on port 8080" -ForegroundColor Red
}

# Check backend dependencies
Write-Host ""
Write-Host "Backend Dependencies:" -ForegroundColor Cyan
if (Test-Path "backend/node_modules") {
    Write-Host "✅ Backend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend node_modules missing" -ForegroundColor Red
}

if (Test-Path "backend/.env") {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env file missing" -ForegroundColor Red
}

# Check frontend dependencies
Write-Host ""
Write-Host "Frontend Dependencies:" -ForegroundColor Cyan
if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Frontend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend node_modules missing" -ForegroundColor Red
}

if (Test-Path "frontend/.env") {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Quick Actions:" -ForegroundColor Yellow
Write-Host "- To start both services: .\start-project.ps1" -ForegroundColor White
Write-Host "- To install dependencies: .\start-project.ps1 (option 4)" -ForegroundColor White
Write-Host "- To check backend only: cd backend && .\start-backend.ps1" -ForegroundColor White
Write-Host "- To check frontend only: cd frontend && .\start-frontend.ps1" -ForegroundColor White

Write-Host ""
Read-Host "Press Enter to exit"