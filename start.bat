@echo off
echo ============================================
echo Starting KRS Backend Server
echo ============================================
echo.

REM Kill any existing node process on port 3000
echo [1/3] Checking for existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found process: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Done!
echo.

REM Start the server
echo [2/3] Starting backend server...
echo.
node src/server.js

pause
