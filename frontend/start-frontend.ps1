# Promptify Frontend Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Promptify Frontend Application" -ForegroundColor Cyan
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

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
# API Configuration
VITE_API_URL=http://localhost:8001/api

# App Configuration
VITE_APP_NAME=Promptify
VITE_APP_VERSION=1.0.0
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created with default configuration" -ForegroundColor Green
    Write-Host ""
}

# Display configuration
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "- Port: 8080" -ForegroundColor White
Write-Host "- API URL: http://localhost:8001/api" -ForegroundColor White
Write-Host "- App Name: Promptify" -ForegroundColor White
Write-Host ""

# Start the development server
Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "The application will open in your browser automatically" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "ERROR: Development server failed to start" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}