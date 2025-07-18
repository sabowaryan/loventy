import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour gérer le profil utilisateur
 */
export const useProfile = () => {
  const { user, updateProfile, refreshUserData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Met à jour le profil utilisateur
   */
  const handleUpdateProfile = async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    timezone?: string;
    language?: string;
  }) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await updateProfile(profileData);
      
      if (!result.success) {
        setUpdateError(result.error || 'Erreur lors de la mise à jour du profil');
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur inattendue lors de la mise à jour';
      setUpdateError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Rafraîchit les données du profil
   */
  const refreshProfile = async () => {
    try {
      await refreshUserData();
      setUpdateError(null);
    } catch (error: any) {
      setUpdateError(error.message || 'Erreur lors du rafraîchissement du profil');
    }
  };

  /**
   * Vérifie si le profil est complet
   */
  const isProfileComplete = () => {
    if (!user) return false;
    
    return !!(
      user.first_name &&
      user.last_name &&
      user.email &&
      user.email_verified
    );
  };

  /**
   * Obtient le nom complet de l'utilisateur
   */
  const getFullName = () => {
    if (!user) return '';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    return `${firstName} ${lastName}`.trim() || user.email || '';
  };

  /**
   * Obtient les initiales de l'utilisateur
   */
  const getInitials = () => {
    if (!user) return '';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '';
  };

  return {
    user,
    isUpdating,
    updateError,
    updateProfile: handleUpdateProfile,
    refreshProfile,
    isProfileComplete,
    getFullName,
    getInitials,
    clearError: () => setUpdateError(null),
  };
};