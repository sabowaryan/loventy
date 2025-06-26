CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL UNIQUE,
    entity_id uuid NULL, -- Peut être l'ID d'une invitation, d'un modèle, etc.
    meta_title TEXT NULL,
    meta_description TEXT NULL,
    meta_keywords TEXT NULL,
    canonical_url TEXT NULL,
    og_title TEXT NULL,
    og_description TEXT NULL,
    og_image_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimiser les recherches par chemin de page
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_path ON public.seo_metadata(page_path);

-- Activer RLS
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les administrateurs peuvent gérer toutes les métadonnées SEO
CREATE POLICY "Admins can manage all SEO metadata" ON public.seo_metadata
FOR ALL
TO authenticated
USING (public.has_role_safe('admin'))
WITH CHECK (public.has_role_safe('admin'));

-- Les utilisateurs authentifiés et anonymes peuvent lire les métadonnées SEO
CREATE POLICY "Authenticated and anon users can read SEO metadata" ON public.seo_metadata
FOR SELECT
TO authenticated, anon
USING (true);

COMMENT ON TABLE public.seo_metadata IS 'Métadonnées SEO pour les pages et entités';
COMMENT ON COLUMN public.seo_metadata.page_path IS 'Chemin unique de la page (ex: /templates, /invitation/uuid)';
COMMENT ON COLUMN public.seo_metadata.entity_id IS 'ID de l''entité associée (ex: invitation_id, template_id)';
COMMENT ON COLUMN public.seo_metadata.meta_title IS 'Titre pour la balise <title>';
COMMENT ON COLUMN public.seo_metadata.meta_description IS 'Description pour la balise <meta name="description">';
COMMENT ON COLUMN public.seo_metadata.meta_keywords IS 'Mots-clés pour la balise <meta name="keywords">';
COMMENT ON COLUMN public.seo_metadata.canonical_url IS 'URL canonique pour éviter le contenu dupliqué';
COMMENT ON COLUMN public.seo_metadata.og_title IS 'Titre pour Open Graph (partage social)';
COMMENT ON COLUMN public.seo_metadata.og_description IS 'Description pour Open Graph';
COMMENT ON COLUMN public.seo_metadata.og_image_url IS 'URL de l''image pour Open Graph';
 CREATE TABLE IF NOT EXISTS public.redirects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    old_path TEXT NOT NULL UNIQUE,
    new_path TEXT NOT NULL,
    redirect_type TEXT NOT NULL CHECK (redirect_type IN ('301', '302')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimiser les recherches par ancien chemin
CREATE INDEX IF NOT EXISTS idx_redirects_old_path ON public.redirects(old_path);

-- Activer RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les administrateurs peuvent gérer toutes les redirections
CREATE POLICY "Admins can manage all redirects" ON public.redirects
FOR ALL
TO authenticated
USING (public.has_role_safe('admin'))
WITH CHECK (public.has_role_safe('admin'));

-- Les utilisateurs authentifiés et anonymes peuvent lire les redirections
CREATE POLICY "Authenticated and anon users can read redirects" ON public.redirects
FOR SELECT
TO authenticated, anon
USING (true);

COMMENT ON TABLE public.redirects IS 'Gestion des redirections URL (301, 302)';
COMMENT ON COLUMN public.redirects.old_path IS 'Ancien chemin de l''URL';
COMMENT ON COLUMN public.redirects.new_path IS 'Nouveau chemin de l''URL de destination';
COMMENT ON COLUMN public.redirects.redirect_type IS 'Type de redirection (301 permanent, 302 temporaire)';
CREATE TABLE IF NOT EXISTS public.sitemap_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    loc TEXT NOT NULL UNIQUE, -- URL de la page
    lastmod TIMESTAMP WITH TIME ZONE NULL, -- Date de dernière modification
    changefreq TEXT NULL CHECK (changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
    priority NUMERIC NULL CHECK (priority >= 0.0 AND priority <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimiser les recherches par URL
CREATE INDEX IF NOT EXISTS idx_sitemap_entries_loc ON public.sitemap_entries(loc);

-- Activer RLS
ALTER TABLE public.sitemap_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les administrateurs peuvent gérer toutes les entrées du sitemap
CREATE POLICY "Admins can manage all sitemap entries" ON public.sitemap_entries
FOR ALL
TO authenticated
USING (public.has_role_safe('admin'))
WITH CHECK (public.has_role_safe('admin'));

-- Les utilisateurs authentifiés et anonymes peuvent lire les entrées du sitemap
CREATE POLICY "Authenticated and anon users can read sitemap entries" ON public.sitemap_entries
FOR SELECT
TO authenticated, anon
USING (true);

COMMENT ON TABLE public.sitemap_entries IS 'Entrées pour la génération dynamique du sitemap XML';
COMMENT ON COLUMN public.sitemap_entries.loc IS 'URL de la page';
COMMENT ON COLUMN public.sitemap_entries.lastmod IS 'Date de dernière modification de la page';
COMMENT ON COLUMN public.sitemap_entries.changefreq IS 'Fréquence de changement de la page';
COMMENT ON COLUMN public.sitemap_entries.priority IS 'Priorité de la page dans le sitemap';
