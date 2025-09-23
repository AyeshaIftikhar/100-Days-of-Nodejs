# 🚀 Deployment Dashboard

A modern, real-time CI/CD pipeline monitoring and deployment management platform built with Node.js, React, and TypeScript. Monitor your deployments, track pipeline status, and manage your entire CI/CD workflow from a single, beautiful dashboard.

## 🌟 Features

### Core Functionality
- **📊 Real-time Pipeline Monitoring** - Watch your CI/CD pipelines execute in real-time
- **🔧 Multi-Project Management** - Manage multiple repositories and projects
- **🚀 Deployment Tracking** - Monitor deployments across multiple environments
- **📈 Analytics & Metrics** - Track success rates, deployment frequency, and performance
- **🔔 Smart Notifications** - Get notified of pipeline failures and deployment status
- **🔐 Secure Authentication** - JWT-based auth with role-based access control

### Technical Features
- **⚡ WebSocket Integration** - Real-time updates without page refresh
- **🐳 Docker Support** - Fully containerized application
- **🔄 GitHub Actions Integration** - Seamless CI/CD pipeline integration
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🎨 Modern UI** - Built with shadcn/ui and Tailwind CSS
- **🛡️ Security First** - Rate limiting, CORS, security headers
- **📊 Load Testing** - Built-in performance testing with Artillery

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React +      │◄──►│   (Node.js +    │◄──►│   (SQLite/      │
│   TypeScript)   │    │   Express)      │    │   PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   WebSocket     │◄─────────────┘
                        │   Server        │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  GitHub Actions │
                        │   Webhooks      │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd deployment-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

### Docker Development Setup

1. **Using Docker Compose for development**
   ```bash
   docker-compose --profile dev up
   ```

2. **Using Docker Compose for production**
   ```bash
   docker-compose up
   ```

## 📋 Configuration

### Backend Configuration (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=sqlite:./data/database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# GitHub Webhook Configuration (optional)
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## 🔧 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Projects Endpoints

#### GET /api/projects
Get all projects for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "My Web App",
      "repository_url": "https://github.com/user/repo",
      "branch": "main",
      "status": "active",
      "description": "Production web application"
    }
  ]
}
```

#### POST /api/projects
Create a new project.

**Request Body:**
```json
{
  "name": "My New Project",
  "repository_url": "https://github.com/user/new-repo",
  "branch": "main",
  "description": "A new project description",
  "environment_variables": {
    "NODE_ENV": "production",
    "API_KEY": "secret-key"
  }
}
```

### Pipelines Endpoints

#### GET /api/pipelines
Get pipeline history with optional filtering.

**Query Parameters:**
- `project_id` - Filter by project ID
- `status` - Filter by status (pending, running, success, failed)
- `limit` - Limit number of results (default: 50)
- `offset` - Offset for pagination (default: 0)

### Deployments Endpoints

#### GET /api/deployments
Get deployment history with optional filtering.

**Query Parameters:**
- `environment` - Filter by environment (development, staging, production)
- `status` - Filter by status (pending, deploying, success, failed)
- `project_id` - Filter by project ID

#### POST /api/deployments/{id}/rollback
Rollback a deployment to the previous version.

### WebSocket Events

Connect to WebSocket server at `ws://localhost:3001` with authentication token.

**Client Events:**
- `join_project` - Join project room for updates
- `subscribe_pipeline` - Subscribe to pipeline status updates
- `get_notifications` - Request user notifications

**Server Events:**
- `pipeline_created` - New pipeline started
- `pipeline_updated` - Pipeline status changed
- `deployment_updated` - Deployment status changed
- `notification` - New notification for user

## 🔄 GitHub Actions Integration

### Webhook Setup

1. **Add webhook to your repository**
   - Go to Repository Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/github`
   - Select events: Push, Pull requests, Workflow runs
   - Add secret (optional but recommended)

2. **Configure GitHub Actions**

Create `.github/workflows/deploy.yml` in your project:

```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Notify Deployment Dashboard
        run: |
          curl -X POST https://your-dashboard.com/api/webhooks/github \
            -H "Content-Type: application/json" \
            -H "X-Hub-Signature-256: ${{ secrets.WEBHOOK_SECRET }}" \
            -d '{
              "action": "completed",
              "workflow_run": {
                "id": "${{ github.run_id }}",
                "status": "completed",
                "conclusion": "success"
              }
            }'
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run component tests
npm run test:ui

# Run linting
npm run lint
```

### Load Testing

```bash
# Install Artillery globally
npm install -g artillery

# Run load tests against local server
artillery run .github/workflows/artillery-config.yml
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Set up reverse proxy (nginx example)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Cloud Deployment

#### AWS ECS Deployment

