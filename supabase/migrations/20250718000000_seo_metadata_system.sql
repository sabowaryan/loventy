-- Migration: SEO Metadata System
-- Description: Système complet de gestion des métadonnées SEO avec sécurité RLS
-- Date: 2025-07-18

-- =====================================================
-- 1. CRÉATION DE LA TABLE SEO_METADATA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identification de la page/entité
    page_path TEXT,
    entity_id UUID,
    entity_type TEXT CHECK (entity_type IN ('event', 'invitation', 'profile', 'page')),
    
    -- Métadonnées SEO de base
    meta_title TEXT NOT NULL CHECK (char_length(meta_title) <= 60),
    meta_description TEXT CHECK (char_length(meta_description) <= 160),
    meta_keywords TEXT CHECK (char_length(meta_keywords) <= 255),
    canonical_url TEXT,
    
    -- Open Graph métadonnées
    og_title TEXT CHECK (char_length(og_title) <= 60),
    og_description TEXT CHECK (char_length(og_description) <= 160),
    og_image_url TEXT,
    og_type TEXT DEFAULT 'website' CHECK (og_type IN ('website', 'article', 'profile', 'event')),
    
    -- Twitter Card métadonnées
    twitter_card TEXT DEFAULT 'summary_large_image' CHECK (twitter_card IN ('summary', 'summary_large_image', 'app', 'player')),
    twitter_title TEXT CHECK (char_length(twitter_title) <= 70),
    twitter_description TEXT CHECK (char_length(twitter_description) <= 200),
    twitter_image_url TEXT,
    
    -- Métadonnées techniques
    robots TEXT DEFAULT 'index,follow' CHECK (robots ~ '^(index|noindex),(follow|nofollow)$'),
    priority DECIMAL(2,1) DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
    change_frequency TEXT DEFAULT 'monthly' CHECK (change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
    
    -- Localisation
    language_code TEXT DEFAULT 'fr' CHECK (char_length(language_code) = 2),
    region_code TEXT CHECK (char_length(region_code) = 2),
    
    -- Audit et propriété
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Contraintes d'unicité
    CONSTRAINT unique_page_path UNIQUE (page_path),
    CONSTRAINT unique_entity_seo UNIQUE (entity_id, entity_type),
    CONSTRAINT page_or_entity_required CHECK (
        (page_path IS NOT NULL AND entity_id IS NULL) OR 
        (page_path IS NULL AND entity_id IS NOT NULL)
    )
);

-- =====================================================
-- 2. INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les recherches par page_path
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_path 
ON public.seo_metadata(page_path) 
WHERE page_path IS NOT NULL;

-- Index pour les recherches par entity_id
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_id 
ON public.seo_metadata(entity_id) 
WHERE entity_id IS NOT NULL;

-- Index composite pour entity_id + entity_type
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_composite 
ON public.seo_metadata(entity_id, entity_type) 
WHERE entity_id IS NOT NULL;

-- Index pour les timestamps (pour les requêtes de tri)
CREATE INDEX IF NOT EXISTS idx_seo_metadata_updated_at 
ON public.seo_metadata(updated_at DESC);

-- Index pour la langue (pour les requêtes multilingues)
CREATE INDEX IF NOT EXISTS idx_seo_metadata_language 
ON public.seo_metadata(language_code);

-- =====================================================
-- 3. FONCTION DE MISE À JOUR AUTOMATIQUE DU TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_seo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour la mise à jour automatique
CREATE TRIGGER trigger_update_seo_metadata_updated_at
    BEFORE UPDATE ON public.seo_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_metadata_updated_at();

-- =====================================================
-- 4. FONCTION DE VALIDATION DES URLs
-- =====================================================

CREATE OR REPLACE FUNCTION validate_seo_urls()
RETURNS TRIGGER AS $$
BEGIN
    -- Validation des URLs (format basique)
    IF NEW.canonical_url IS NOT NULL AND NEW.canonical_url !~ '^https?://' THEN
        RAISE EXCEPTION 'canonical_url doit être une URL valide commençant par http:// ou https://';
    END IF;
    
    IF NEW.og_image_url IS NOT NULL AND NEW.og_image_url !~ '^https?://' THEN
        RAISE EXCEPTION 'og_image_url doit être une URL valide commençant par http:// ou https://';
    END IF;
    
    IF NEW.twitter_image_url IS NOT NULL AND NEW.twitter_image_url !~ '^https?://' THEN
        RAISE EXCEPTION 'twitter_image_url doit être une URL valide commençant par http:// ou https://';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger de validation
CREATE TRIGGER trigger_validate_seo_urls
    BEFORE INSERT OR UPDATE ON public.seo_metadata
    FOR EACH ROW
    EXECUTE FUNCTION validate_seo_urls();

