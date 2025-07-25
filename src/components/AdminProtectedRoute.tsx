import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = "/dashboard"
}) => {
  const { isAuthenticated, isLoading, isAdmin, hasAdminPermission, mfaStatus } = useAuth();
  const location = useLocation();
  const [isMfaVerified, setIsMfaVerified] = useState<boolean | null>(null);

  // Check MFA status for admin routes
  useEffect(() => {
    if (isAuthenticated && !isLoading && isAdmin()) {
      // If MFA is required but not enabled or not verified, redirect to MFA setup
      if (!mfaStatus?.enabled || !mfaStatus?.verified) {
        setIsMfaVerified(false);
      } else {
        setIsMfaVerified(true);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, mfaStatus]);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading state
  if (isLoading || isMfaVerified === null) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A5A5]"></div>
          <p className="text-sm text-gray-600">Vérification des accès administrateur...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1E1E1E] mb-2">Accès administrateur requis</h1>
          <p className="text-gray-600 mb-4">Vous n`avez pas les privilèges administrateur nécessaires pour accéder à cette page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Check if MFA is verified for admin
  if (!isMfaVerified) {
    return <Navigate to="/admin/setup-mfa" state={{ from: location }} replace />;
  }

  // Check specific admin permission if required
  if (requiredPermission && !hasAdminPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1E1E1E] mb-2">Permission insuffisante</h1>
          <p className="text-gray-600 mb-4">Vous n`avez pas les permissions administrateur spécifiques requises pour accéder à cette fonctionnalité.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
