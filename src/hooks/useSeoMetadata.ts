import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SeoMetadata {
  id?: string;
  page_path?: string;
  entity_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseSeoMetadataProps {
  pagePath?: string;
  entityId?: string;
}

export const useSeoMetadata = ({ pagePath, entityId }: UseSeoMetadataProps) => {
  const [metadata, setMetadata] = useState<SeoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!pagePath && !entityId) return;

      setIsLoading(true);
      setError(null);

      try {
        let query = supabase.from('seo_metadata').select('*');
        
        if (pagePath) {
          query = query.eq('page_path', pagePath);
        } else if (entityId) {
          query = query.eq('entity_id', entityId);
        }

        const { data, error: dbError } = await query.maybeSingle();

        if (dbError) {
          console.error('Database error fetching SEO metadata:', dbError);
          throw new Error(dbError.message);
        }

        setMetadata(data);
      } catch (err) {
        console.error('Error fetching SEO metadata:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [pagePath, entityId]);

  // Fallback function to generate default metadata if none is found
  const getDefaultMetadata = (): SeoMetadata => {
    const siteName = 'Loventy';
    const defaultTitle = 'Loventy - Invitations de mariage élégantes';
    const defaultDescription = 'Créez, personnalisez et envoyez des invitations de mariage électroniques élégantes. Suivez les RSVP en temps réel avec Loventy.';
    const defaultImageUrl = `${window.location.origin}/og-image.jpg`;
    
    return {
      meta_title: defaultTitle,
      meta_description: defaultDescription,
      meta_keywords: 'invitation mariage, faire-part électronique, RSVP en ligne, invitation digitale, mariage',
      canonical_url: window.location.href,
      og_title: defaultTitle,
      og_description: defaultDescription,
      og_image_url: defaultImageUrl
    };
  };

  // Combine fetched metadata with defaults for any missing fields
  const combinedMetadata = metadata 
    ? { ...getDefaultMetadata(), ...metadata }
    : getDefaultMetadata();

  return {
    metadata: combinedMetadata,
    isLoading,
    error
  };
};