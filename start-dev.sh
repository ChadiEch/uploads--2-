#!/bin/bash

# Tasket Development Startup Script

echo "🚀 Starting Tasket Development Environment..."

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null
then
    echo "🐳 Using Docker Compose..."
    docker-compose up
else
    echo "🖥️  Starting services locally..."
    
    # Start backend in background
    echo "🔧 Starting backend server..."
    cd tasket-backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    echo "🎨 Starting frontend server..."
    cd tasket
    npm run dev
    
    # Cleanup when frontend stops
    kill $BACKEND_PID 2>/dev/null
    echo "🛑 Development environment stopped"
fi