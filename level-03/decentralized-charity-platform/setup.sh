#!/bin/bash

# Decentralized Charity Platform Setup Script
echo "🚀 Setting up Decentralized Charity Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install contracts dependencies
echo "📦 Installing smart contract dependencies..."
cd contracts
npm install
echo "✅ Smart contract dependencies installed"

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile
echo "✅ Smart contracts compiled"

# Run tests
echo "🧪 Running smart contract tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before proceeding."
    exit 1
fi
echo "✅ All tests passed"

# Start local blockchain in background
echo "⛓️ Starting local blockchain..."
npx hardhat node --hostname 0.0.0.0 &
HARDHAT_PID=$!
echo "✅ Local blockchain started (PID: $HARDHAT_PID)"

# Wait for blockchain to be ready
sleep 5

# Deploy contracts
echo "🚀 Deploying smart contracts..."
npx hardhat run scripts/deploy-and-update.js --network localhost
echo "✅ Smart contracts deployed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Build frontend
echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built"

# Start development server
echo "🌐 Starting development server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend development server started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Quick Start Guide:"
echo "1. Open your browser and go to http://localhost:5173"
echo "2. Install MetaMask browser extension if you haven't already"
echo "3. Connect MetaMask to localhost:8545 network"
echo "4. Import one of the test accounts from Hardhat"
echo "5. Start donating to charities!"
echo ""
echo "🔧 Useful Commands:"
echo "  - Stop blockchain: kill $HARDHAT_PID"
echo "  - Stop frontend: kill $FRONTEND_PID"
echo "  - View logs: docker logs charity-platform"
echo ""
echo "📚 Documentation:"
echo "  - Smart Contracts: http://localhost:5173/docs/contracts"
echo "  - API Reference: http://localhost:5173/docs/api"
echo "  - User Guide: http://localhost:5173/docs/guide"
echo ""

# Save PIDs for cleanup
echo "$HARDHAT_PID" > .hardhat.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "🎯 Ready to revolutionize charitable giving with blockchain!"