1. **Push images to ECR**
   ```bash
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-west-2.amazonaws.com
   
   docker build -t deployment-dashboard-backend ./backend
   docker tag deployment-dashboard-backend:latest your-account.dkr.ecr.us-west-2.amazonaws.com/deployment-dashboard-backend:latest
   docker push your-account.dkr.ecr.us-west-2.amazonaws.com/deployment-dashboard-backend:latest
   ```

2. **Deploy to ECS**
   - Create ECS cluster
   - Create task definitions
   - Create services
   - Configure load balancer

#### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-dashboard
spec:
  replicas: 2
  selector:
    matchLabels:
      app: deployment-dashboard
  template:
    metadata:
      labels:
        app: deployment-dashboard
    spec:
      containers:
      - name: backend
        image: your-registry/deployment-dashboard-backend:latest
        ports:
        - containerPort: 3001
      - name: frontend
        image: your-registry/deployment-dashboard-frontend:latest
        ports:
        - containerPort: 80
```

## 🔒 Security

### Security Features Implemented

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent abuse with configurable rate limits
- **CORS Protection** - Configured CORS for secure cross-origin requests
- **Security Headers** - Comprehensive security headers via Helmet.js
- **Input Validation** - Joi validation for all API inputs
- **SQL Injection Protection** - Parameterized queries with Knex.js
- **Password Hashing** - bcrypt for secure password storage

### Security Best Practices

1. **Change default secrets**
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Use HTTPS in production**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS
   - Set secure cookie flags

3. **Database Security**
   - Use environment variables for database credentials
   - Enable database SSL connections
   - Regular backups and encryption

4. **Container Security**
   - Run containers as non-root user
   - Scan images for vulnerabilities
   - Keep base images updated

## 📊 Monitoring & Observability

### Health Checks

- **Backend Health**: `GET /api/health`
- **Frontend Health**: `GET /health`
- **Database Health**: Included in backend health check

### Logging

- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Logging**: Comprehensive error logging with stack traces
- **WebSocket Logging**: Connection and event logging

### Metrics

Track key metrics through the dashboard:
- Pipeline success/failure rates
- Deployment frequency
- Average deployment time
- System uptime
- API response times

## 🛠️ Development

### Project Structure

```
deployment-dashboard/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database setup and migrations
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── lib/            # Utility functions
│   ├── package.json
│   └── Dockerfile
├── .github/workflows/      # GitHub Actions workflows
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

### Code Style

- **TypeScript** - Strict typing enabled
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔮 Future Enhancements

### Phase 1 - Advanced Features
- [ ] **Multi-environment Support** - Support for dev/staging/prod environments
- [ ] **Pipeline Templates** - Reusable pipeline configurations
- [ ] **Custom Dashboards** - User-configurable dashboard layouts
- [ ] **Advanced Filtering** - Complex filtering and search capabilities
- [ ] **Audit Logs** - Comprehensive audit trail for all actions

### Phase 2 - Integrations
- [ ] **Slack Integration** - Send notifications to Slack channels
- [ ] **Jira Integration** - Link deployments to Jira tickets
- [ ] **PagerDuty Integration** - Alert management integration
- [ ] **Datadog Integration** - Metrics and monitoring integration
- [ ] **AWS CloudWatch** - AWS metrics and logging

### Phase 3 - Advanced CI/CD
- [ ] **Blue-Green Deployments** - Zero-downtime deployment strategies
- [ ] **Canary Deployments** - Gradual rollout capabilities
- [ ] **Rollback Automation** - Automatic rollback on failure detection
- [ ] **Performance Testing** - Automated performance testing in pipeline
- [ ] **Security Scanning** - Integrated security vulnerability scanning

### Phase 4 - Enterprise Features
- [ ] **SSO Integration** - Single Sign-On with SAML/OAuth
- [ ] **RBAC** - Advanced role-based access control
- [ ] **Multi-tenancy** - Support for multiple organizations
- [ ] **API Rate Limiting** - Advanced rate limiting per user/organization
- [ ] **Custom Webhooks** - User-defined webhook endpoints

### Phase 5 - Analytics & AI
- [ ] **Predictive Analytics** - Predict deployment success/failure
- [ ] **Anomaly Detection** - Detect unusual patterns in deployments
- [ ] **Performance Insights** - AI-powered performance recommendations
- [ ] **Cost Optimization** - Track and optimize deployment costs
- [ ] **Trend Analysis** - Long-term trend analysis and reporting

## 📞 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Community
- GitHub Issues - Bug reports and feature requests
- Discussions - Community discussions and Q&A
- Discord - Real-time community support

### Commercial Support
For enterprise support and custom development, contact [your-email@company.com](mailto:your-email@company.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [React](https://reactjs.org/) - User interface library
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Socket.IO](https://socket.io/) - Real-time communication
- [Knex.js](https://knexjs.org/) - SQL query builder
- [Docker](https://www.docker.com/) - Containerization platform

---

Built with ❤️ for the developer community. Star ⭐ this repository if you find it helpful!
