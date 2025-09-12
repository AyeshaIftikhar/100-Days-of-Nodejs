# Auth0 Clone - Express.js Integration Example

This example demonstrates how to integrate Auth0 Clone with an Express.js application.

## Features

- Public endpoint accessible without authentication
- Protected endpoint requiring authentication
- Admin endpoint requiring authentication and admin role
- JWT token verification middleware

## Prerequisites

- Running Auth0 Clone service
- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
AUTH0_CLONE_URL=http://localhost:3000
TENANT_ID=default
PORT=5000
```

## Running the Example

1. Start the server:
```bash
npm start
```

2. Access the endpoints:
   - Public: http://localhost:5000/api/public
   - Protected: http://localhost:5000/api/protected (requires authentication)
   - Admin: http://localhost:5000/api/admin (requires admin role)

## Testing with cURL

### Public Endpoint
```bash
curl http://localhost:5000/api/public
```

### Protected Endpoint
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/protected
```

### Admin Endpoint
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" http://localhost:5000/api/admin
```

## Implementation Details

The key implementation is in the `middleware/auth.js` file, which contains the middleware for verifying JWT tokens with the Auth0 Clone service.
