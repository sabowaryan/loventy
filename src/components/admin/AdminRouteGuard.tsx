import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminRouteProps } from '../../types/admin';
import { supabase } from '../../lib/supabase';

/**
 * AdminRouteGuard component provides enhanced protection for admin routes
 * It checks if the user is authenticated, has admin role, and optionally checks for specific permissions
 * It also logs access attempts for security auditing
 */
const AdminRouteGuard: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();
  
  // Log access attempts for security auditing
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const hasAccess = isAdmin() && (!requiredPermission || hasPermission(requiredPermission));
      
      // Log admin access attempt to audit log
      const logAccessAttempt = async () => {
        try {
          await supabase.rpc('log_admin_access_attempt', {
            route_path: location.pathname,
            access_granted: hasAccess,
            required_permission: requiredPermission || null
          });
        } catch (error) {
          console.error('Failed to log admin access attempt:', error);
        }
      };
      
      logAccessAttempt();
    }
  }, [isLoading, isAuthenticated, isAdmin, hasPermission, requiredPermission, location.pathname]);

  // Show loading state while checking authentication
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
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
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

export default AdminRouteGuard;