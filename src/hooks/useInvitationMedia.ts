import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InvitationMedia, MediaDetails } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

export const useInvitationMedia = (invitationId: string) => {
  const [media, setMedia] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les médias
  const loadMedia = useCallback(async () => {
    if (!invitationId || !user) {
      setMedia([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('media_details')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMedia(data || []);
    } catch (err) {
      console.error('Error loading media:', err);
      setError('Impossible de charger les médias');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId, user]);

  // Charger les médias au montage et quand l'invitation change
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Ajouter un média
  const addMedia = useCallback(async (mediaData: Partial<InvitationMedia>, file?: File) => {
    if (!invitationId || !user) {
      throw new Error('Utilisateur ou invitation non défini');
    }

    try {
      let fileId = null;
      let fileUrl = null;

      // Si un fichier est fourni, l'uploader d'abord
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/${invitationId}/${fileName}`;
        
        // Upload du fichier
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invitation-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Créer l'entrée dans user_files
        const { data: fileData, error: fileError } = await supabase
          .from('user_files')
          .insert({
            user_id: user.id,
            invitation_id: invitationId,
            file_name: fileName,
            file_type: file.type,
            file_size: file.size,
            file_path: filePath
          })
          .select()
          .single();

        if (fileError) throw fileError;
        
        fileId = fileData.id;
        
        // Obtenir l'URL publique
        const { data: urlData } = await supabase.storage
          .from('invitation-media')
          .getPublicUrl(filePath);
        
        fileUrl = urlData.publicUrl;
        
        // Mettre à jour l'URL du fichier
        await supabase
          .from('user_files')
          .update({ file_url: fileUrl })
          .eq('id', fileId);
      }

      // Déterminer l'ordre d'affichage
      const { data: maxOrderData } = await supabase
        .from('invitation_media')
        .select('display_order')
        .eq('invitation_id', invitationId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order || 0) + 1 
        : 0;

      // Créer l'entrée média
      const { data, error } = await supabase
        .from('invitation_media')
        .insert({
          invitation_id: invitationId,
          user_id: user.id,
          media_type: mediaData.media_type || 'gallery',
          file_id: fileId,
          title: mediaData.title || '',
          description: mediaData.description || '',
          display_order: nextOrder,
          is_featured: mediaData.is_featured || false
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadMedia();
      return { ...data, file_url: fileUrl };
    } catch (err) {
      console.error('Error adding media:', err);
      throw err;
    }
  }, [invitationId, user, loadMedia]);

  // Mettre à jour un média
  const updateMedia = useCallback(async (mediaId: string, mediaData: Partial<InvitationMedia>, file?: File) => {
    if (!user) {
      throw new Error('Utilisateur non défini');
    }

    try {
      let fileId = mediaData.file_id;
      let fileUrl = null;

      // Si un fichier est fourni, l'uploader d'abord
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/${invitationId}/${fileName}`;
        
        // Upload du fichier
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invitation-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Créer l'entrée dans user_files
        const { data: fileData, error: fileError } = await supabase
          .from('user_files')
          .insert({
            user_id: user.id,
            invitation_id: invitationId,
            file_name: fileName,
            file_type: file.type,
            file_size: file.size,
            file_path: filePath
          })
          .select()
          .single();

        if (fileError) throw fileError;
        
        fileId = fileData.id;
        
        // Obtenir l'URL publique
        const { data: urlData } = await supabase.storage
          .from('invitation-media')
          .getPublicUrl(filePath);
        
        fileUrl = urlData.publicUrl;
        
        // Mettre à jour l'URL du fichier
        await supabase
          .from('user_files')
          .update({ file_url: fileUrl })
          .eq('id', fileId);
      }

      // Mettre à jour l'entrée média
      const { data, error } = await supabase
        .from('invitation_media')
        .update({
          media_type: mediaData.media_type,
          file_id: fileId,
          title: mediaData.title,
          description: mediaData.description,
          display_order: mediaData.display_order,
          is_featured: mediaData.is_featured
        })
        .eq('id', mediaId)
        .select()
        .single();

      if (error) throw error;
      
      await loadMedia();
      return { ...data, file_url: fileUrl };
    } catch (err) {
      console.error('Error updating media:', err);
      throw err;
    }
  }, [invitationId, user, loadMedia]);

  // Supprimer un média
  const deleteMedia = useCallback(async (mediaId: string) => {
    try {
      // Récupérer les informations du média
      const { data: mediaData, error: fetchError } = await supabase
        .from('invitation_media')
        .select('file_id')
        .eq('id', mediaId)
        .single();

      if (fetchError) throw fetchError;

      // Supprimer le média
      const { error } = await supabase
        .from('invitation_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      // Si un fichier est associé, récupérer son chemin
      if (mediaData.file_id) {
        const { data: fileData, error: fileError } = await supabase
          .from('user_files')
          .select('file_path')
          .eq('id', mediaData.file_id)
          .single();

        if (!fileError && fileData) {
          // Supprimer le fichier du stockage
          await supabase.storage
            .from('invitation-media')
            .remove([fileData.file_path]);
          
          // Supprimer l'entrée du fichier
          await supabase
            .from('user_files')
            .delete()
            .eq('id', mediaData.file_id);
        }
      }

      await loadMedia();
      return true;
    } catch (err) {
      console.error('Error deleting media:', err);
      throw err;
    }
  }, [loadMedia]);

  // Réordonner les médias
  const reorderMedia = useCallback(async (mediaIds: string[]) => {
    try {
      // Mettre à jour l'ordre d'affichage de chaque média
      const updates = mediaIds.map((id, index) => ({
        id,
        display_order: index
      }));

      const { error } = await supabase
        .from('invitation_media')
        .upsert(updates);

      if (error) throw error;
      
      await loadMedia();
      return true;
    } catch (err) {
      console.error('Error reordering media:', err);
      throw err;
    }
  }, [loadMedia]);

  return {
    media,
    isLoading,
    error,
    refreshMedia: loadMedia,
    addMedia,
    updateMedia,
    deleteMedia,
    reorderMedia
  };
};