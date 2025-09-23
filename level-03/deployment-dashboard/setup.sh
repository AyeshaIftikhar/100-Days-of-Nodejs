#!/bin/bash

# Deployment Dashboard Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Deployment Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

cd ../

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📄 Creating frontend .env.local file..."
    cp .env.example .env.local || touch .env.local
    echo "VITE_API_URL=http://localhost:3001/api" >> .env.local
    echo "VITE_WS_URL=http://localhost:3001" >> .env.local
fi

cd ../

# Create data directory for database
echo "📁 Creating data directory..."
mkdir -p backend/data

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both frontend and backend in development mode"
echo "  npm run build        - Build both applications for production"
echo "  npm run test         - Run all tests"
echo "  npm run lint         - Run linting on all code"
echo "  npm run docker:up    - Start with Docker Compose"
echo ""
echo "For more information, see README.md"
