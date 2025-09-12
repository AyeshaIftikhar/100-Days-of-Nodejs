import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';

// Import your other components
// import Register from './Register';
// import Dashboard from './Dashboard';
// import Profile from './Profile';
// import ForgotPassword from './ForgotPassword';
// import ResetPassword from './ResetPassword';
// import Unauthorized from './Unauthorized';

/**
 * Example of a Navbar component using the auth context
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Auth0 Clone Demo</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            {user.roles.some(role => role.name === 'admin') && (
              <Link to="/admin">Admin</Link>
            )}
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

/**
 * Placeholder components for the example
 */
const Home = () => <div>Home Page - Public</div>;
const Dashboard = () => <div>Dashboard - Protected</div>;
const Profile = () => <div>User Profile - Protected</div>;
const Admin = () => <div>Admin Panel - Protected & Role-based</div>;
const Register = () => <div>Register Page</div>;
const ForgotPassword = () => <div>Forgot Password Page</div>;
const ResetPassword = () => <div>Reset Password Page</div>;
const Unauthorized = () => <div>Unauthorized Access</div>;

/**
 * Main App component with routing setup
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          
          <div className="container">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
