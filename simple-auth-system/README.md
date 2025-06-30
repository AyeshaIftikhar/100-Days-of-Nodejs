# Simple Auth System
An authentication system using JWT for tokens and files for storage (no database required). This implementation is perfect for small projects or learning purposes.

```
simple-auth-system/
├── auth/
│   ├── auth.js          # Auth functions
│   └── middleware.js    # Auth middleware
├── storage/
│   └── users.json       # User storage file
├── app.js               # Main application
└── config.js            # Configuration
```

## Features
- User registration
- User login with JWT
- Password hashing (bcrypt)
- Token verification middleware
- File-based user storage
- Refresh token support
- Basic rate limiting

## Usage Examples
- Register New User
```curl
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepassword"}'
```  
- Login
```curl
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepassword"}'
```
Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
    "username": "testuser"
  }
}
```
- Access Profile
```curl
curl http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- Refresh Token
```curl
curl -X POST http://localhost:3000/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

## Security Considerations
- Change the JWT secret in production
- Use HTTPS in production
- Implement proper password policies (minimum length, complexity)
- Add more rate limiting for sensitive endpoints
- Consider adding logging for security events
- Store refresh tokens more securely (this simple version stores them in the file)

## Future Enhancements
- Password reset functionality
- Email verification
- Role-based access control
- Session management
- Two-factor authentication
- Logging system
- Database integration (replace file storage)
- API documentation with Swagger