-- =====================================================
-- 5. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur la table
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique des métadonnées SEO
CREATE POLICY "Lecture publique des métadonnées SEO"
ON public.seo_metadata
FOR SELECT
TO public
USING (true);

-- Politique pour les administrateurs (lecture/écriture complète)
CREATE POLICY "Administrateurs peuvent tout faire sur SEO"
ON public.seo_metadata
FOR ALL
TO authenticated
USING (
    has_user_role('super_admin') OR has_user_role('admin')
);

-- Politique pour les propriétaires d'événements (peuvent gérer leurs métadonnées)
CREATE POLICY "Propriétaires peuvent gérer leurs métadonnées SEO"
ON public.seo_metadata
FOR ALL
TO authenticated
USING (
    -- Pour les entités liées à des événements
    (entity_type = 'event' AND EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = seo_metadata.entity_id 
        AND events.owner_id = auth.uid()
    ))
    OR
    -- Pour les entités liées à des invitations
    (entity_type = 'invitation' AND EXISTS (
        SELECT 1 FROM public.invitations i
        JOIN public.events e ON i.event_id = e.id
        WHERE i.id = seo_metadata.entity_id 
        AND e.owner_id = auth.uid()
    ))
    OR
    -- Pour les profils utilisateur
    (entity_type = 'profile' AND entity_id::text = auth.uid()::text)
    OR
    -- Pour les métadonnées créées par l'utilisateur
    created_by = auth.uid()
);

-- =====================================================
-- 6. FONCTIONS UTILITAIRES POUR LE SEO
-- =====================================================

-- Fonction pour générer des métadonnées par défaut
CREATE OR REPLACE FUNCTION generate_default_seo_metadata(
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_page_path TEXT DEFAULT NULL,
    p_language_code TEXT DEFAULT 'fr'
)
RETURNS JSON AS $$
DECLARE
    default_metadata JSON;
    site_name TEXT := 'Loventy';
    base_url TEXT := 'https://loventy.com';
BEGIN
    -- Génération des métadonnées par défaut selon le type
    CASE p_entity_type
        WHEN 'event' THEN
            SELECT json_build_object(
                'meta_title', COALESCE(e.title, 'Événement') || ' - ' || site_name,
                'meta_description', 'Découvrez les détails de cet événement spécial sur ' || site_name,
                'og_title', COALESCE(e.title, 'Événement') || ' - ' || site_name,
                'og_description', 'Découvrez les détails de cet événement spécial sur ' || site_name,
                'og_type', 'event'
            ) INTO default_metadata
            FROM public.events e WHERE e.id = p_entity_id;
            
        WHEN 'invitation' THEN
            SELECT json_build_object(
                'meta_title', 'Invitation - ' || COALESCE(e.title, 'Événement') || ' - ' || site_name,
                'meta_description', 'Vous êtes invité(e) à un événement spécial. Consultez votre invitation sur ' || site_name,
                'og_title', 'Invitation - ' || COALESCE(e.title, 'Événement'),
                'og_description', 'Vous êtes invité(e) à un événement spécial',
                'og_type', 'website'
            ) INTO default_metadata
            FROM public.invitations i
            JOIN public.events e ON i.event_id = e.id
            WHERE i.id = p_entity_id;
            
        ELSE
            default_metadata := json_build_object(
                'meta_title', site_name || ' - Invitations de mariage élégantes',
                'meta_description', 'Créez, personnalisez et envoyez des invitations de mariage électroniques élégantes. Suivez les RSVP en temps réel.',
                'og_title', site_name || ' - Invitations de mariage élégantes',
                'og_description', 'Créez, personnalisez et envoyez des invitations de mariage électroniques élégantes',
                'og_type', 'website'
            );
    END CASE;
    
    -- Ajouter les métadonnées communes
    default_metadata := default_metadata || json_build_object(
        'meta_keywords', 'invitation mariage, faire-part électronique, RSVP en ligne, invitation digitale, mariage',
        'canonical_url', base_url || COALESCE(p_page_path, ''),
        'og_image_url', base_url || '/og-image.jpg',
        'language_code', p_language_code,
        'robots', 'index,follow',
        'priority', 0.5,
        'change_frequency', 'monthly'
    );
    
    RETURN default_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FONCTION POUR OBTENIR LES MÉTADONNÉES AVEC FALLBACK
-- =====================================================

CREATE OR REPLACE FUNCTION get_seo_metadata_with_fallback(
    p_page_path TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_language_code TEXT DEFAULT 'fr'
)
RETURNS TABLE (
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    og_type TEXT,
    twitter_card TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image_url TEXT,
    robots TEXT,
    language_code TEXT
) AS $$
DECLARE
    existing_metadata RECORD;
    default_metadata JSON;
