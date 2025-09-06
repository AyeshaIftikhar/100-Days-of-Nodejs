# Feature Flag Service

A scalable feature flag service built with Node.js that enables teams to implement feature toggles, conduct A/B testing, and perform gradual rollouts of new features.

## 🚀 Features

- **Feature Flag Management**: Create, update, and delete feature flags
- **Multi-environment Support**: Configure flags differently for development, staging, and production
- **Advanced Targeting Rules**: Target users based on attributes like location, user type, etc.
- **Gradual Rollouts**: Roll out features to a percentage of users
- **A/B Testing**: Test multiple variants of a feature
- **Real-time Evaluation**: Evaluate flags in real-time for your applications
- **Analytics**: Track flag usage and distribution
- **API-first Design**: RESTful API with Swagger documentation
- **Caching**: Redis caching for high-performance evaluations

## 🛠️ Tech Stack

- **Node.js & Express**: Fast, unopinionated web framework
- **MongoDB**: Flexible document database
- **Redis**: In-memory data structure store for caching
- **JWT**: Secure authentication
- **Docker**: Containerization for easy deployment
- **Swagger**: API documentation

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (optional, for caching)
- Docker & Docker Compose (optional, for containerized setup)

## 🚀 Getting Started

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   - Copy `.env.example` to `.env` and adjust values

```bash
cp .env.example .env
```

### Development

Start the server in development mode:

```bash
npm run dev
```

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- The Node.js application
- MongoDB
- Redis

## 🔍 API Usage

### API Documentation

Once the server is running, access Swagger documentation at:

```
http://localhost:3000/api-docs
```

### Basic Usage Examples

#### Creating a Feature Flag

```bash
curl -X POST http://localhost:3000/api/projects/{projectId}/flags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Homepage",
    "key": "new_homepage",
    "description": "Toggle for the new homepage design",
    "variants": [
      {
        "name": "control",
        "value": false,
        "description": "Original homepage",
        "weight": 50
      },
      {
        "name": "variant_a",
        "value": true,
        "description": "New homepage design",
        "weight": 50
      }
    ],
    "environments": [
      {
        "name": "development",
        "enabled": true,
        "defaultVariant": "variant_a"
      },
      {
        "name": "staging",
        "enabled": true,
        "defaultVariant": "variant_a"
      },
      {
        "name": "production",
        "enabled": false,
        "defaultVariant": "control",
        "rolloutPercentage": 0
      }
    ]
  }'
```

#### Evaluating a Feature Flag

```bash
curl -X POST http://localhost:3000/api/projects/{projectId}/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "flagKey": "new_homepage",
    "environment": "production",
    "userId": "user123",
    "context": {
      "userType": "premium",
      "country": "US"
    }
  }'
```

## 🔧 Integration

### Server-side Integration

Install the client library (future enhancement):

```bash
npm install feature-flag-client
```

```javascript
const { FeatureFlagClient } = require('feature-flag-client');

// Initialize client
const client = new FeatureFlagClient({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  environment: 'production'
});

// Evaluate a flag
const result = await client.evaluate('new_homepage', 'user123', {
  userType: 'premium',
  country: 'US'
});

if (result.enabled) {
  // Show new homepage
} else {
  // Show old homepage
}
```

### Client-side Integration

```javascript
// JavaScript example
const featureFlags = new FeatureFlags({
  apiUrl: 'https://your-api-url.com/api',
  projectId: 'your-project-id',
  environment: 'production',
  userId: 'user123',
  context: {
    userType: 'premium',
    country: 'US'
  }
});

// Check if a feature is enabled
featureFlags.isEnabled('new_homepage')
  .then(enabled => {
    if (enabled) {
      // Show new homepage
    } else {
      // Show old homepage
    }
  });
```

## 📊 Architecture

The feature flag service is built with a modular architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures
- **Routes**: Define API endpoints
- **Middleware**: Process requests
- **Utils**: Utility functions
- **Config**: Configuration settings

## 🔒 Security Considerations

- All API endpoints are secured with JWT authentication (except for evaluation endpoints)
- Evaluation endpoints require API keys for authentication
- Rate limiting is implemented to prevent abuse
- Input validation ensures data integrity
- CORS is configured to restrict access

## 🚀 Future Enhancements

1. **Client SDKs**: Build SDKs for various languages (JavaScript, Python, Java, etc.)
2. **Webhooks**: Add webhooks for flag changes
3. **UI Dashboard**: Create a user-friendly dashboard for managing flags
4. **Audit Logs**: Add detailed audit logs for all changes
5. **Approval Workflows**: Add approval workflows for flag changes in production
6. **Import/Export**: Allow importing and exporting flag configurations
7. **Performance Monitoring**: Add performance monitoring for flag evaluations
8. **Segmentation**: Enhance targeting with user segments
9. **Schedule Rollouts**: Schedule flag changes at specific times
10. **Custom Rules Engine**: Add a custom rules engine for complex targeting scenarios
11. **Real-time Updates**: Use WebSockets for real-time flag updates
12. **Integration with CI/CD**: Integrate with CI/CD pipelines for automated flag management

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
