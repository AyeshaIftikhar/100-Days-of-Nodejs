# Kubernetes Resource Monitor

A comprehensive real-time infrastructure monitoring dashboard built with Node.js, React, and Kubernetes. This application provides real-time monitoring of server resources, alerting capabilities, and a modern web interface for DevOps teams.

![Kubernetes Resource Monitor](./docs/dashboard-preview.png)

## 🌟 Features

### Core Functionality
- **Real-time Monitoring**: Live CPU, memory, disk, and network metrics
- **Multi-Environment Support**: Development, staging, and production environments
- **Alert System**: Configurable thresholds with real-time notifications
- **User Authentication**: JWT-based authentication with role-based access control
- **WebSocket Integration**: Real-time updates without page refresh
- **Historical Data**: Time-series data with customizable time ranges
- **Responsive Design**: Mobile-friendly interface with dark/light themes

### Technical Features
- **Kubernetes Native**: Designed for Kubernetes deployment with auto-scaling
- **High Availability**: Load balancing, health checks, and failover support
- **Security**: Network policies, encrypted secrets, and secure communications
- **Performance**: Redis caching, database optimization, and efficient queries
- **Observability**: Comprehensive logging, metrics, and health monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Node.js API   │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • Metrics       │
│ • Real-time UI  │    │ • WebSockets    │    │ • Users         │
│ • Charts        │    │ • Authentication│    │ • Servers       │
│ • Alerts        │    │ • Monitoring    │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │                 │
                       │ • Sessions      │
                       │ • Real-time     │
                       │ • Caching       │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18 or higher
- **Docker**: For containerization and local development
- **Kubernetes**: For production deployment (minikube for local testing)
- **Git**: For version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kubernetes-resource-monitor
   ```

2. **Run the development setup script**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Start the development environment**
   ```bash
   ./start-dev.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Default credentials: `admin@example.com` / `password123`

### Docker Compose (Local Testing)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

1. **Build and deploy**
   ```bash
   ./scripts/deploy.sh
   ```

2. **Access the application**
   ```bash
   # Add to /etc/hosts
   echo "127.0.0.1 resource-monitor.local" >> /etc/hosts
   
   # Access at: http://resource-monitor.local
   ```

## 📁 Project Structure

```
kubernetes-resource-monitor/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── Dockerfile          # Backend container
│   └── package.json        # Dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # State management
│   │   └── utils/          # Frontend utilities
│   ├── Dockerfile          # Frontend container
│   └── package.json        # Dependencies
├── k8s/                    # Kubernetes manifests
│   ├── 00-namespace-config.yaml
│   ├── 01-mongodb.yaml
│   ├── 02-redis.yaml
│   ├── 03-backend.yaml
│   ├── 04-frontend.yaml
│   ├── 05-autoscaling.yaml
│   └── 06-network-policies.yaml
├── scripts/                # Deployment and setup scripts
│   ├── deploy.sh          # Kubernetes deployment
│   ├── setup-dev.sh       # Development setup
│   └── init-mongo.js      # Database initialization
├── docker-compose.yml     # Local development
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# Server
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/resource-monitor
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Monitoring
METRICS_COLLECTION_INTERVAL=5000
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90
```

#### Frontend Configuration
```typescript
// API endpoint configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:3001';
```

### Kubernetes Configuration

The application uses Kubernetes ConfigMaps and Secrets for configuration management:

- **ConfigMaps**: Non-sensitive configuration
- **Secrets**: JWT secrets, database passwords
- **Network Policies**: Secure inter-pod communication
- **HPA**: Horizontal Pod Autoscaling based on CPU/memory

## 📊 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/profile        # Get user profile
PUT  /api/auth/profile        # Update profile
POST /api/auth/refresh        # Refresh token
POST /api/auth/logout         # Logout
```

### Monitoring Endpoints

```bash
GET  /api/metrics             # Get metrics data
GET  /api/metrics/latest/:id  # Latest server metrics
GET  /api/metrics/dashboard   # Dashboard summary
GET  /api/metrics/history/:id # Historical data

GET  /api/servers             # List servers
POST /api/servers             # Add server
PUT  /api/servers/:id         # Update server
DELETE /api/servers/:id       # Remove server

GET  /api/alerts              # List alerts
PUT  /api/alerts/:id/ack      # Acknowledge alert
```

### WebSocket Events

```javascript
// Client to Server
socket.emit('authenticate', { token });
socket.emit('subscribe_server', serverId);
socket.emit('subscribe_dashboard');
socket.emit('subscribe_alerts');