BEGIN
    -- Chercher les métadonnées existantes
    IF p_page_path IS NOT NULL THEN
        SELECT * INTO existing_metadata 
        FROM public.seo_metadata 
        WHERE page_path = p_page_path 
        LIMIT 1;
    ELSIF p_entity_id IS NOT NULL THEN
        SELECT * INTO existing_metadata 
        FROM public.seo_metadata 
        WHERE entity_id = p_entity_id 
        LIMIT 1;
    END IF;
    
    -- Si pas de métadonnées existantes, générer les valeurs par défaut
    IF existing_metadata IS NULL THEN
        default_metadata := generate_default_seo_metadata(
            COALESCE(p_entity_type, 'page'), 
            p_entity_id, 
            p_page_path, 
            p_language_code
        );
        
        RETURN QUERY SELECT
            (default_metadata->>'meta_title')::TEXT,
            (default_metadata->>'meta_description')::TEXT,
            (default_metadata->>'meta_keywords')::TEXT,
            (default_metadata->>'canonical_url')::TEXT,
            (default_metadata->>'og_title')::TEXT,
            (default_metadata->>'og_description')::TEXT,
            (default_metadata->>'og_image_url')::TEXT,
            (default_metadata->>'og_type')::TEXT,
            'summary_large_image'::TEXT,
            (default_metadata->>'og_title')::TEXT,
            (default_metadata->>'og_description')::TEXT,
            (default_metadata->>'og_image_url')::TEXT,
            (default_metadata->>'robots')::TEXT,
            p_language_code;
    ELSE
        -- Retourner les métadonnées existantes
        RETURN QUERY SELECT
            existing_metadata.meta_title,
            existing_metadata.meta_description,
            existing_metadata.meta_keywords,
            existing_metadata.canonical_url,
            existing_metadata.og_title,
            existing_metadata.og_description,
            existing_metadata.og_image_url,
            existing_metadata.og_type,
            existing_metadata.twitter_card,
            existing_metadata.twitter_title,
            existing_metadata.twitter_description,
            existing_metadata.twitter_image_url,
            existing_metadata.robots,
            existing_metadata.language_code;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. DONNÉES DE BASE POUR LES PAGES PRINCIPALES
-- =====================================================

-- Métadonnées pour la page d'accueil
INSERT INTO public.seo_metadata (
    page_path,
    meta_title,
    meta_description,
    meta_keywords,
    canonical_url,
    og_title,
    og_description,
    og_image_url,
    og_type,
    language_code,
    priority,
    change_frequency
) VALUES (
    '/',
    'Loventy - Invitations de mariage élégantes et digitales',
    'Créez, personnalisez et envoyez des invitations de mariage électroniques élégantes. Suivez les RSVP en temps réel avec Loventy.',
    'invitation mariage, faire-part électronique, RSVP en ligne, invitation digitale, mariage, wedding invitation',
    'https://loventy.com/',
    'Loventy - Invitations de mariage élégantes',
    'Créez des invitations de mariage digitales élégantes et suivez les RSVP en temps réel',
    'https://loventy.com/og-image.jpg',
    'website',
    'fr',
    1.0,
    'weekly'
) ON CONFLICT (page_path) DO NOTHING;

-- Métadonnées pour la page de tarification
INSERT INTO public.seo_metadata (
    page_path,
    meta_title,
    meta_description,
    meta_keywords,
    canonical_url,
    og_title,
    og_description,
    og_type,
    language_code,
    priority
) VALUES (
    '/pricing',
    'Tarifs - Loventy | Plans d''invitations de mariage',
    'Découvrez nos plans tarifaires pour créer vos invitations de mariage digitales. Options gratuites et premium disponibles.',
    'tarifs invitation mariage, prix faire-part électronique, plan premium wedding',
    'https://loventy.com/pricing',
    'Tarifs Loventy - Plans d''invitations de mariage',
    'Découvrez nos plans tarifaires pour vos invitations de mariage digitales',
    'website',
    'fr',
    0.8
) ON CONFLICT (page_path) DO NOTHING;

-- =====================================================
-- 9. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.seo_metadata IS 'Table de gestion des métadonnées SEO pour toutes les pages et entités du site';
COMMENT ON COLUMN public.seo_metadata.page_path IS 'Chemin de la page (ex: /, /pricing, /about)';
COMMENT ON COLUMN public.seo_metadata.entity_id IS 'ID de l''entité associée (event, invitation, profile)';
COMMENT ON COLUMN public.seo_metadata.entity_type IS 'Type d''entité (event, invitation, profile, page)';
COMMENT ON COLUMN public.seo_metadata.meta_title IS 'Titre SEO (max 60 caractères)';
COMMENT ON COLUMN public.seo_metadata.meta_description IS 'Description SEO (max 160 caractères)';
COMMENT ON COLUMN public.seo_metadata.priority IS 'Priorité pour le sitemap (0.0 à 1.0)';
COMMENT ON COLUMN public.seo_metadata.change_frequency IS 'Fréquence de changement pour le sitemap';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================