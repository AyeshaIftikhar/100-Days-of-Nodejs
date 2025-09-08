#!/bin/bash

# This script compiles the WebAssembly module using Emscripten
# Make sure Emscripten is installed and activated in your environment

# Check if Emscripten is installed
if ! command -v emcc &> /dev/null; then
  echo "Emscripten SDK (emcc) is not installed or not in your PATH"
  echo "Please install and activate Emscripten first:"
  echo "https://emscripten.org/docs/getting_started/downloads.html"
  exit 1
fi

# Navigate to the wasm directory
cd "$(dirname "$0")"

# Compile the C code to WebAssembly
echo "Compiling image_processing.c to WebAssembly..."
emcc image_processing.c \
  -o image_processing.js \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_malloc", "_free", "_grayscale", "_blur", "_edgeDetection", "_adjustBrightness", "_resizeImage"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="ImageProcessingModule" \
  -s NO_EXIT_RUNTIME=1 \
  -O3

if [ $? -eq 0 ]; then
  echo "Compilation successful!"
  echo "Created image_processing.js and image_processing.wasm"
  
  # Copy to public directory
  mkdir -p ../../public/wasm
  cp image_processing.js image_processing.wasm ../../public/wasm/
  echo "Copied WebAssembly files to public/wasm directory"
else
  echo "Compilation failed!"
  exit 1
fi
