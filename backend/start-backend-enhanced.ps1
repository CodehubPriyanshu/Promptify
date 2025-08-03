# Enhanced Promptify Backend Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Promptify Backend Server" -ForegroundColor Cyan
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
    Write-Host "Please run this script from the backend directory" -ForegroundColor Yellow
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
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "Please configure your .env file with proper values" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: .env.example file not found" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
}

# Display configuration
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "- Port: 8001 (with automatic fallback)" -ForegroundColor White
Write-Host "- Environment: development" -ForegroundColor White
Write-Host "- Frontend URL: http://localhost:8080" -ForegroundColor White
Write-Host ""

# Check port availability and handle conflicts
Write-Host "Checking port 8001 availability..." -ForegroundColor Yellow

try {
    npm run port:check
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Port 8001 is in use. Attempting to free it..." -ForegroundColor Yellow
        npm run port:kill
        if ($LASTEXITCODE -ne 0) {
            Write-Host "WARNING: Could not free port 8001" -ForegroundColor Yellow
            Write-Host "The server will automatically find an available port" -ForegroundColor Cyan
        } else {
            Write-Host "✅ Port 8001 has been freed" -ForegroundColor Green
        }
        Write-Host ""
    }
} catch {
    Write-Host "Port check failed, but continuing..." -ForegroundColor Yellow
}

# Start the server
Write-Host "Starting backend server with automatic port detection..." -ForegroundColor Green
Write-Host "The server will automatically find an available port if 8001 is busy" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "ERROR: Server failed to start" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick fixes:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run port:kill-all" -ForegroundColor White
    Write-Host "2. Try: npm run dev:clean" -ForegroundColor White
    Write-Host "3. Check your .env configuration" -ForegroundColor White
    Read-Host "Press Enter to exit"
}