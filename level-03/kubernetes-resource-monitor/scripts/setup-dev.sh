#!/bin/bash

# Development setup script for Kubernetes Resource Monitor
# This script sets up the development environment

set -e

echo "🛠️ Setting up development environment for Kubernetes Resource Monitor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) is installed"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker."
        exit 1
    fi
    
    log_success "Docker is available and running"
}

# Install backend dependencies
setup_backend() {
    log_info "Setting up backend dependencies..."
    cd backend
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log_info "Created .env file from .env.example"
        log_warning "Please update the .env file with your configuration"
    fi
    
    npm install
    log_success "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    log_info "Setting up frontend dependencies..."
    cd frontend
    npm install
    log_success "Frontend dependencies installed"
    cd ..
}

# Setup databases with Docker Compose
setup_databases() {
    log_info "Setting up databases with Docker Compose..."
    
    # Start only MongoDB and Redis for development
    docker-compose up -d mongodb redis
    
    log_info "Waiting for databases to start..."
    sleep 10
    
    # Check if MongoDB is ready
    docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null
    if [ $? -eq 0 ]; then
        log_success "MongoDB is ready"
    else
        log_warning "MongoDB might not be ready yet"
    fi
    
    # Check if Redis is ready
    docker-compose exec -T redis redis-cli -a password123 ping > /dev/null
    if [ $? -eq 0 ]; then
        log_success "Redis is ready"
    else
        log_warning "Redis might not be ready yet"
    fi
}

# Create development scripts
create_scripts() {
    log_info "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# Start development environment

echo "🚀 Starting Kubernetes Resource Monitor in development mode..."

# Start databases
docker-compose up -d mongodb redis

# Wait a bit for databases to start
sleep 5

# Start backend in development mode (in background)
echo "📡 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend in development mode
echo "🎨 Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment is starting up!"
echo "📊 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "📄 API Health: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose stop
    exit 0
}

# Set trap to cleanup on exit
trap cleanup INT TERM

# Wait for processes
wait
EOF

    chmod +x start-dev.sh
    
    # Create stop script
    cat > stop-dev.sh << 'EOF'
#!/bin/bash
# Stop development environment

echo "🛑 Stopping Kubernetes Resource Monitor development environment..."

# Kill Node.js processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Stop Docker containers
docker-compose down

echo "✅ Development environment stopped"
EOF

    chmod +x stop-dev.sh
    
    log_success "Development scripts created"
}

# Main setup function
main() {
    log_info "Kubernetes Resource Monitor - Development Setup"
    log_info "=============================================="
    
    # Check prerequisites
    check_node
    check_docker
    
    # Setup components
    setup_backend
    setup_frontend
    setup_databases
    create_scripts
    
    echo ""
    log_success "Development environment setup completed!"
    echo ""
    log_info "Next steps:"
    echo "1. Update backend/.env with your configuration"
    echo "2. Run './start-dev.sh' to start the development environment"
    echo "3. Access the application at http://localhost:5173"
    echo "4. Default admin credentials: admin@example.com / password123"
    echo ""
    log_info "Useful commands:"
    echo "• ./start-dev.sh  - Start all services"
    echo "• ./stop-dev.sh   - Stop all services"
    echo "• docker-compose logs -f - View database logs"
    echo ""
}

# Run the script
main "$@"
