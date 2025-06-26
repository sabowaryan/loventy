import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { InvitationDesignSettings } from '../types/models';
import { defaultDesignSettings } from '../utils/designConstants';
import { useAuth } from '../contexts/AuthContext';

interface UseInvitationDesignProps {
  invitationId: string;
  initialDesignSettings?: Partial<InvitationDesignSettings>;
}

export const useInvitationDesign = ({ invitationId, initialDesignSettings }: UseInvitationDesignProps) => {
  const [designSettings, setDesignSettings] = useState<InvitationDesignSettings>({
    ...defaultDesignSettings,
    ...initialDesignSettings
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  // Load design settings from database
  const loadDesignSettings = useCallback(async () => {
    if (!invitationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('design_settings')
        .eq('id', invitationId)
        .single();

      if (error) throw error;

      if (data?.design_settings) {
        setDesignSettings({
          ...defaultDesignSettings,
          ...data.design_settings
        });
      }
    } catch (err) {
      console.error('Error loading design settings:', err);
      setError('Impossible de charger les paramètres de design');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // Save design settings to database
  const saveDesignSettings = useCallback(async (newSettings?: InvitationDesignSettings) => {
    if (!invitationId) return;

    const settingsToSave = newSettings || designSettings;
    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('invitations')
        .update({ 
          design_settings: settingsToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving design settings:', err);
      setError('Impossible de sauvegarder les paramètres de design');
      return false;
    } finally {
      setIsSaving(false);
    }

    return true;
  }, [invitationId, designSettings]);

  // Update design settings
  const updateDesignSettings = useCallback((newSettings: Partial<InvitationDesignSettings>) => {
    setDesignSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Handle image upload
  const uploadImage = useCallback(async (sectionId: string, imageType: 'background' | 'couple', file: File): Promise<string> => {
    if (!invitationId) {
      throw new Error('ID d\'invitation non défini');
    }
    if (!user) { 
      throw new Error('Utilisateur non authentifié');
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate a unique file name
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `${user.id}/${invitationId}/${sectionId}-${imageType}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invitation-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('invitation-media')
        .getPublicUrl(filePath);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      // Create an entry in user_files table
      await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          invitation_id: invitationId,
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          file_url: urlData.publicUrl,
          is_public: true
        });
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Impossible de télécharger l\'image');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [invitationId, user]);

  return {
    designSettings,
    isLoading,
    isSaving,
    error,
    isUploading,
    loadDesignSettings,
    saveDesignSettings,
    updateDesignSettings,
    uploadImage
  };
};