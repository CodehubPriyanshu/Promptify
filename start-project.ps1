# Promptify - Full Stack Application Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Promptify - Full Stack Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "1. Start Backend Only (Port 8001)" -ForegroundColor White
Write-Host "2. Start Frontend Only (Port 8080)" -ForegroundColor White
Write-Host "3. Start Both Backend and Frontend" -ForegroundColor White
Write-Host "4. Install Dependencies for Both" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting Backend Server..." -ForegroundColor Green
        Set-Location "backend"
        .\start-backend.ps1
    }
    "2" {
        Write-Host ""
        Write-Host "Starting Frontend Application..." -ForegroundColor Green
        Set-Location "frontend"
        .\start-frontend.ps1
    }
    "3" {
        Write-Host ""
        Write-Host "Starting Both Backend and Frontend..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Opening Backend in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\start-backend.ps1"
        Write-Host ""
        Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        Write-Host ""
        Write-Host "Opening Frontend in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; .\start-frontend.ps1"
        Write-Host ""
        Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
        Write-Host "- Backend: http://localhost:8001" -ForegroundColor Cyan
        Write-Host "- Frontend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "4" {
        Write-Host ""
        Write-Host "Installing dependencies for both Backend and Frontend..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Installing Backend dependencies..." -ForegroundColor Yellow
        Set-Location "backend"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
        Set-Location ".."
        Write-Host "Installing Frontend dependencies..." -ForegroundColor Yellow
        Set-Location "frontend"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "All dependencies installed successfully!" -ForegroundColor Green
        Read-Host "Press Enter to continue"
    }
    "5" {
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}