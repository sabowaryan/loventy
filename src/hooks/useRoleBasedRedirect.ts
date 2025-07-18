import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour déterminer la route de redirection appropriée selon le rôle de l'utilisateur
 */
export const useRoleBasedRedirect = () => {
  const { isAdmin, hasRole } = useAuth();

  /**
   * Détermine la route de redirection appropriée pour l'utilisateur connecté
   * @param defaultPath - Chemin par défaut si aucune redirection spécifique n'est nécessaire
   * @returns La route appropriée selon le rôle de l'utilisateur
   */
  const getRedirectPath = (defaultPath: string = '/dashboard'): string => {
    // Si l'utilisateur est admin, le rediriger vers le dashboard admin
    if (isAdmin()) {
      return '/dashboard/admin';
    }

    // Si l'utilisateur a un rôle host, le rediriger vers le dashboard principal
    if (hasRole('host')) {
      return '/dashboard';
    }

    // Pour tous les autres utilisateurs, utiliser le chemin par défaut
    return defaultPath;
  };

  /**
   * Détermine si une redirection basée sur le rôle est nécessaire
   * @param currentPath - Chemin actuel
   * @returns true si une redirection est recommandée
   */
  const shouldRedirectBasedOnRole = (currentPath: string): boolean => {
    // Si l'utilisateur admin est sur le dashboard normal, le rediriger vers le dashboard admin
    if (isAdmin() && currentPath === '/dashboard') {
      return true;
    }

    // Si un utilisateur non-admin essaie d'accéder au dashboard admin, il sera géré par AdminRouteGuard
    // Pas besoin de redirection ici

    return false;
  };

  return {
    getRedirectPath,
    shouldRedirectBasedOnRole
  };
};