import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Récupérer les paramètres de l'URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');
  const templateId = searchParams.get('template');
  
  // Construire l'URL de redirection si nécessaire
  const finalRedirectTo = redirectPath 
    ? `${redirectPath}${templateId ? `?template=${templateId}` : ''}`
    : redirectTo;

  // Redirection immédiate si déjà authentifié (sans loader)
  if (!isLoading && isAuthenticated) {
    return <Navigate to={finalRedirectTo} replace />;
  }

  // Loader minimal seulement pendant la vérification initiale
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A5A5]"></div>
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;