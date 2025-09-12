# React Integration Example

This example demonstrates how to integrate the Auth0 Clone service with a React application. It provides all the components you need to implement a complete authentication system in your React app.

## Features

- Authentication context provider with React Context API
- Protected routes with role-based access control
- Login and registration components
- Token management (automatic refresh)
- Social login integration
- User profile management
- Persistent sessions

## File Overview

- `AuthContext.js` - Context provider for authentication state management
- `ProtectedRoute.js` - Route wrapper component for protected pages
- `Login.js` - Login component with email/password and social login
- `App.js` - Example app layout with routing configuration
- `config.js` - Configuration for API endpoints

## Setup Instructions

### 1. Install required dependencies

```bash
npm install axios react-router-dom
```

### 2. Copy the integration files

Copy all the files from this example directory into your React project.

### 3. Configure the API endpoint

Update the API URL in `config.js` to point to your Auth0 Clone server:

```javascript
export const API_URL = 'http://localhost:5000/api/v1';
```

### 4. Wrap your application with the AuthProvider

In your main application file:

```jsx
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 5. Set up protected routes

Use the `ProtectedRoute` component to secure routes that require authentication:

```jsx
import ProtectedRoute from './ProtectedRoute';

// In your Routes configuration:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// With role requirements:
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### 6. Use the authentication hooks in your components

```jsx
import { useAuth } from './AuthContext';

function Profile() {
  const { user, updateProfile, error } = useAuth();
  
  // Now you can use these in your component
  // ...
}
```

## Using the Auth Context

The `useAuth()` hook provides the following values and functions:

- `user` - The current user object (null if not authenticated)
- `loading` - Boolean indicating if the auth state is being determined
- `error` - Any error messages from auth operations
- `isAuthenticated` - Boolean indicating if the user is authenticated
- `login(email, password)` - Function to log in with email and password
- `register(userData)` - Function to register a new user
- `logout()` - Function to log out the current user
- `updateProfile(profileData)` - Function to update the user's profile
- `changePassword(currentPassword, newPassword)` - Function to change the user's password
- `requestPasswordReset(email)` - Function to request a password reset
- `resetPassword(token, newPassword)` - Function to reset the password with a token
- `socialLogin(provider)` - Function to initiate social login

## Example Usage

### Login Form

```jsx
import { useAuth } from './AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Displaying User Information

```jsx
import { useAuth } from './AuthContext';

function UserInfo() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }
  
  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.map(role => role.name).join(', ')}</p>
    </div>
  );
}
```

## Customization

You can customize the appearance and behavior of the authentication components by:

1. Modifying the UI components (Login.js, etc.)
2. Extending the AuthContext with additional functions
3. Adjusting token refresh intervals in AuthContext.js
4. Adding additional protected route conditions

## Security Considerations

- The example uses localStorage for token storage. For production applications, consider using more secure options like HttpOnly cookies.
- Implement CSRF protection for production applications.
- Enable HTTPS for all API communications.
- Consider adding rate limiting on the frontend to prevent brute force attacks.

## Troubleshooting

- If you encounter CORS issues, make sure your Auth0 Clone server has CORS properly configured.
- For social login issues, check that the redirect URLs are properly configured in your Auth0 Clone server.
- If tokens aren't refreshing, verify that cookies are being properly sent with the withCredentials option.
