import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminRouteProps } from '../types/admin';

/**
 * AdminRoute component provides protection for admin routes
 * It checks if the user is authenticated, has admin role, and optionally checks for specific permissions
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, isAdmin, hasPermission } = useAuth();
  
  // Log access attempts for security auditing
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const hasAccess = isAdmin() && (!requiredPermission || hasPermission(requiredPermission));
      
      if (!hasAccess) {
        console.warn('Unauthorized admin access attempt detected');
        // In a real implementation, we might want to log this to the server
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, hasPermission, requiredPermission]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-accent">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-secondary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-secondary/20 rounded"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check admin role
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default AdminRoute;