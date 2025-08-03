@echo off
echo ========================================
echo Starting Promptify Backend Server
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Display Node.js version
echo Node.js version:
node --version
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Creating .env from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo Please configure your .env file with proper values
    ) else (
        echo ERROR: .env.example file not found
        pause
        exit /b 1
    )
    echo.
)

:: Display configuration
echo Configuration:
echo - Port: 8001 (with automatic fallback)
echo - Environment: development
echo - Frontend URL: http://localhost:8080
echo.

:: Check port availability and kill conflicting processes
echo Checking port 8001 availability...
npm run port:check
if %errorlevel% neq 0 (
    echo.
    echo Port 8001 is in use. Attempting to free it...
    npm run port:kill
    if %errorlevel% neq 0 (
        echo WARNING: Could not free port 8001
        echo The server will automatically find an available port
    ) else (
        echo Port 8001 has been freed
    )
    echo.
)

:: Start the server
echo Starting backend server with automatic port detection...
echo The server will automatically find an available port if 8001 is busy
echo Press Ctrl+C to stop the server
echo.
npm run dev

:: If the server stops, pause to show any error messages
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start
    echo Check the error messages above
    echo.
    echo Quick fixes:
    echo 1. Run: npm run port:kill-all
    echo 2. Try: npm run dev:clean
    echo 3. Check your .env configuration
    pause
)