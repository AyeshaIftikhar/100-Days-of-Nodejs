# 🤖 Automated Deployment Bot

A complete automated deployment solution with a modern web interface for managing deployments across multiple environments. Built with Node.js, TypeScript, React, and Socket.IO for real-time monitoring.

![Automated Deployment Bot](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

## 🌟 Features

### Core Deployment Features
- **Multi-Environment Support**: Deploy to development, staging, and production environments
- **Git Integration**: Automatic cloning and branch switching using simple-git
- **Real-time Monitoring**: Live deployment progress tracking with Socket.IO
- **Custom Build Scripts**: Configurable build and deploy commands
- **Webhook Support**: Post-deployment notifications and integrations
- **Deployment History**: Complete audit trail of all deployments

### Modern Web Interface
- **Responsive Dashboard**: Built with React and Tailwind CSS
- **shadcn/ui Components**: Modern, accessible UI components
- **Real-time Updates**: Live deployment status without page refresh
- **Project Management**: CRUD operations for deployment configurations
- **Deployment Logs**: Real-time streaming of build and deploy logs
- **Status Indicators**: Visual progress bars and status badges

### DevOps Capabilities
- **Automated Cloning**: Fetch latest code from any Git repository
- **Build Automation**: Execute custom build commands (npm, yarn, Docker, etc.)
- **Environment Variables**: Secure environment-specific configuration
- **Rollback Support**: Quick recovery from failed deployments
- **Parallel Deployments**: Handle multiple concurrent deployments

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe development
- **Socket.IO** - Real-time bidirectional communication
- **simple-git** - Git operations automation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe frontend development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful SVG icons
- **Socket.IO Client** - Real-time updates

### Build & Development
- **Concurrently** - Run multiple scripts simultaneously
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git installed and configured
- Access to Git repositories you want to deploy

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd level-03/automated-deployment-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:5173

4. **Open your browser** and navigate to http://localhost:5173

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## 📖 Usage Guide

### Creating Your First Project

1. **Access the Dashboard**: Open http://localhost:5173
2. **Add New Project**: Click the "Add Project" button
3. **Configure Project**:
   - **Project Name**: Give your project a descriptive name
   - **Repository URL**: Git repository URL (HTTPS or SSH)
   - **Branch**: Target branch to deploy (e.g., main, develop)
   - **Environment**: Select development, staging, or production
   - **Build Command**: Commands to build your project (e.g., `npm install && npm run build`)
   - **Deploy Command**: Commands to deploy your project (optional)
   - **Webhook URL**: URL to notify after deployment (optional)

4. **Save Configuration**: Click "Create Project"

### Deploying a Project

1. **Select Project**: Find your project in the dashboard
2. **Click Deploy**: Hit the "Deploy" button on the project card
3. **Monitor Progress**: Watch real-time deployment progress
4. **View Logs**: Click on any deployment to see detailed logs
5. **Check Status**: Green badge indicates successful deployment

### Managing Deployments

- **Real-time Monitoring**: All deployments show live progress
- **Deployment History**: See all past deployments with timestamps
- **Cancel Deployments**: Stop running deployments if needed
- **View Logs**: Detailed build and deploy logs for troubleshooting
- **Status Tracking**: Clear visual indicators for deployment status

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration (for production builds)
VITE_API_URL=http://your-domain.com
```

### Deployment Commands Examples

**Node.js Application**:
```bash
Build: npm install && npm run build
Deploy: pm2 restart app-name || pm2 start dist/index.js --name app-name
```

**React Application**:
```bash
Build: npm install && npm run build
Deploy: rsync -av dist/ /var/www/html/
```

**Docker Application**:
```bash
Build: docker build -t my-app .
Deploy: docker stop my-app || true && docker run -d --name my-app -p 80:3000 my-app
```

## 📡 API Reference

### Projects Endpoints

- **GET /api/projects** - List all deployment configurations
- **POST /api/projects** - Create new deployment configuration
- **GET /api/projects/:id** - Get specific deployment configuration
- **PUT /api/projects/:id** - Update deployment configuration
- **DELETE /api/projects/:id** - Delete deployment configuration

### Deployments Endpoints

- **GET /api/deployments** - List all deployments
- **POST /api/deployments** - Start new deployment
- **GET /api/deployments/:id** - Get specific deployment
- **POST /api/deployments/:id/cancel** - Cancel running deployment

### WebSocket Events

- **deployment-update** - Real-time deployment status updates
- **deployment-list-update** - Updated deployment list
- **join-deployment** - Subscribe to specific deployment updates
- **leave-deployment** - Unsubscribe from deployment updates

## 🏗️ Architecture

### Project Structure
```
automated-deployment-bot/
├── server/                 # Backend Express.js server
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── index.ts          # Server entry point
├── src/                   # Frontend React application
│   ├── components/        # React components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # React entry point
├── dist/                  # Production build output
├── deployments/           # Deployment workspace
└── package.json          # Dependencies and scripts
```

### Data Flow
1. **User Action**: User triggers deployment via web interface
2. **API Call**: Frontend makes POST request to `/api/deployments`
3. **Git Clone**: Server clones repository to workspace
4. **Build Process**: Execute custom build commands
5. **Deploy Process**: Run deployment commands
6. **Real-time Updates**: Socket.IO streams progress to frontend
7. **Completion**: Webhook notification and status update

## 🔒 Security Considerations

### Repository Access
- Use SSH keys for private repositories
- Store credentials securely, never in code
- Consider using deploy keys for read-only access

### Environment Variables
- Never commit sensitive data to version control
- Use environment-specific configuration
- Validate all user inputs

### Network Security
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate webhook signatures when possible

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing

## 🚀 Deployment to Production

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/server/index.js --name deployment-bot

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure `VITE_API_URL` for your domain
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates
5. Set up monitoring and logging

## 🔮 Future Enhancements

### Short Term (Next Release)
- [ ] **User Authentication**: Login/logout with role-based access
- [ ] **Deployment Scheduling**: Cron-based automated deployments
- [ ] **Slack Integration**: Real-time notifications in Slack channels
- [ ] **Docker Support**: Built-in Docker build and deploy workflows
- [ ] **Environment Secrets**: Encrypted environment variable storage
- [ ] **Rollback Functionality**: One-click rollback to previous deployments

### Medium Term
- [ ] **Multi-Server Deployments**: Deploy to multiple servers simultaneously
- [ ] **Blue-Green Deployments**: Zero-downtime deployment strategies
- [ ] **Health Checks**: Automatic post-deployment health verification
- [ ] **Deployment Approval**: Manual approval workflow for production
- [ ] **Integration Tests**: Run tests before deployment
- [ ] **Database Migrations**: Automated database schema updates

### Long Term
- [ ] **Kubernetes Integration**: Deploy to Kubernetes clusters
- [ ] **CI/CD Pipeline Builder**: Visual pipeline configuration
- [ ] **Performance Monitoring**: Post-deployment performance tracking
- [ ] **Auto-scaling**: Automatic scaling based on deployment load
- [ ] **Multi-tenancy**: Support for multiple organizations
- [ ] **Advanced Analytics**: Deployment success rates and metrics

### Monitoring & Analytics
- [ ] **Deployment Metrics**: Success rates, duration, frequency
- [ ] **Error Tracking**: Automatic error detection and alerting
- [ ] **Performance Insights**: Deployment impact on application performance
- [ ] **Resource Usage**: Track resource consumption during deployments
- [ ] **Custom Dashboards**: Configurable monitoring dashboards

### Advanced Features
- [ ] **GitOps Integration**: Automatic deployments on Git events
- [ ] **Multi-Cloud Support**: Deploy to AWS, GCP, Azure
- [ ] **Backup & Recovery**: Automatic backups before deployments
- [ ] **Configuration Management**: Version-controlled configuration files
- [ ] **Compliance Tracking**: Audit trails for regulatory compliance

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure code passes ESLint rules

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Lucide** for the icon set
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.IO** for real-time communication
- **simple-git** for Git operations
- **Vite** for the fast build tool

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas

---

**Happy Deploying!** 🚀

*This project demonstrates a complete full-stack application with modern web technologies, real-time features, and production-ready architecture. It serves as an excellent example of building scalable deployment automation tools.*
