@echo off
title Tasket Development Environment

echo 🚀 Starting Tasket Development Environment...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo 🐳 Using Docker Compose...
        docker-compose up
        goto :eof
    )
)

echo 🖥️  Starting services locally...

REM Start backend in background
echo 🔧 Starting backend server...
cd tasket-backend
start "Backend Server" cmd /c "npm run dev ^> ../backend.log 2^>^&1"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd tasket
npm run dev

echo 🛑 Development environment stopped
pause