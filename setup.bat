@echo off
REM VideoVault Development Setup Script for Windows

echo 🎬 Setting up VideoVault development environment...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11 or newer.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if FFmpeg is available
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FFmpeg is required for video processing.
    echo    Download from: https://ffmpeg.org/download.html
    echo    Or install via chocolatey: choco install ffmpeg
    pause
    exit /b 1
)

echo ✅ FFmpeg found

REM Setup backend
echo 📦 Setting up backend dependencies...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copy environment file
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
    echo 📝 Please edit backend\.env with your configuration
)

cd ..

REM Setup frontend
echo 📦 Setting up frontend dependencies...

REM Check if bun is available
bun --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Bun found
    bun install
) else (
    echo ⚠️  Bun not found, falling back to npm
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Neither bun nor npm found. Please install Node.js and npm or bun.
        pause
        exit /b 1
    )
    npm install
)

REM Copy environment file
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
)

echo.
echo 🎉 Setup complete!
echo.
echo To start development:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python main.py
echo.
echo Terminal 2 (Frontend):
echo   bun dev
echo   (or npm run dev if using npm)
echo.
echo 📖 Visit http://localhost:5173 for the frontend
echo 🔧 Visit http://localhost:8000/docs for API documentation
echo.
echo 📝 Don't forget to configure your .env files!
pause