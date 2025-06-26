import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { InvitationDetails } from '../types/models';

interface UseInvitationsOptions {
  limit?: number;
  status?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useInvitations = (options: UseInvitationsOptions = {}) => {
  const { limit = 50, status, searchTerm, sortBy = 'created_at', sortOrder = 'desc' } = options;
  const [invitations, setInvitations] = useState<InvitationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  // Charger les invitations
  const loadInvitations = useCallback(async () => {
    if (!user) {
      setInvitations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire la requête
      let query = supabase
        .from('invitation_details')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Filtrer par statut si spécifié
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Recherche si un terme est spécifié
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,bride_name.ilike.%${searchTerm}%,groom_name.ilike.%${searchTerm}%,venue.ilike.%${searchTerm}%`);
      }

      // Tri
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Limite
      query = query.limit(limit);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      setInvitations(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading invitations:', err);
      setError('Impossible de charger les invitations');
    } finally {
      setIsLoading(false);
    }
  }, [user, limit, status, searchTerm, sortBy, sortOrder]);

  // Charger les invitations au montage et quand les dépendances changent
  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // Supprimer une invitation
  const deleteInvitation = useCallback(async (invitationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Recharger les invitations après suppression
      await loadInvitations();
      return true;
    } catch (err) {
      console.error('Error deleting invitation:', err);
      setError('Impossible de supprimer l\'invitation');
      return false;
    }
  }, [user, loadInvitations]);

  // Dupliquer une invitation
  const duplicateInvitation = useCallback(async (invitationId: string, newTitle?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc(
        'duplicate_invitation',
        {
          invitation_uuid: invitationId,
          new_title: newTitle
        }
      );

      if (error) throw error;
      
      // Recharger les invitations après duplication
      await loadInvitations();
      return data;
    } catch (err) {
      console.error('Error duplicating invitation:', err);
      setError('Impossible de dupliquer l\'invitation');
      return null;
    }
  }, [user, loadInvitations]);

  // Mettre à jour le statut d'une invitation
  const updateInvitationStatus = useCallback(async (invitationId: string, status: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invitationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Recharger les invitations après mise à jour
      await loadInvitations();
      return true;
    } catch (err) {
      console.error('Error updating invitation status:', err);
      setError('Impossible de mettre à jour le statut de l\'invitation');
      return false;
    }
  }, [user, loadInvitations]);

  return {
    invitations,
    isLoading,
    error,
    totalCount,
    refreshInvitations: loadInvitations,
    deleteInvitation,
    duplicateInvitation,
    updateInvitationStatus
  };
};