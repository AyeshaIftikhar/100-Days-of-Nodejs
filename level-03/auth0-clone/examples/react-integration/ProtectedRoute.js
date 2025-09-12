import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute component for securing routes that require authentication
 * 
 * Example usage:
 * <ProtectedRoute>
 *   <YourSecureComponent />
 * </ProtectedRoute>
 * 
 * With role requirements:
 * <ProtectedRoute requiredRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication status is being determined
  if (loading) {
    return <div className="loading">Loading authentication status...</div>;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required roles if specified
  if (requiredRoles.length > 0) {
    const userRoles = user.roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have the required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles (if any)
  return children;
};

export default ProtectedRoute;
