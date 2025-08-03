@echo off
echo ========================================
echo Promptify - Full Stack Application
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

echo Node.js version:
node --version
echo.

echo Choose an option:
echo 1. Start Backend Only (Port 8001)
echo 2. Start Frontend Only (Port 8080)
echo 3. Start Both Backend and Frontend
echo 4. Install Dependencies for Both
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto install
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
pause
goto start

:backend
echo.
echo Starting Backend Server...
cd backend
call start-backend.bat
goto end

:frontend
echo.
echo Starting Frontend Application...
cd frontend
call start-frontend.bat
goto end

:both
echo.
echo Starting Both Backend and Frontend...
echo.
echo Opening Backend in new window...
start "Promptify Backend" cmd /k "cd backend && start-backend.bat"
echo.
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul
echo.
echo Opening Frontend in new window...
start "Promptify Frontend" cmd /k "cd frontend && start-frontend.bat"
echo.
echo Both servers are starting in separate windows.
echo - Backend: http://localhost:8001
echo - Frontend: http://localhost:8080
echo.
echo Close this window or press any key to continue...
pause >nul
goto end

:install
echo.
echo Installing dependencies for both Backend and Frontend...
echo.
echo Installing Backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    goto end
)
echo Backend dependencies installed successfully!
echo.
cd ..
echo Installing Frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    goto end
)
echo Frontend dependencies installed successfully!
echo.
echo All dependencies installed successfully!
pause
goto end

:exit
echo Goodbye!
goto end

:end