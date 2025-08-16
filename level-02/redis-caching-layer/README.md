# Redis Caching Layer

## What is a Redis Caching Layer?

A Redis caching layer is an intermediate layer between your application and database that stores frequently accessed data in memory for faster retrieval. Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, and message broker.

When implemented as a caching layer in a Node.js application, Redis:

- Dramatically improves application performance by reducing database load
- Serves frequently requested data from memory instead of disk
- Reduces latency for read-heavy applications
- Provides persistence options if needed
- Supports various data structures (strings, hashes, lists, sets, etc.)

```bash
npm install express redis mongoose dotenv
npm install --save-dev nodemon
```

# Redis Caching Layer for Node.js

This project demonstrates how to implement a Redis caching layer in a Node.js application to improve performance by reducing database load and response times.

## Features

1. **Redis Integration**: Seamless integration with Redis for caching
2. **Cache Middleware**: Custom middleware for automatic caching of responses
3. **Cache Invalidation**: Automatic cache invalidation on data modification
4. **Pattern-based Cache Clearing**: Clear cache entries based on patterns
5. **MongoDB Integration**: Example with MongoDB as the primary database
6. **Promisified Redis Methods**: Using async/await with Redis
7. **Environment Configuration**: Configurable through .env file
8. **Graceful Shutdown**: Proper cleanup on application termination

## Architecture

The application follows a layered architecture:

1. **Presentation Layer**: Express routes handling HTTP requests
2. **Application Layer**: Controllers containing business logic
3. **Service Layer**: Redis service abstraction
4. **Data Access Layer**: MongoDB integration
5. **Caching Layer**: Redis middleware for caching

### Design Patterns

1. **Middleware Pattern**: Used for the caching layer
2. **Repository Pattern**: Abstracted data access in models
3. **Singleton Pattern**: Redis client instance
4. **Facade Pattern**: Redis service providing simplified interface
5. **Decorator Pattern**: Enhancing res.json to add caching

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Redis server running locally or accessible
- MongoDB server running locally or accessible
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start Redis and MongoDB servers
5. Run the application: `npm run dev`

### API Endpoints

- `GET /api/users` - Get all users (cached)
- `GET /api/users/:id` - Get user by ID (cached)
- `POST /api/users` - Create new user (invalidates cache)
- `PUT /api/users/:id` - Update user (invalidates cache)
- `DELETE /api/users/:id` - Delete user (invalidates cache)

## Future Enhancements

1. **Distributed Caching**: Support for Redis cluster
2. **Cache Compression**: Compress cached data to save memory
3. **Advanced Eviction Policies**: More sophisticated cache eviction
4. **Metrics and Monitoring**: Add monitoring for cache hit/miss ratios
5. **Multi-level Caching**: Combine Redis with in-memory cache
6. **Cache Warming**: Pre-load cache during startup
7. **Rate Limiting**: Use Redis for rate limiting endpoints

## Drawbacks

1. **Cache Invalidation Complexity**: Ensuring cache consistency can be challenging
2. **Memory Usage**: Redis is in-memory, which can be expensive for large datasets
3. **Cold Start**: Empty cache after restart can cause initial slow responses
4. **Network Latency**: Additional network hop to Redis (mitigated by local Redis)
5. **Serialization Overhead**: JSON serialization/deserialization adds some overhead

## Monitoring and Maintenance

- Monitor Redis memory usage
- Set appropriate TTL values based on data volatility
- Implement cache hit/miss monitoring
- Consider Redis persistence options if cache durability is important


```bash
brew install redis
brew services start redis
brew services restart redis
redis-server // run manaually
redis-cli ping // should return PONG
```