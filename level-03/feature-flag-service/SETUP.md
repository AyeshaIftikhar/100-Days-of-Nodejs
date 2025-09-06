# Setting Up the Feature Flag Service

This guide will walk you through setting up and running the Feature Flag Service.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14+)
- npm or yarn
- MongoDB (local installation or access to a MongoDB instance)
- Redis (optional, for caching)
- Docker & Docker Compose (optional, for containerized setup)

## Installation Options

### Option 1: Local Setup

1. **Clone the repository and install dependencies**

```bash
cd level-03/feature-flag-service
npm install
```

2. **Set up environment variables**

Copy the example environment file and modify it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to configure:
- MongoDB connection string
- Redis connection (if using)
- JWT secret
- Other environment-specific settings

3. **Start MongoDB**

Ensure your MongoDB instance is running. If using a local installation:

```bash
mongod --dbpath /path/to/data/directory
```

4. **Start the application**

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

### Option 2: Docker Setup

1. **Configure environment variables**

Edit the `.env` file or use the default values in `docker-compose.yml`.

2. **Build and start the containers**

```bash
docker-compose up -d
```

This will start:
- The Node.js application
- MongoDB
- Redis

3. **Check the logs**

```bash
docker-compose logs -f app
```

## Verifying the Installation

1. **Check if the server is running**

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2023-09-06T12:00:00.000Z"
}
```

2. **Access the API documentation**

Open a browser and navigate to:

```
http://localhost:3000/api-docs
```

This will display the Swagger UI with all available endpoints.

## Running the Examples

1. **Install dependencies for the examples**

```bash
cd examples
npm install
```

2. **Configure the sample application**

Edit `examples/sample-app.js` and update the projectId to match your project:

```javascript
const featureFlags = new FeatureFlagClient({
  apiUrl: 'http://localhost:3000/api',
  projectId: 'your-project-id', // Replace with your actual project ID
  environment: 'production',
});
```

3. **Run the sample application**

```bash
cd examples
npm start
```

The sample application will be available at `http://localhost:4000`.

## Running Tests

```bash
npm test
```

## Next Steps

1. Create an organization and project
2. Create your first feature flag
3. Integrate the feature flag service with your application
4. Set up monitoring and analytics

See the [README.md](./README.md) for more details on using the Feature Flag Service.

## Troubleshooting

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Check if MongoDB is running:
```bash
ps aux | grep mongod
```

2. Verify your connection string in the `.env` file

3. Ensure network connectivity to your MongoDB instance

### API Authentication Issues

If you're having trouble with API authentication:

1. Make sure your JWT token is valid
2. Check the `Authorization` header format (should be `Bearer <token>`)
3. Verify your JWT secret matches between token generation and verification

### Redis Connection Issues

If you're having issues with Redis:

1. Check if Redis is running:
```bash
redis-cli ping
```

2. Verify your Redis connection settings in the `.env` file

3. Try disabling Redis by setting `NODE_ENV` to a value other than `production`
