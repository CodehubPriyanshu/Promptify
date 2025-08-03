@echo off
echo ========================================
echo Starting Promptify Frontend Application
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
    echo Please run this script from the frontend directory
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
    echo Creating .env file...
    echo # API Configuration > .env
    echo VITE_API_URL=http://localhost:8001/api >> .env
    echo. >> .env
    echo # App Configuration >> .env
    echo VITE_APP_NAME=Promptify >> .env
    echo VITE_APP_VERSION=1.0.0 >> .env
    echo .env file created with default configuration
    echo.
)

:: Display configuration
echo Configuration:
echo - Port: 8080
echo - API URL: http://localhost:8001/api
echo - App Name: Promptify
echo.

:: Run startup validation
echo Running startup validation...
npm run validate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Startup validation failed
    echo Please fix the issues above before starting the development server
    pause
    exit /b 1
)

:: Start the development server
echo.
echo Starting frontend development server...
echo The application will open in your browser automatically
echo Press Ctrl+C to stop the server
echo.
npm run dev

:: If the server stops, pause to show any error messages
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Development server failed to start
    echo Check the error messages above
    pause
)