#!/bin/bash

# Kubernetes Resource Monitor - Deploy Script
# This script deploys the application to a Kubernetes cluster

set -e

echo "🚀 Starting deployment of Kubernetes Resource Monitor..."

# Configuration
NAMESPACE="resource-monitor"
APP_VERSION="1.0.0"
REGISTRY="your-registry.com" # Change this to your Docker registry

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

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "kubectl is available and connected to cluster"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t resource-monitor-backend:${APP_VERSION} ./backend/
    docker tag resource-monitor-backend:${APP_VERSION} resource-monitor-backend:latest
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t resource-monitor-frontend:${APP_VERSION} ./frontend/
    docker tag resource-monitor-frontend:${APP_VERSION} resource-monitor-frontend:latest
    
    log_success "Docker images built successfully"
}

# Push images to registry (optional)
push_images() {
    if [ "$PUSH_TO_REGISTRY" = "true" ]; then
        log_info "Pushing images to registry..."
        
        docker tag resource-monitor-backend:${APP_VERSION} ${REGISTRY}/resource-monitor-backend:${APP_VERSION}
        docker tag resource-monitor-frontend:${APP_VERSION} ${REGISTRY}/resource-monitor-frontend:${APP_VERSION}
        
        docker push ${REGISTRY}/resource-monitor-backend:${APP_VERSION}
        docker push ${REGISTRY}/resource-monitor-frontend:${APP_VERSION}
        
        log_success "Images pushed to registry"
    fi
}

# Deploy to Kubernetes
deploy_k8s() {
    log_info "Deploying to Kubernetes..."
    
    # Apply manifests in order
    kubectl apply -f k8s/00-namespace-config.yaml
    log_info "Namespace and configuration applied"
    
    kubectl apply -f k8s/01-mongodb.yaml
    log_info "MongoDB deployed"
    
    kubectl apply -f k8s/02-redis.yaml
    log_info "Redis deployed"
    
    # Wait for databases to be ready
    log_info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n ${NAMESPACE} --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s
    
    kubectl apply -f k8s/03-backend.yaml
    log_info "Backend deployed"
    
    # Wait for backend to be ready
    log_info "Waiting for backend to be ready..."
    kubectl wait --for=condition=ready pod -l app=backend -n ${NAMESPACE} --timeout=300s
    
    kubectl apply -f k8s/04-frontend.yaml
    log_info "Frontend deployed"
    
    kubectl apply -f k8s/05-autoscaling.yaml
    log_info "Autoscaling configured"
    
    kubectl apply -f k8s/06-network-policies.yaml
    log_info "Network policies applied"
    
    log_success "All components deployed successfully"
}

# Check deployment status
check_status() {
    log_info "Checking deployment status..."
    
    echo ""
    log_info "Pods status:"
    kubectl get pods -n ${NAMESPACE}
    
    echo ""
    log_info "Services status:"
    kubectl get services -n ${NAMESPACE}
    
    echo ""
    log_info "Ingress status:"
    kubectl get ingress -n ${NAMESPACE}
    
    echo ""
    log_info "HPA status:"
    kubectl get hpa -n ${NAMESPACE}
}

# Main deployment flow
main() {
    log_info "Kubernetes Resource Monitor Deployment Script"
    log_info "============================================="
    
    # Parse command line arguments
    PUSH_TO_REGISTRY=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --push)
                PUSH_TO_REGISTRY=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --registry)
                REGISTRY="$2"
                shift 2
                ;;
            --version)
                APP_VERSION="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --push              Push images to registry"
                echo "  --skip-build        Skip building Docker images"
                echo "  --registry REGISTRY Set Docker registry"
                echo "  --version VERSION   Set application version"
                echo "  -h, --help         Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option $1"
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_kubectl
    
    # Build images if not skipped
    if [ "$SKIP_BUILD" != "true" ]; then
        build_images
        push_images
    fi
    
    # Deploy to Kubernetes
    deploy_k8s
    
    # Check status
    check_status
    
    echo ""
    log_success "Deployment completed successfully!"
    log_info "You can access the application at: http://resource-monitor.local"
    log_info "Add '127.0.0.1 resource-monitor.local' to your /etc/hosts file"
    log_info "Default admin credentials: admin@example.com / password123"
}

# Run the script
main "$@"
