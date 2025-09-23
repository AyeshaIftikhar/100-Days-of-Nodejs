# Business Analytics Dashboard - Development Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- (Optional) Docker and Docker Compose

### Automated Setup
```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Clone and navigate to the project**
```bash
git clone <your-repo-url>
cd business-analytics-dashboard
```

2. **Setup environment variables**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database and configuration

# Frontend environment  
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

3. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🐳 Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🔐 Demo Credentials

- **Email**: admin@dashboard.com
- **Password**: password

## 🛠️ Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🗄️ Database Setup

### Using PostgreSQL (Recommended)
1. Install PostgreSQL 14+
2. Create database: `business_dashboard`
3. Update `DATABASE_URL` in `backend/.env`
4. Run migrations: `npm run db:migrate`

### Using Docker (Easiest)
```bash
docker-compose up postgres -d
```

## 📊 Features Overview

### Core Features
- ✅ User Authentication & Authorization
- ✅ Real-time Dashboard with KPIs
- ✅ Project Management
- ✅ Analytics & Reporting
- ✅ User Management
- ✅ Settings & Preferences

### Technical Features
- ✅ TypeScript for type safety
- ✅ Modern React with hooks
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time updates with Socket.IO
- ✅ RESTful API with Express.js
- ✅ JWT-based authentication
- ✅ Error handling & logging
- ✅ API rate limiting
- ✅ Input validation
- ✅ CORS configuration

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:coverage

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

## 📦 Production Deployment

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Environment Variables for Production
Make sure to set these in your production environment:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `JWT_SECRET` (strong secret key)
- `REDIS_URL` (if using Redis)
- `FRONTEND_URL` (production frontend URL)

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/business_dashboard"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:5173"
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Business Analytics Dashboard"
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Kill processes on specific ports
npx kill-port 3001 5173
```

2. **Database connection issues**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

3. **Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

4. **TypeScript errors**
```bash
# Check types
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## 📈 Performance Tips

1. **Development**
- Use `npm run dev` for hot reload
- Keep browser dev tools open for debugging
- Use React Developer Tools extension

2. **Production**
- Enable gzip compression
- Use CDN for static assets
- Implement proper caching strategies
- Monitor with APM tools

## 🔒 Security Considerations

- Change default JWT secret in production
- Use HTTPS in production
- Implement proper CORS configuration
- Regular security updates
- Input validation and sanitization
- Rate limiting for API endpoints

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check this development guide
2. Review the main README.md
3. Check existing GitHub issues
4. Create a new issue with detailed information

---

Happy coding! 🚀
