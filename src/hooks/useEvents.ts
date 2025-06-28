import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type?: string;
  location?: string;
  event_date: string;
  rsvp_deadline?: string;
  is_private: boolean;
  access_code?: string;
  password?: string;
  image_url?: string;
  cover_color?: string;
  created_at: string;
  updated_at: string;
}

interface UseEventsOptions {
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const { limit = 50, searchTerm, sortBy = 'event_date', sortOrder = 'asc' } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  // Charger les événements
  const loadEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire la requête
      let query = supabase
        .from('event_summary_view')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Recherche si un terme est spécifié
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`);
      }

      // Tri
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Limite
      query = query.limit(limit);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      setEvents(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  }, [user, limit, searchTerm, sortBy, sortOrder]);

  // Charger les événements au montage et quand les dépendances changent
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Créer un événement
  const createEvent = useCallback(async (eventData: Partial<Event>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('event')
        .insert({
          user_id: user.id,
          title: eventData.title || 'Nouvel événement',
          description: eventData.description || null,
          type: eventData.type || null,
          location: eventData.location || null,
          event_date: eventData.event_date || new Date().toISOString(),
          rsvp_deadline: eventData.rsvp_deadline || null,
          is_private: eventData.is_private !== undefined ? eventData.is_private : true,
          access_code: eventData.access_code || null,
          password: eventData.password || null,
          image_url: eventData.image_url || null,
          cover_color: eventData.cover_color || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Recharger les événements après création
      await loadEvents();
      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  }, [user, loadEvents]);

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('event')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Recharger les événements après suppression
      await loadEvents();
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      return false;
    }
  }, [user, loadEvents]);

  // Mettre à jour un événement
  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('event')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Recharger les événements après mise à jour
      await loadEvents();
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      return false;
    }
  }, [user, loadEvents]);

  // Vérifier si l'utilisateur peut créer un événement
  const canCreateEvent = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_event_limit', {
        user_uuid: user.id
      });

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error checking event limit:', err);
      return false;
    }
  }, [user]);

  return {
    events,
    isLoading,
    error,
    totalCount,
    refreshEvents: loadEvents,
    createEvent,
    deleteEvent,
    updateEvent,
    canCreateEvent
  };
};