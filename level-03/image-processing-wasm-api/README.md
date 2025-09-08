# WebAssembly-Powered Image Processing API

A high-performance image processing API built with Node.js and WebAssembly. This project demonstrates how to leverage WebAssembly's near-native performance for computationally intensive tasks like image processing.

## 📋 Features

- **High-Performance Processing**: Utilizes WebAssembly for fast image transformations
- **Multiple Operations**: Supports grayscale, blur, edge detection, brightness adjustment, and image resizing
- **Graceful Fallback**: Falls back to JavaScript implementation if WebAssembly is unavailable
- **RESTful API**: Clean API design with proper error handling and validation
- **Interactive UI**: Browser-based demo for testing the API
- **API Documentation**: Swagger UI documentation for easy exploration
- **Performance Benchmarking**: Compare WebAssembly vs JavaScript processing times
- **Dockerized**: Easy deployment with Docker and Docker Compose
- **Comprehensive Logging**: Structured logging for easier debugging
- **Rate Limiting**: Protects the API from abuse

## 🧰 Tech Stack

- **Node.js**: Server-side JavaScript runtime
- **Express**: Web framework for Node.js
- **WebAssembly**: Binary instruction format for high-performance code execution
- **Emscripten**: Toolchain for compiling C/C++ to WebAssembly
- **Sharp**: Image processing library for Node.js (used as fallback)
- **Multer**: Middleware for handling file uploads
- **Swagger**: API documentation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Emscripten SDK (for building WebAssembly modules)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd image-processing-wasm-api
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   This script will:
   - Check if Emscripten is installed
   - Install Node.js dependencies
   - Build the WebAssembly module
   - Create required directories

3. If you prefer manual setup, follow these steps:
   ```bash
   # Install dependencies
   npm install
   
   # Build WebAssembly module
   cd src/wasm
   chmod +x build.sh
   ./build.sh
   cd ../..
   
   # Create required directories
   mkdir -p uploads logs
   ```

4. Create a `.env` file in the project root:
   ```
   PORT=3000
   NODE_ENV=development
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. API documentation is available at `http://localhost:3000/api-docs`

## 📝 API Endpoints

### Get Available Operations

```
GET /api/images/operations
```

Returns a list of all available image processing operations and their parameters.

### Process Image

```
POST /api/images/:operation
```

Upload an image and apply the specified processing operation.

**Path Parameters:**
- `operation`: The operation to perform (grayscale, blur, edge-detection, brightness, resize)

**Query Parameters:**
- Depends on the operation selected (see API docs for details)

**Request Body:**
- `image`: The image file to process (multipart/form-data)

### Run Performance Benchmark

```
POST /api/benchmark
```

Upload an image and run performance benchmarks comparing WebAssembly vs JavaScript implementations.

**Query Parameters:**
- `iterations`: Number of iterations to run (default: 5, max: 20)

**Request Body:**
- `image`: The image file to use for benchmarking (multipart/form-data)

## 🏗️ Project Structure

```
image-processing-wasm-api/
├── public/                # Static files
│   ├── index.html         # Web demo UI
│   ├── benchmark.html     # Performance benchmark UI
│   └── wasm/              # Compiled WebAssembly files
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── imageController.js
│   │   └── benchmarkController.js
│   ├── middleware/        # Express middleware
│   │   └── errorHandler.js
│   ├── routes/            # API routes
│   │   ├── imageRoutes.js
│   │   └── benchmarkRoutes.js
│   ├── services/          # Business logic
│   │   ├── imageService.js
│   │   ├── benchmarkService.js
│   │   └── loggerService.js
│   ├── wasm/              # WebAssembly source files
│   │   ├── image_processing.c    # C implementation of image operations
│   │   ├── CMakeLists.txt        # CMake configuration
│   │   └── build.sh              # Build script
│   └── server.js          # Express application setup
├── test/                  # Test files
│   └── imageService.test.js
├── logs/                  # Application logs
├── uploads/               # Uploaded and processed images
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── setup.sh               # Setup script
└── package.json           # Project dependencies
```

## 💡 How It Works

1. **Server-Side Processing**:
   - Images are uploaded to the server
   - WebAssembly modules process the image data
   - Processed images are saved and returned

2. **WebAssembly Integration**:
   - C code is compiled to WebAssembly using Emscripten
   - Node.js loads and interacts with the WebAssembly module
   - Image data is passed between Node.js and WebAssembly

3. **Performance Benefits**:
   - WebAssembly executes at near-native speed
   - Computationally intensive operations run faster than pure JavaScript
   - Memory management is optimized for image processing

## 🔧 WebAssembly Operations

The C code implements several image processing algorithms:

- **Grayscale**: Converts color images to grayscale
- **Blur**: Applies a box blur with configurable radius
- **Edge Detection**: Implements Sobel edge detection algorithm
- **Brightness Adjustment**: Modifies pixel brightness values
- **Image Resizing**: Scales images to new dimensions

## 🧪 Testing

Run tests with Jest:

```bash
npm test
```

## 🔍 Future Enhancements

1. **Additional Operations**:
   - Add more image processing operations like color filters, rotation, etc.
   - Implement more advanced algorithms like Gaussian blur and advanced edge detection

2. **Performance Optimizations**:
   - Optimize memory usage in WebAssembly module
   - Implement multi-threading using Web Workers and WebAssembly threads
   - Add SIMD instructions for parallel processing

3. **Feature Enhancements**:
   - Add image format conversion (PNG, JPEG, WebP, etc.)
   - Support for batch processing multiple images
   - Create operation pipelines (apply multiple operations in sequence)

4. **Deployment Improvements**:
   - Containerize the application with Docker
   - Add cloud storage integration (AWS S3, Google Cloud Storage)
   - Implement caching for frequently requested operations

5. **User Experience**:
   - Enhance the web UI with more features and better visualization
   - Add user accounts and saved transformations
   - Implement client-side WebAssembly processing for reduced server load

6. **API Enhancements**:
   - Add versioning to the API
   - Implement more comprehensive authentication and authorization
   - Add rate limiting and usage quotas

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- The Emscripten team for their WebAssembly toolchain
- The Node.js and Express communities
- Contributors to the Sharp image processing library
