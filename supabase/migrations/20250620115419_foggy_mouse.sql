/*
# Création de la table des médias uploadés par les invités

1. Nouvelle table
   - Création de la table guest_media_uploads pour stocker les vidéos et photos des invités
   - Ajout des colonnes pour le type de média, l'URL, le message, etc.

2. Sécurité
   - Ajout de politiques RLS pour la gestion des médias
*/

-- Créer la table guest_media_uploads
CREATE TABLE IF NOT EXISTS public.guest_media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  media_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  message TEXT DEFAULT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajouter une contrainte de vérification pour media_type
ALTER TABLE public.guest_media_uploads ADD CONSTRAINT guest_media_uploads_media_type_check
  CHECK (media_type = ANY (ARRAY['photo'::text, 'video'::text, 'audio'::text]));

-- Créer un index sur invitation_id
CREATE INDEX idx_guest_media_uploads_invitation_id ON public.guest_media_uploads(invitation_id);

-- Créer un index sur guest_id
CREATE INDEX idx_guest_media_uploads_guest_id ON public.guest_media_uploads(guest_id);

-- Activer RLS
ALTER TABLE public.guest_media_uploads ENABLE ROW LEVEL SECURITY;

-- Ajouter une politique pour que les utilisateurs puissent gérer les médias de leurs invitations
CREATE POLICY "Users can manage media uploads for their invitations" 
ON public.guest_media_uploads
FOR ALL
TO authenticated
USING (
  invitation_id IN (
    SELECT id FROM public.invitations WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  invitation_id IN (
    SELECT id FROM public.invitations WHERE user_id = auth.uid()
  )
);

-- Ajouter une politique pour que les invités puissent ajouter des médias
CREATE POLICY "Guests can add media uploads" 
ON public.guest_media_uploads
FOR INSERT
TO public
WITH CHECK (true);

-- Ajouter une politique pour que les invités puissent voir les médias approuvés
CREATE POLICY "Guests can view approved media uploads" 
ON public.guest_media_uploads
FOR SELECT
TO public
USING (is_approved = true);

COMMENT ON TABLE public.guest_media_uploads IS 'Médias (photos, vidéos) uploadés par les invités';
COMMENT ON COLUMN public.guest_media_uploads.media_type IS 'Type de média (photo, video, audio)';
COMMENT ON COLUMN public.guest_media_uploads.file_url IS 'URL du fichier média';
COMMENT ON COLUMN public.guest_media_uploads.message IS 'Message accompagnant le média';
COMMENT ON COLUMN public.guest_media_uploads.is_approved IS 'Indique si le média a été approuvé par les mariés';