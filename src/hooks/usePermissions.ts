import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, hasPermission, hasRole } = useAuth();

  // Permissions spécifiques pour l'application
  const canCreateInvitations = () => hasPermission('invitations.create');
  const canEditInvitations = () => hasPermission('invitations.update');
  const canDeleteInvitations = () => hasPermission('invitations.delete');
  const canSendInvitations = () => hasPermission('invitations.send');
  
  const canManageGuests = () => hasPermission('guests.create') && hasPermission('guests.update');
  const canExportGuests = () => hasPermission('guests.export');
  const canImportGuests = () => hasPermission('guests.import');
  
  const canAccessPremiumTemplates = () => hasPermission('templates.premium');
  const canCreateCustomTemplates = () => hasPermission('templates.create');
  
  const canViewAnalytics = () => hasPermission('analytics.read');
  const canViewAdvancedAnalytics = () => hasPermission('analytics.advanced');
  
  const canManageUsers = () => hasPermission('users.manage_roles');
  const canAccessSystemSettings = () => hasPermission('system.admin');
  
  // Vérifications de rôles
  const isAdmin = () => hasRole('admin');
  const isPremiumUser = () => hasRole('premium');
  const isRegularUser = () => hasRole('user');
  
  return {
    permissions,
    hasPermission,
    hasRole,
    // Permissions spécifiques
    canCreateInvitations,
    canEditInvitations,
    canDeleteInvitations,
    canSendInvitations,
    canManageGuests,
    canExportGuests,
    canImportGuests,
    canAccessPremiumTemplates,
    canCreateCustomTemplates,
    canViewAnalytics,
    canViewAdvancedAnalytics,
    canManageUsers,
    canAccessSystemSettings,
    // Rôles
    isAdmin,
    isPremiumUser,
    isRegularUser,
  };
};