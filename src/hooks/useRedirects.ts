import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useRedirects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérification de redirection réactivée avec protection contre la récursion
    const checkRedirects = async () => {
      // Éviter les vérifications multiples simultanées
      if (isChecking) return;
      
      setIsChecking(true);
      setError(null);
      
      try {
        // Nettoyer les erreurs de connexion stockées
        sessionStorage.removeItem('connection_error');
        
        // Vérifications de redirection basiques sans requêtes RLS complexes
        const currentPath = location.pathname;
        
        // Redirection simple basée sur l'URL uniquement
        if (currentPath === '/redirect-test') {
          navigate('/dashboard');
          return;
        }
        
        // Autres redirections simples peuvent être ajoutées ici
        // sans faire appel aux politiques RLS complexes
        
      } catch (err) {
        console.error('Redirect check error:', err);
        setError(err instanceof Error ? err.message : 'Erreur de redirection');
      } finally {
        setIsChecking(false);
      }
    };

    // Délai pour éviter les appels trop fréquents
    const timeoutId = setTimeout(checkRedirects, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, navigate, isChecking]);

  return { isChecking, error };
};