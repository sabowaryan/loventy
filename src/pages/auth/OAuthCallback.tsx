import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedRedirect } from '../../hooks/useRoleBasedRedirect';
import { Loader2 } from 'lucide-react';

/**
 * Page de callback OAuth pour gérer la redirection après connexion avec Google
 * Cette page traite les paramètres OAuth et redirige l'utilisateur vers la bonne destination
 */
const OAuthCallback: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { getRedirectPath } = useRoleBasedRedirect();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attendre que l'authentification soit résolue
    if (!isLoading) {
      if (isAuthenticated) {
        // Récupérer les paramètres de redirection depuis l'URL
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect');
        const templateId = searchParams.get('template');
        
        // Ou depuis le hash (certains providers OAuth utilisent le hash)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hashRedirect = hashParams.get('redirect');
        const hashTemplate = hashParams.get('template');

        // Déterminer la route de redirection appropriée
        const finalRedirectPath = redirectPath || hashRedirect;
        const finalTemplateId = templateId || hashTemplate;
        
        let targetPath = finalRedirectPath || getRedirectPath('/dashboard');
        
        // Si un template est spécifié, l'ajouter à l'URL
        if (finalTemplateId) {
          targetPath = `${targetPath}?template=${finalTemplateId}`;
        }
        
        // Rediriger vers la route appropriée
        navigate(targetPath, { replace: true });
      } else {
        // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
        navigate('/auth/login', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, location, getRedirectPath, navigate]);

  // Afficher un loader pendant le traitement
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A5A5]"></div>
        <p className="text-lg font-medium text-[#131837]">Finalisation de la connexion...</p>
        <p className="text-sm text-gray-600">Vous allez être redirigé automatiquement</p>
      </div>
    </div>
  );
};

export default OAuthCallback;