import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from './usePlanLimits';

interface CreateInvitationData {
  title: string;
  templateId: string;
  brideName?: string;
  groomName?: string;
  date?: string;
  venue?: string;
}

export const useCreateInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { checkLimit, getLimitMessage, refreshLimits } = usePlanLimits();
  const navigate = useNavigate();

  const createInvitation = async (data: CreateInvitationData) => {
    if (!user) {
      setError('Vous devez être connecté pour créer une invitation');
      return null;
    }

    // Vérifier les limites avant de créer
    if (!checkLimit('invitation')) {
      setError(getLimitMessage('invitation'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Utiliser la fonction RPC pour créer l'invitation à partir du modèle
      const { data: invitation, error: createError } = await supabase.rpc(
        'create_invitation_from_template',
        {
          user_uuid: user.id,
          template_uuid: data.templateId,
          invitation_title: data.title,
          bride_name: data.brideName || null,
          groom_name: data.groomName || null,
          event_date: data.date || null,
          venue: data.venue || null
        }
      );

      if (createError) {
        throw createError;
      }

      // Rafraîchir les limites après création
      refreshLimits();

      // Rediriger vers l'éditeur
      navigate(`/editor/${invitation}`);
      
      return invitation;
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'invitation');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInvitation,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};