import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/auth/login'
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Redirection immédiate si non authentifié (sans loader)
  if (!isLoading && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Afficher un loader minimal seulement pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A5A5]"></div>
          <p className="text-sm text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Vérifications de permissions après authentification confirmée
  if (isAuthenticated) {
    // Vérifier les permissions si requises
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1E1E1E] mb-2">Accès refusé</h1>
            <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
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

    // Vérifier les rôles si requis
    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1E1E1E] mb-2">Accès refusé</h1>
            <p className="text-gray-600 mb-4">Vous n'avez pas le rôle nécessaire pour accéder à cette page.</p>
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
  }

  return <>{children}</>;
};

export default ProtectedRoute;