// Server to Client
socket.on('metrics_update', (data));
socket.on('alert_triggered', (alert));
socket.on('alert_resolved', (alert));
socket.on('server_status', (status));
```

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure authentication with refresh tokens
- **Role-based Access**: Admin, User, and Viewer roles
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Redis-backed session storage

### Network Security
- **Network Policies**: Kubernetes network isolation
- **TLS/SSL**: Encrypted communication (configurable)
- **CORS Protection**: Cross-origin resource sharing controls
- **Rate Limiting**: API request throttling

### Data Protection
- **Input Validation**: Joi schema validation
- **SQL Injection**: MongoDB parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Secrets Management**: Kubernetes secrets for sensitive data

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (Example)

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Backend
      run: |
        cd backend
        npm ci
        npm run build
        
    - name: Build Frontend
      run: |
        cd frontend
        npm ci
        npm run build
        
    - name: Build Docker Images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/backend:${{ github.sha }} ./backend
        docker build -t ${{ secrets.REGISTRY }}/frontend:${{ github.sha }} ./frontend
        
    - name: Deploy to Kubernetes
      run: |
        ./scripts/deploy.sh --registry ${{ secrets.REGISTRY }} --version ${{ github.sha }}
```

## 📈 Monitoring & Observability

### Application Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Application error tracking
- **Resource Usage**: CPU, memory, disk utilization
- **User Activity**: Authentication and session metrics

### Infrastructure Monitoring
- **Pod Health**: Kubernetes pod status
- **Service Discovery**: Automatic server detection
- **Network Traffic**: Inter-service communication
- **Storage Usage**: Database and cache metrics

### Alerting Rules
```yaml
# CPU Usage Alert
- alert: HighCPUUsage
  expr: cpu_usage_percentage > 80
  for: 5m
  annotations:
    summary: "High CPU usage detected"
    
# Memory Usage Alert  
- alert: HighMemoryUsage
  expr: memory_usage_percentage > 85
  for: 5m
  annotations:
    summary: "High memory usage detected"
```

## 🔮 Future Enhancements

### Short-term (Next 3 months)
- [ ] **Multi-cluster Support**: Monitor multiple Kubernetes clusters
- [ ] **Custom Dashboards**: User-configurable dashboard layouts
- [ ] **Export/Import**: Configuration backup and restore
- [ ] **Mobile App**: React Native mobile application
- [ ] **Slack Integration**: Real-time alerts via Slack webhooks

### Medium-term (3-6 months)
- [ ] **Machine Learning**: Anomaly detection and predictive analytics
- [ ] **Grafana Integration**: Advanced visualization and dashboards
- [ ] **Prometheus Metrics**: Expose metrics in Prometheus format
- [ ] **Multi-tenancy**: Support for multiple organizations
- [ ] **API Gateway**: Advanced API management and routing

### Long-term (6+ months)
- [ ] **Edge Computing**: Monitor edge devices and IoT sensors
- [ ] **Cost Optimization**: Cloud cost tracking and recommendations
- [ ] **Compliance Reporting**: Security and compliance dashboards
- [ ] **Auto-remediation**: Automated response to common issues
- [ ] **Global Distribution**: Multi-region deployment support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes and test thoroughly**
4. **Submit a pull request** with a clear description

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Follow conventional commit messages
- Ensure all tests pass before submitting

### Code Style
- **Backend**: ESLint with TypeScript rules
- **Frontend**: Prettier + ESLint configuration
- **Git Hooks**: Husky for pre-commit validation
- **Testing**: Jest for unit tests, Cypress for E2E

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Docs**: `/docs/api.md`
- **Deployment Guide**: `/docs/deployment.md`
- **Troubleshooting**: `/docs/troubleshooting.md`

### Community
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for additional documentation

### Professional Support
For enterprise support and custom implementations, please contact the development team.

## 🏆 Acknowledgments

- **React Team**: For the excellent frontend framework
- **Node.js Community**: For the robust backend platform
- **Kubernetes**: For the powerful orchestration platform
- **MongoDB**: For the flexible document database
- **Redis**: For high-performance caching
- **shadcn/ui**: For beautiful UI components

---

**Built with ❤️ for the DevOps community**

*Kubernetes Resource Monitor - Making infrastructure monitoring simple and powerful*
