#!/bin/bash

# VideoVault Development Setup Script

set -e

echo "🎬 Setting up VideoVault development environment..."

# Check if Python 3.11+ is installed
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
required_version="3.11"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or newer."
    exit 1
fi

# Check Python version
if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then 
    echo "❌ Python $python_version is installed, but version $required_version or newer is required."
    exit 1
fi

echo "✅ Python $python_version found"

# Check if Docker is installed and running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "✅ Docker is available"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not available - will run services locally"
    DOCKER_AVAILABLE=false
fi

# Check if Redis is available
if command -v redis-server &> /dev/null; then
    echo "✅ Redis server found"
    REDIS_AVAILABLE=true
else
    echo "⚠️  Redis not found - will use in-memory storage"
    REDIS_AVAILABLE=false
fi

# Check if FFmpeg is available
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg found"
else
    echo "❌ FFmpeg is required for video processing. Please install FFmpeg:"
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Setup backend
echo "📦 Setting up backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "📝 Please edit backend/.env with your configuration"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend dependencies..."

# Check if bun is available
if command -v bun &> /dev/null; then
    echo "✅ Bun found"
    bun install
else
    echo "⚠️  Bun not found, falling back to npm"
    if command -v npm &> /dev/null; then
        npm install
    else
        echo "❌ Neither bun nor npm found. Please install Node.js and npm or bun."
        exit 1
    fi
fi

# Copy environment file
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Option 1 - Using Docker (recommended):"
    echo "  docker-compose up"
    echo ""
fi

echo "Option 2 - Manual startup:"
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    source venv/bin/activate"
if [ "$REDIS_AVAILABLE" = true ]; then
    echo "    redis-server &  # Start Redis in background"
fi
echo "    python main.py"
echo ""
echo "  Terminal 2 (Frontend):"
if command -v bun &> /dev/null; then
    echo "    bun dev"
else
    echo "    npm run dev"
fi
echo ""
echo "📖 Visit http://localhost:5173 for the frontend"
echo "🔧 Visit http://localhost:8000/docs for API documentation"
echo ""
echo "📝 Don't forget to configure your .env files!"