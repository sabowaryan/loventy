import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedRedirect } from '../../hooks/useRoleBasedRedirect';

/**
 * Composant pour gérer la redirection automatique après connexion
 * Particulièrement utile pour les connexions OAuth où la redirection
 * ne peut pas être gérée directement dans le composant de connexion
 */
const PostLoginRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { getRedirectPath } = useRoleBasedRedirect();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Récupérer les paramètres de redirection depuis l'URL ou le state
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect');
      const templateId = searchParams.get('template');
      
      // Ou depuis le state de navigation (pour les redirections depuis login)
      const state = location.state as { from?: Location; redirect?: string; template?: string } | null;
      const stateRedirect = state?.redirect;
      const stateTemplate = state?.template;

      // Déterminer la route de redirection appropriée
      const finalRedirectPath = redirectPath || stateRedirect;
      const finalTemplateId = templateId || stateTemplate;
      
      let targetPath = finalRedirectPath || getRedirectPath('/dashboard');
      
      // Si un template est spécifié, l'ajouter à l'URL
      if (finalTemplateId) {
        targetPath = `${targetPath}?template=${finalTemplateId}`;
      }
      
      // Rediriger vers la route appropriée
      navigate(targetPath, { replace: true });
    }
  }, [isLoading, isAuthenticated, location, getRedirectPath, navigate]);

  // Afficher un loader pendant la redirection
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A5A5]"></div>
          <p className="text-lg font-medium text-[#131837]">Redirection en cours...</p>
          <p className="text-sm text-gray-600">Vous allez être redirigé vers votre dashboard</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  return null;
};

export default PostLoginRedirect;