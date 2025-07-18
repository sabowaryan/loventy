import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { AdminUserDetails } from '../types/auth';

/**
 * Hook pour les fonctionnalités d'administration
 */
export const useAdmin = () => {
  const { hasRole, hasPermission, terminateSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Vérifie si l'utilisateur a les permissions d'admin
   */
  const isAdmin = () => {
    return hasRole('admin') || hasPermission('users', 'manage');
  };

  /**
   * Suspend un utilisateur
   */
  const suspendUser = useCallback(async (userId: string, reason: string) => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_suspend_user', {
        p_user_id: userId,
        p_reason: reason
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la suspension';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Lève la suspension d'un utilisateur
   */
  const unsuspendUser = useCallback(async (userId: string) => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_unsuspend_user', {
        p_user_id: userId
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la levée de suspension';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Obtient la vue d'ensemble d'un utilisateur pour l'admin
   */
  const getUserOverview = useCallback(async (userId: string): Promise<AdminUserDetails | null> => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_admin_user_overview', {
        p_user_id: userId
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data) {
        return null;
      }

      // Convertir les données de la base vers le type AdminUserDetails
      const overview: AdminUserDetails = {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        timezone: data.timezone || 'UTC',
        language: data.language || 'fr',
        is_active: data.is_active !== false,
        email_verified: data.email_verified || false,
        phone_verified: data.phone_verified || false,
        last_login_at: data.last_login_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        roles: [], // Would need to be populated from roles data
        primary_role: 'host', // Would need to be determined from roles
        subscription: {
          plan: 'free',
          status: data.subscription_status || 'active',
          started_at: data.created_at,
          max_events: 1,
          max_guests_per_event: 50,
          max_storage_mb: 100,
          features: {
            custom_templates: false,
            analytics: false,
            qr_codes: true,
            email_invitations: true,
            custom_domain: false,
            priority_support: false,
          },
          limits: {
            max_events: 1,
            max_guests_per_event: 50,
            max_storage_mb: 100,
            features: {
              custom_templates: false,
              analytics: false,
              qr_codes: true,
              email_invitations: true,
              custom_domain: false,
              priority_support: false,
            }
          }
        },
        permissions: [], // Would need to be populated from permissions data
        status: data.is_suspended ? 'suspended' : 'active',
        events_count: data.events_count || 0,
        guests_count: data.guests_count || 0,
        events_last_30_days: data.events_last_30_days || 0,
        guests_last_30_days: data.guests_last_30_days || 0,
        storage_used_bytes: data.storage_used_bytes || 0,
        subscription_status: data.subscription_status || 'active',
        current_period_end: data.current_period_end,
        suspension_reason: data.suspension_reason,
        is_suspended: data.is_suspended || false,
      };

      return overview;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des données utilisateur';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Obtient la liste des utilisateurs avec pagination
   */
  const getUsers = useCallback(async (page: number = 0, limit: number = 20) => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError, count } = await supabase
        .from('admin_user_overview')
        .select('*', { count: 'exact' })
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      return {
        users: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > (page + 1) * limit
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des utilisateurs';
      setError(errorMessage);
      return { users: [], totalCount: 0, hasMore: false };
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Recherche des utilisateurs
   */
  const searchUsers = useCallback(async (query: string, limit: number = 20) => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('admin_user_overview')
        .select('*')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      return data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la recherche';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Obtient les statistiques globales
   */
  const getGlobalStats = useCallback(async () => {
    if (!isAdmin()) {
      throw new Error('Permission insuffisante - Admin requis');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Requêtes parallèles pour les statistiques
      const [usersResult, eventsResult, guestsResult] = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('guests').select('id', { count: 'exact', head: true })
      ]);

      const stats = {
        totalUsers: usersResult.status === 'fulfilled' ? usersResult.value.count || 0 : 0,
        totalEvents: eventsResult.status === 'fulfilled' ? eventsResult.value.count || 0 : 0,
        totalGuests: guestsResult.status === 'fulfilled' ? guestsResult.value.count || 0 : 0,
      };

      return stats;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      return { totalUsers: 0, totalEvents: 0, totalGuests: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  return {
    // État
    isLoading,
    error,

    // Actions utilisateur
    suspendUser,
    unsuspendUser,
    getUserOverview,
    getUsers,
    searchUsers,

    // Sessions
    terminateSession,

    // Statistiques
    getGlobalStats,

    // Utilitaires
    clearError: () => setError(null),
    isAdmin: isAdmin(),
  };
};