#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WebAssembly Image Processing API Setup ===${NC}"
echo -e "${BLUE}This script will help you set up the project environment${NC}"
echo

# Check if Emscripten is installed
echo -e "${YELLOW}Checking for Emscripten...${NC}"
if command -v emcc &> /dev/null; then
    echo -e "${GREEN}✓ Emscripten found!${NC}"
    emcc --version | head -n 1
else
    echo -e "${RED}✗ Emscripten not found!${NC}"
    echo -e "${YELLOW}Please install Emscripten following these steps:${NC}"
    echo
    echo "1. Clone the Emscripten repository:"
    echo "   git clone https://github.com/emscripten-core/emsdk.git"
    echo
    echo "2. Enter the directory and install the latest SDK:"
    echo "   cd emsdk"
    echo "   ./emsdk install latest"
    echo
    echo "3. Activate the latest SDK:"
    echo "   ./emsdk activate latest"
    echo
    echo "4. Set up the environment variables (add this to your shell profile):"
    echo "   source ./emsdk_env.sh"
    echo
    echo -e "${YELLOW}After installing Emscripten, run this setup script again.${NC}"
    exit 1
fi

# Install Node.js dependencies
echo
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies.${NC}"
    exit 1
fi

# Build WebAssembly module
echo
echo -e "${YELLOW}Building WebAssembly module...${NC}"
cd src/wasm
chmod +x build.sh
./build.sh
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ WebAssembly module built successfully!${NC}"
else
    echo -e "${RED}✗ Failed to build WebAssembly module.${NC}"
    exit 1
fi
cd ../..

# Create required directories
echo
echo -e "${YELLOW}Creating required directories...${NC}"
mkdir -p uploads logs
echo -e "${GREEN}✓ Directories created!${NC}"

# Final instructions
echo
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "${YELLOW}You can now start the server with:${NC}"
echo "  npm start"
echo
echo -e "${YELLOW}To test the API, open:${NC}"
echo "  http://localhost:3000"
echo
echo -e "${YELLOW}API documentation is available at:${NC}"
echo "  http://localhost:3000/api-docs"
echo
echo -e "${YELLOW}Run performance benchmarks at:${NC}"
echo "  http://localhost:3000/benchmark.html"
echo
echo -e "${BLUE}Happy coding!${NC}"
