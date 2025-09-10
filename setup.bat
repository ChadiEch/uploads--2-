@echo off
title Tasket Setup

echo 🚀 Setting up Tasket Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not installed. You can still run the app locally.
) else (
    echo ✅ Docker is installed
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd tasket
call npm install
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd tasket-backend
call npm install
cd ..

REM Create .env files if they don't exist
if not exist "tasket\.env" (
    echo 📄 Creating frontend .env file...
    echo VITE_API_BASE_URL=http://localhost:5002/api > tasket\.env
    echo VITE_WS_BASE_URL=http://localhost:5002 >> tasket\.env
)

if not exist "tasket-backend\.env" (
    echo 📄 Creating backend .env file...
    echo PORT=5002 > tasket-backend\.env
    echo DB_HOST=localhost >> tasket-backend\.env
    echo DB_PORT=5432 >> tasket-backend\.env
    echo DB_NAME=tasket >> tasket-backend\.env
    echo DB_USER=postgres >> tasket-backend\.env
    echo DB_PASSWORD=postgres >> tasket-backend\.env
    echo JWT_SECRET=tasket_jwt_secret_here >> tasket-backend\.env
    echo FRONTEND_URL=http://localhost:3000 >> tasket-backend\.env
)

echo ✅ Setup completed!
echo.
echo To start the development environment, you have two options:
echo.
echo Option 1 - Using Docker (recommended):
echo   docker-compose up
echo.
echo Option 2 - Running locally:
echo   Terminal 1: cd tasket-backend && npm run dev
echo   Terminal 2: cd tasket && npm run dev
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5002
echo.
echo Default admin credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
pause