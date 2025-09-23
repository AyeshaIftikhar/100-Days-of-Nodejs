#!/bin/bash

# Cleanup script for Decentralized Charity Platform
echo "🧹 Cleaning up Decentralized Charity Platform..."

# Kill processes if PID files exist
if [ -f .hardhat.pid ]; then
    HARDHAT_PID=$(cat .hardhat.pid)
    if ps -p $HARDHAT_PID > /dev/null; then
        kill $HARDHAT_PID
        echo "✅ Stopped blockchain (PID: $HARDHAT_PID)"
    fi
    rm .hardhat.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        kill $FRONTEND_PID
        echo "✅ Stopped frontend server (PID: $FRONTEND_PID)"
    fi
    rm .frontend.pid
fi

# Find and kill any remaining processes
pkill -f "hardhat node"
pkill -f "vite"

echo "🧹 Cleanup complete!"
