import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GuestDetails } from '../types/models';

export const useInvitationGuests = (invitationId?: string) => {
  const [guests, setGuests] = useState<GuestDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les invités
  const loadGuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('guest_details')
        .select('*')
        .order('name', { ascending: true });
      
      // Si un ID d'invitation est fourni, filtrer par cet ID
      if (invitationId) {
        query = query.eq('invitation_id', invitationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGuests(data || []);
    } catch (err) {
      console.error('Error loading guests:', err);
      setError('Impossible de charger les invités');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // Charger les invités au montage et quand l'invitation change
  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  // Créer un invité avec informations étendues
  const createGuest = useCallback(async (guestData: Partial<GuestDetails>) => {
    if (!guestData.invitation_id) {
      throw new Error('ID d\'invitation non défini');
    }

    try {
      // Créer l'invité de base
      const { data: guestBase, error: guestError } = await supabase
        .from('guests')
        .insert({
          invitation_id: guestData.invitation_id,
          user_id: guestData.user_id,
          name: guestData.name || '',
          email: guestData.email || '',
          phone: guestData.phone || null,
          status: guestData.status || 'pending'
        })
        .select()
        .single();

      if (guestError) throw guestError;

      // Créer les informations étendues
      const { error: extendedError } = await supabase
        .from('invitation_guests_extended')
        .insert({
          guest_id: guestBase.id,
          guest_type: guestData.guest_type || 'solo',
          dietary_restrictions: guestData.dietary_restrictions || null,
          plus_one: guestData.plus_one || false,
          plus_one_name: guestData.plus_one_name || null,
          plus_one_email: guestData.plus_one_email || null,
          plus_one_phone: guestData.plus_one_phone || null,
          whatsapp_number: guestData.whatsapp_number || null,
          telegram_username: guestData.telegram_username || null,
          age_group: guestData.age_group || null,
          relationship: guestData.relationship || null,
          side: guestData.side || null,
          gift_registry_contribution: guestData.gift_registry_contribution || false,
          gift_description: guestData.gift_description || null,
          additional_notes: guestData.additional_notes || null
        });

      if (extendedError) throw extendedError;

      await loadGuests();
      return guestBase;
    } catch (err) {
      console.error('Error creating guest:', err);
      throw err;
    }
  }, [loadGuests]);

  // Mettre à jour un invité avec informations étendues
  const updateGuest = useCallback(async (guestId: string, guestData: Partial<GuestDetails>) => {
    try {
      // Mettre à jour l'invité de base
      const baseUpdate: any = {};
      if (guestData.name !== undefined) baseUpdate.name = guestData.name;
      if (guestData.email !== undefined) baseUpdate.email = guestData.email;
      if (guestData.phone !== undefined) baseUpdate.phone = guestData.phone;
      if (guestData.status !== undefined) baseUpdate.status = guestData.status;
      if (guestData.response_message !== undefined) baseUpdate.response_message = guestData.response_message;

      if (Object.keys(baseUpdate).length > 0) {
        const { error: baseError } = await supabase
          .from('guests')
          .update(baseUpdate)
          .eq('id', guestId);

        if (baseError) throw baseError;
      }

      // Mettre à jour les informations étendues
      const extendedUpdate: any = {};
      if (guestData.guest_type !== undefined) extendedUpdate.guest_type = guestData.guest_type;
      if (guestData.dietary_restrictions !== undefined) extendedUpdate.dietary_restrictions = guestData.dietary_restrictions;
      if (guestData.plus_one !== undefined) extendedUpdate.plus_one = guestData.plus_one;
      if (guestData.plus_one_name !== undefined) extendedUpdate.plus_one_name = guestData.plus_one_name;
      if (guestData.plus_one_email !== undefined) extendedUpdate.plus_one_email = guestData.plus_one_email;
      if (guestData.plus_one_phone !== undefined) extendedUpdate.plus_one_phone = guestData.plus_one_phone;
      if (guestData.whatsapp_number !== undefined) extendedUpdate.whatsapp_number = guestData.whatsapp_number;
      if (guestData.telegram_username !== undefined) extendedUpdate.telegram_username = guestData.telegram_username;
      if (guestData.age_group !== undefined) extendedUpdate.age_group = guestData.age_group;
      if (guestData.relationship !== undefined) extendedUpdate.relationship = guestData.relationship;
      if (guestData.side !== undefined) extendedUpdate.side = guestData.side;
      if (guestData.gift_registry_contribution !== undefined) extendedUpdate.gift_registry_contribution = guestData.gift_registry_contribution;
      if (guestData.gift_description !== undefined) extendedUpdate.gift_description = guestData.gift_description;
      if (guestData.additional_notes !== undefined) extendedUpdate.additional_notes = guestData.additional_notes;

      if (Object.keys(extendedUpdate).length > 0) {
        // Vérifier si l'invité a déjà des informations étendues
        const { data: existingData, error: checkError } = await supabase
          .from('invitation_guests_extended')
          .select('id')
          .eq('guest_id', guestId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingData) {
          // Mettre à jour les informations existantes
          const { error: extendedError } = await supabase
            .from('invitation_guests_extended')
            .update(extendedUpdate)
            .eq('guest_id', guestId);

          if (extendedError) throw extendedError;
        } else {
          // Créer de nouvelles informations étendues
          const { error: extendedError } = await supabase
            .from('invitation_guests_extended')
            .insert({
              guest_id: guestId,
              ...extendedUpdate
            });

          if (extendedError) throw extendedError;
        }
      }

      await loadGuests();
      return true;
    } catch (err) {
      console.error('Error updating guest:', err);
      throw err;
    }
  }, [loadGuests]);

  // Supprimer un invité
  const deleteGuest = useCallback(async (guestId: string) => {
    try {
      // La suppression en cascade supprimera automatiquement les informations étendues
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;
      
      await loadGuests();
      return true;
    } catch (err) {
      console.error('Error deleting guest:', err);
      throw err;
    }
  }, [loadGuests]);

  // Importer des invités en masse
  const importGuests = useCallback(async (guestsData: Partial<GuestDetails>[], invitationId: string) => {
    if (!invitationId) {
      throw new Error('ID d\'invitation non défini');
    }

    try {
      // Récupérer l'ID de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Créer les invités de base
      const baseGuests = guestsData.map(guest => ({
        invitation_id: invitationId,
        user_id: user.id,
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || null,
        status: guest.status || 'pending'
      }));

      const { data: createdGuests, error: baseError } = await supabase
        .from('guests')
        .insert(baseGuests)
        .select();

      if (baseError) throw baseError;

      // Créer les informations étendues pour chaque invité
      if (createdGuests && createdGuests.length > 0) {
        const extendedGuests = createdGuests.map((guest, index) => ({
          guest_id: guest.id,
          guest_type: guestsData[index].guest_type || 'solo',
          dietary_restrictions: guestsData[index].dietary_restrictions || null,
          plus_one: guestsData[index].plus_one || false,
          plus_one_name: guestsData[index].plus_one_name || null,
          plus_one_email: guestsData[index].plus_one_email || null,
          plus_one_phone: guestsData[index].plus_one_phone || null,
          whatsapp_number: guestsData[index].whatsapp_number || null,
          telegram_username: guestsData[index].telegram_username || null,
          age_group: guestsData[index].age_group || null,
          relationship: guestsData[index].relationship || null,
          side: guestsData[index].side || null
        }));

        const { error: extendedError } = await supabase
          .from('invitation_guests_extended')
          .insert(extendedGuests);

        if (extendedError) throw extendedError;
      }

      await loadGuests();
      return createdGuests;
    } catch (err) {
      console.error('Error importing guests:', err);
      throw err;
    }
  }, [loadGuests]);

  // Obtenir les statistiques des invités
  const getGuestStats = useCallback(() => {
    const total = guests.length;
    const confirmed = guests.filter(g => g.status === 'confirmed').length;
    const pending = guests.filter(g => g.status === 'pending').length;
    const declined = guests.filter(g => g.status === 'declined').length;
    
    const confirmationRate = total > 0 
      ? Math.round(((confirmed + declined) / total) * 100) 
      : 0;
    
    const bySide = guests.reduce((acc, guest) => {
      const side = guest.side || 'Non spécifié';
      if (!acc[side]) {
        acc[side] = 0;
      }
      
      acc[side]++;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      confirmed,
      pending,
      declined,
      confirmationRate,
      bySide
    };
  }, [guests]);

  return {
    guests,
    isLoading,
    error,
    refreshGuests: loadGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests,
    getGuestStats
  };
};