# Rate-Limited API with Redis

A Node.js API with Redis-based rate limiting for controlling request traffic.

## Features

- **Multiple Rate Limit Strategies**: IP, user, and API key based limiting
- **Customizable Limits**: Different limits per endpoint
- **Redis Backend**: Fast and scalable rate limiting
- **Response Headers**: X-RateLimit headers for client information
- **Fail-Open Design**: Continues working during Redis outages
- **API Key Management**: Track and limit by API keys

## Rate Limiting Types

1. **IP-based**: Limits requests per IP address
2. **User-based**: Limits requests per authenticated user
3. **API Key-based**: Limits requests per API key
4. **Endpoint-based**: Custom limits for specific routes

## API Endpoints

- `GET /api/v1/public` - IP-based rate limiting
- `GET /api/v1/user` - User-based rate limiting (requires auth)
- `GET /api/v1/admin` - Strict rate limiting (10 requests/minute)
- `GET /api/v1/key-based` - API key-based rate limiting

## Response Headers

- `X-RateLimit-Limit`: Total requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Seconds until window resets

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start Redis server
5. Run the application: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 3000)
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis password (if required)
- `MONGODB_URI`: MongoDB connection string
- `RATE_LIMIT_WINDOW`: Rate limit window in seconds
- `RATE_LIMIT_MAX`: Max requests per window
- `RATE_LIMIT_BY_IP`: Enable IP-based limiting (true/false)
- `RATE_LIMIT_BY_USER`: Enable user-based limiting (true/false)
- `RATE_LIMIT_BY_API_KEY`: Enable API key-based limiting (true/false)

## Rate Limit Configuration

Configure default limits in `.env` or override per route:

```javascript
// 10 requests per minute
router.get('/strict', 
  rateLimiter({ max: 10, window: 60 }),
  controller.strictEndpoint
);
```
