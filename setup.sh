#!/bin/bash

# Tasket Setup Script

echo "🚀 Setting up Tasket Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "⚠️  Docker is not installed. You can still run the app locally."
else
    echo "✅ Docker is installed"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd tasket
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd tasket-backend
npm install
cd ..

# Create .env files if they don't exist
if [ ! -f "tasket/.env" ]; then
    echo "📄 Creating frontend .env file..."
    cat > tasket/.env << EOF
VITE_API_BASE_URL=http://localhost:5002/api
VITE_WS_BASE_URL=http://localhost:5002
EOF
fi

if [ ! -f "tasket-backend/.env" ]; then
    echo "📄 Creating backend .env file..."
    cat > tasket-backend/.env << EOF
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tasket
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=tasket_jwt_secret_here
FRONTEND_URL=http://localhost:3000
EOF
fi

echo "✅ Setup completed!"
echo ""
echo "To start the development environment, you have two options:"
echo ""
echo "Option 1 - Using Docker (recommended):"
echo "  docker-compose up"
echo ""
echo "Option 2 - Running locally:"
echo "  Terminal 1: cd tasket-backend && npm run dev"
echo "  Terminal 2: cd tasket && npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5002"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"