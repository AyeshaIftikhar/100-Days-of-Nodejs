# OAuth Authentication with Google and GitHub

A Node.js application implementing OAuth 2.0 authentication with Google and GitHub using Passport.js.

## Features

- Google OAuth 2.0 authentication
- GitHub OAuth 2.0 authentication
- Session-based authentication
- User profile storage in MongoDB
- Cross-Origin Resource Sharing (CORS) support
- Secure session management
- Error handling middleware
- Environment variable configuration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth Client ID and Secret
- GitHub OAuth Client ID and Secret

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start MongoDB server
5. Run the application: `npm run dev`

### Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret for session encryption
- `CLIENT_URL` - Frontend application URL
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
- `GITHUB_CALLBACK_URL` - GitHub OAuth callback URL

## API Endpoints

- `GET /api/v1/auth/google` - Initiate Google OAuth flow
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `GET /api/v1/auth/github` - Initiate GitHub OAuth flow
- `GET /api/v1/auth/github/callback` - GitHub OAuth callback
- `GET /api/v1/auth/me` - Get current user data
- `GET /api/v1/auth/logout` - Logout current user

## OAuth Setup Instructions

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth Client ID for "Web application"
5. Add authorized JavaScript origins and redirect URIs
6. Copy Client ID and Client Secret to `.env` file

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Register a new OAuth application
3. Set Authorization callback URL
4. Copy Client ID and Client Secret to `.env` file

## Security Considerations

- Use HTTPS in production
- Keep OAuth credentials secure
- Set appropriate session expiration
- Implement CSRF protection for state-changing requests
- Regularly rotate secrets
- Limit session storage to essential data

## Future Enhancements

1. Add local authentication strategy
2. Implement JWT as an alternative to sessions
3. Add email verification
4. Implement role-based access control
5. Add social account linking
6. Implement refresh tokens
7. Add rate limiting
8. Add API documentation with Swagger

## License

This project is licensed under the MIT License.

```bash
npm install express mongoose passport passport-google-oauth20 passport-github2 express-session dotenv cookie-parser cors
npm install --save-dev nodemon
```