import { useAuth } from '../contexts/AuthContext';
import type { UserRoleType, Permission, SubscriptionPlan } from '../types/auth';

/**
 * Hook pour gérer les permissions et rôles de manière simplifiée
 */
export const usePermissions = () => {
  const { user, roles, permissions, hasRole, hasPermission, isAdmin, getPlanLimits, getSubscription } = useAuth();
  const planLimits = getPlanLimits();
  const subscription = getSubscription();

  /**
   * Vérifie si l'utilisateur peut gérer les événements
   */
  const canManageEvents = () => {
    return hasRole('admin') || hasRole('host') || hasPermission('events', 'manage');
  };

  /**
   * Vérifie si l'utilisateur peut gérer les invitations
   */
  const canManageInvitations = () => {
    return hasRole('admin') || hasRole('host') || hasPermission('invitations', 'manage');
  };

  /**
   * Vérifie si l'utilisateur peut gérer les invités
   */
  const canManageGuests = () => {
    return hasRole('admin') || hasRole('host') || hasPermission('guests', 'manage');
  };

  /**
   * Vérifie si l'utilisateur peut voir les analytics
   */
  const canViewAnalytics = () => {
    return hasRole('admin') || hasPermission('analytics', 'view');
  };

  /**
   * Vérifie si l'utilisateur peut gérer d'autres utilisateurs
   */
  const canManageUsers = () => {
    return hasRole('admin') || hasPermission('users', 'manage');
  };

  /**
   * Vérifie si l'utilisateur peut accéder aux fonctionnalités premium
   */
  const canAccessPremium = () => {
    return hasRole('admin') ||
      subscription?.plan === 'premium' ||
      subscription?.plan === 'pro' ||
      hasPermission('premium', 'access');
  };

  /**
   * Vérifie si l'utilisateur peut créer un nouvel événement
   */
  const canCreateEvent = (currentEventsCount: number = 0) => {
    if (hasRole('admin')) return true;

    return planLimits.maxEvents === -1 || currentEventsCount < planLimits.maxEvents;
  };

  /**
   * Vérifie si l'utilisateur peut ajouter plus d'invités
   */
  const canAddGuests = (currentGuestsCount: number = 0) => {
    if (hasRole('admin')) return true;

    return planLimits.maxGuestsPerEvent === -1 || currentGuestsCount < planLimits.maxGuestsPerEvent;
  };

  /**
   * Vérifie si l'utilisateur peut créer plus d'invitations
   */
  const canCreateInvitation = (currentInvitationsCount: number = 0) => {
    if (hasRole('admin')) return true;

    return planLimits.maxInvitations === -1 || currentInvitationsCount < planLimits.maxInvitations;
  };

  /**
   * Vérifie si l'utilisateur peut utiliser un domaine personnalisé
   */
  const canUseCustomDomain = () => {
    if (hasRole('admin')) return true;

    return planLimits.canUseCustomDomain;
  };

  /**
   * Vérifie si l'utilisateur peut accéder aux analytics avancées
   */
  const canUseAdvancedAnalytics = () => {
    if (hasRole('admin')) return true;

    return planLimits.canUseAdvancedAnalytics;
  };

  /**
   * Vérifie si l'utilisateur peut exporter des données
   */
  const canExportData = () => {
    if (hasRole('admin')) return true;

    return planLimits.canExportData;
  };

  /**
   * Vérifie si l'utilisateur peut modifier un événement spécifique
   */
  const canEditEvent = (eventOwnerId: string) => {
    if (!user) return false;

    // Admin peut tout modifier
    if (hasRole('admin')) return true;

    // Propriétaire peut modifier son événement
    if (user.id === eventOwnerId) return true;

    // TODO: Ajouter la logique pour les collaborateurs
    return false;
  };

  /**
   * Vérifie si l'utilisateur peut voir un événement spécifique
   */
  const canViewEvent = (eventOwnerId: string, isPublic: boolean = false) => {
    if (!user) return isPublic;

    // Admin peut tout voir
    if (hasRole('admin')) return true;

    // Propriétaire peut voir son événement
    if (user.id === eventOwnerId) return true;

    // Événement public
    if (isPublic) return true;

    // TODO: Ajouter la logique pour les collaborateurs et invités
    return false;
  };

  /**
   * Obtient le niveau d'accès de l'utilisateur
   */
  const getAccessLevel = () => {
    if (hasRole('admin')) return 'admin';
    if (hasRole('host')) return 'host';
    if (hasRole('guest')) return 'guest';
    return 'none';
  };

  /**
   * Vérifie si l'utilisateur a un accès complet
   */
  const hasFullAccess = () => {
    return hasRole('admin');
  };

  /**
   * Vérifie si l'utilisateur a un accès limité (invité)
   */
  const hasLimitedAccess = () => {
    return hasRole('guest') && !hasRole('host') && !hasRole('admin');
  };

  return {
    // Données de base
    user,
    roles,
    permissions,

    // Fonctions de vérification de base
    hasRole,
    hasPermission,
    isAdmin,

    // Fonctions de vérification spécifiques
    canManageEvents,
    canManageInvitations,
    canManageGuests,
    canViewAnalytics,
    canManageUsers,
    canAccessPremium,
    canEditEvent,
    canViewEvent,

    // Fonctions de vérification des limites
    canCreateEvent,
    canAddGuests,
    canCreateInvitation,
    canUseCustomDomain,
    canUseAdvancedAnalytics,
    canExportData,

    // Utilitaires
    getAccessLevel,
    hasFullAccess,
    hasLimitedAccess,

    // Limites du plan
    planLimits,
  };
};