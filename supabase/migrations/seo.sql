-- Create seo_metadata table
CREATE TABLE public.seo_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL UNIQUE,
    entity_id uuid NULL,
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

-- Add RLS policies
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all SEO metadata" ON public.seo_metadata
FOR ALL USING (has_role_safe('admin')) WITH CHECK (has_role_safe('admin'));

CREATE POLICY "Authenticated users can read public SEO metadata" ON public.seo_metadata
FOR SELECT USING (true); -- Adjust if you want to restrict read access further
