# JWT Authentication API with Express and MongoDB

A secure authentication system implementing JSON Web Tokens (JWT) with Node.js, Express, and MongoDB.

## Features

- User registration with email and password
- User login with JWT generation
- Password hashing with bcryptjs
- Protected routes requiring valid JWT
- Role-based authorization (user/admin)
- Cookie-based JWT storage (with HTTP-only flag)
- Secure password reset functionality
- Error handling middleware
- Environment variable configuration
- MongoDB database integration
- CORS and Helmet for security

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `GET /api/v1/auth/logout` - Logout (clears JWT cookie)

### Protected Routes (require valid JWT)

- `GET /api/v1/auth/me` - Get current user data
- `PATCH /api/v1/auth/updateMe` - Update current user data
- `DELETE /api/v1/auth/deleteMe` - Delete current user account

### Admin Routes (require admin role)

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get specific user (admin only)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start MongoDB server
5. Run the application: `npm run dev`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., "1d")
- `JWT_COOKIE_EXPIRES` - Cookie expiration in days
- `NODE_ENV` - Environment (development/production)

## Security Features

- Password hashing with bcrypt
- HTTP-only cookies for JWT storage
- CSRF protection
- Helmet for secure HTTP headers
- Rate limiting (to be implemented)
- Input validation
- Secure password reset tokens
- JWT expiration

## Architecture

The application follows a layered architecture:

1. **Routes Layer**: Handles HTTP requests and responses
2. **Controller Layer**: Contains business logic
3. **Service Layer**: Handles authentication logic
4. **Model Layer**: Defines data structure and database operations
5. **Middleware Layer**: Handles authentication and error handling

### Design Patterns

- **Middleware Pattern**: For authentication and error handling
- **Repository Pattern**: For database operations
- **Factory Pattern**: For error handling
- **Singleton Pattern**: For database connection
- **Strategy Pattern**: For different authentication methods

## Future Enhancements

1. **Password Reset**: Implement password reset functionality
2. **Email Verification**: Add email verification flow
3. **Two-Factor Authentication**: Add 2FA support
4. **Social Login**: Integrate OAuth providers
5. **Rate Limiting**: Protect against brute force attacks
6. **Audit Logging**: Track user activities
7. **Refresh Tokens**: Implement token rotation
8. **API Documentation**: Swagger/OpenAPI documentation

## Best Practices

1. Never store plain text passwords
2. Use HTTPS in production
3. Set appropriate CORS policies
4. Implement proper error handling
5. Use environment variables for configuration
6. Validate all user input
7. Limit login attempts
8. Regularly update dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken cookie-parser dotenv helmet cors
npm install --save-dev nodemon
```
