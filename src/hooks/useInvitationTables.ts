import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InvitationTable, TableDetails, GuestDetails } from '../types/models';

export const useInvitationTables = (invitationId: string) => {
  const [tables, setTables] = useState<TableDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les tables
  const loadTables = useCallback(async () => {
    if (!invitationId) {
      setTables([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('table_details')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('name', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Impossible de charger les tables');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // Charger les tables au montage et quand l'invitation change
  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Créer une table
  const createTable = useCallback(async (tableData: Partial<InvitationTable>) => {
    try {
      const { data, error } = await supabase
        .from('invitation_tables')
        .insert({
          invitation_id: invitationId,
          name: tableData.name || 'Nouvelle table',
          description: tableData.description || '',
          capacity: tableData.capacity || 8,
          is_vip: tableData.is_vip || false,
          location_description: tableData.location_description || '',
          notes: tableData.notes || ''
        })
        .select()
        .single();

      if (error) throw error;
      await loadTables();
      return data;
    } catch (err) {
      console.error('Error creating table:', err);
      throw err;
    }
  }, [invitationId, loadTables]);

  // Mettre à jour une table
  const updateTable = useCallback(async (tableId: string, tableData: Partial<InvitationTable>) => {
    try {
      const { data, error } = await supabase
        .from('invitation_tables')
        .update(tableData)
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      await loadTables();
      return data;
    } catch (err) {
      console.error('Error updating table:', err);
      throw err;
    }
  }, [loadTables]);

  // Supprimer une table
  const deleteTable = useCallback(async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('invitation_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
      await loadTables();
      return true;
    } catch (err) {
      console.error('Error deleting table:', err);
      throw err;
    }
  }, [loadTables]);

  // Obtenir les invités d'une table
  const getTableGuests = useCallback(async (tableId: string): Promise<GuestDetails[]> => {
    try {
      const { data, error } = await supabase.rpc('get_table_guests', {
        table_uuid: tableId
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading table guests:', err);
      throw err;
    }
  }, []);

  // Assigner un invité à une table
  const assignGuestToTable = useCallback(async (guestId: string, tableId: string) => {
    try {
      // Vérifier si l'invité a déjà des informations étendues
      const { data: existingData, error: checkError } = await supabase
        .from('invitation_guests_extended')
        .select('id')
        .eq('guest_id', guestId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData) {
        // Mettre à jour les informations existantes
        const { error } = await supabase
          .from('invitation_guests_extended')
          .update({ table_id: tableId })
          .eq('guest_id', guestId);

        if (error) throw error;
      } else {
        // Créer de nouvelles informations étendues
        const { error } = await supabase
          .from('invitation_guests_extended')
          .insert({
            guest_id: guestId,
            table_id: tableId,
            guest_type: 'solo' // Valeur par défaut
          });

        if (error) throw error;
      }

      await loadTables();
      return true;
    } catch (err) {
      console.error('Error assigning guest to table:', err);
      throw err;
    }
  }, [loadTables]);

  // Retirer un invité d'une table
  const removeGuestFromTable = useCallback(async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('invitation_guests_extended')
        .update({ table_id: null })
        .eq('guest_id', guestId);

      if (error) throw error;
      await loadTables();
      return true;
    } catch (err) {
      console.error('Error removing guest from table:', err);
      throw err;
    }
  }, [loadTables]);

  return {
    tables,
    isLoading,
    error,
    refreshTables: loadTables,
    createTable,
    updateTable,
    deleteTable,
    getTableGuests,
    assignGuestToTable,
    removeGuestFromTable
  };
};