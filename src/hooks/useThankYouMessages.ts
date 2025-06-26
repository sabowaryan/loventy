import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InvitationThankYou } from '../types/models';

export const useThankYouMessages = (invitationId: string) => {
  const [messages, setMessages] = useState<InvitationThankYou[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!invitationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('invitation_thank_you')
        .select(`
          *,
          guests (
            name,
            email
          )
        `)
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading thank you messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // Charger les messages au montage et quand l'invitation change
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Ajouter un message
  const addMessage = useCallback(async (messageData: Partial<InvitationThankYou>) => {
    if (!invitationId) {
      throw new Error('ID d\'invitation non défini');
    }

    try {
      const { data, error } = await supabase
        .from('invitation_thank_you')
        .insert({
          invitation_id: invitationId,
          guest_id: messageData.guest_id || null,
          message: messageData.message || '',
          author_name: messageData.author_name || null,
          author_email: messageData.author_email || null,
          is_public: messageData.is_public !== undefined ? messageData.is_public : true,
          is_approved: messageData.is_approved !== undefined ? messageData.is_approved : true
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadMessages();
      return data;
    } catch (err) {
      console.error('Error adding thank you message:', err);
      throw err;
    }
  }, [invitationId, loadMessages]);

  // Approuver ou rejeter un message
  const updateMessageApproval = useCallback(async (messageId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('invitation_thank_you')
        .update({ is_approved: isApproved })
        .eq('id', messageId);

      if (error) throw error;
      
      await loadMessages();
      return true;
    } catch (err) {
      console.error('Error updating message approval:', err);
      throw err;
    }
  }, [loadMessages]);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('invitation_thank_you')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      await loadMessages();
      return true;
    } catch (err) {
      console.error('Error deleting thank you message:', err);
      throw err;
    }
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    refreshMessages: loadMessages,
    addMessage,
    updateMessageApproval,
    deleteMessage
  };
};