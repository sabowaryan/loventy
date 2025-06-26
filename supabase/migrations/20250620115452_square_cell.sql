/*
# Création des tables pour le mur social

1. Nouvelles tables
   - Création de la table social_wall_posts pour stocker les publications
   - Création de la table social_wall_comments pour stocker les commentaires
   - Création de la table social_wall_reactions pour stocker les réactions

2. Sécurité
   - Ajout de politiques RLS pour la gestion du mur social
   - Ajout de triggers pour la mise à jour automatique de updated_at
*/

-- Créer la table social_wall_posts
CREATE TABLE IF NOT EXISTS public.social_wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT NULL,
  post_text TEXT DEFAULT NULL,
  media_url TEXT DEFAULT NULL,
  post_type TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table social_wall_comments
CREATE TABLE IF NOT EXISTS public.social_wall_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_wall_posts(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT NULL,
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table social_wall_reactions
CREATE TABLE IF NOT EXISTS public.social_wall_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_wall_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.social_wall_comments(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT reactions_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Ajouter des contraintes de vérification
ALTER TABLE public.social_wall_posts ADD CONSTRAINT social_wall_posts_post_type_check
  CHECK (post_type = ANY (ARRAY['text'::text, 'photo'::text, 'video'::text, 'gif'::text]));

ALTER TABLE public.social_wall_reactions ADD CONSTRAINT social_wall_reactions_reaction_type_check
  CHECK (reaction_type = ANY (ARRAY['like'::text, 'love'::text, 'haha'::text, 'wow'::text, 'sad'::text, 'angry'::text]));

-- Créer des index
CREATE INDEX idx_social_wall_posts_invitation_id ON public.social_wall_posts(invitation_id);
CREATE INDEX idx_social_wall_posts_guest_id ON public.social_wall_posts(guest_id);
CREATE INDEX idx_social_wall_comments_post_id ON public.social_wall_comments(post_id);
CREATE INDEX idx_social_wall_comments_guest_id ON public.social_wall_comments(guest_id);
CREATE INDEX idx_social_wall_reactions_post_id ON public.social_wall_reactions(post_id);
CREATE INDEX idx_social_wall_reactions_comment_id ON public.social_wall_reactions(comment_id);
CREATE INDEX idx_social_wall_reactions_guest_id ON public.social_wall_reactions(guest_id);

-- Activer RLS
ALTER TABLE public.social_wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_wall_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_wall_reactions ENABLE ROW LEVEL SECURITY;

-- Ajouter des politiques pour social_wall_posts
CREATE POLICY "Users can manage all posts for their invitations" 
ON public.social_wall_posts
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

CREATE POLICY "Guests can add posts" 
ON public.social_wall_posts
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Guests can view approved posts" 
ON public.social_wall_posts
FOR SELECT
TO public
USING (is_approved = true);

-- Ajouter des politiques pour social_wall_comments
CREATE POLICY "Users can manage all comments for their invitations" 
ON public.social_wall_comments
FOR ALL
TO authenticated
USING (
  post_id IN (
    SELECT p.id FROM public.social_wall_posts p
    JOIN public.invitations i ON p.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
)
WITH CHECK (
  post_id IN (
    SELECT p.id FROM public.social_wall_posts p
    JOIN public.invitations i ON p.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
);

CREATE POLICY "Guests can add comments" 
ON public.social_wall_comments
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Guests can view approved comments" 
ON public.social_wall_comments
FOR SELECT
TO public
USING (is_approved = true);

-- Ajouter des politiques pour social_wall_reactions
CREATE POLICY "Users can view all reactions for their invitations" 
ON public.social_wall_reactions
FOR SELECT
TO authenticated
USING (
  post_id IN (
    SELECT p.id FROM public.social_wall_posts p
    JOIN public.invitations i ON p.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  ) OR
  comment_id IN (
    SELECT c.id FROM public.social_wall_comments c
    JOIN public.social_wall_posts p ON c.post_id = p.id
    JOIN public.invitations i ON p.invitation_id = i.id
    WHERE i.user_id = auth.uid()
  )
);

CREATE POLICY "Guests can add reactions" 
ON public.social_wall_reactions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Guests can view reactions" 
ON public.social_wall_reactions
FOR SELECT
TO public
USING (true);

-- Créer des triggers pour mettre à jour updated_at
CREATE TRIGGER update_social_wall_posts_updated_at
BEFORE UPDATE ON public.social_wall_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_wall_comments_updated_at
BEFORE UPDATE ON public.social_wall_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires
COMMENT ON TABLE public.social_wall_posts IS 'Publications sur le mur social';
COMMENT ON TABLE public.social_wall_comments IS 'Commentaires sur les publications du mur social';
COMMENT ON TABLE public.social_wall_reactions IS 'Réactions aux publications et commentaires du mur social';
COMMENT ON COLUMN public.social_wall_posts.post_type IS 'Type de publication (text, photo, video, gif)';
COMMENT ON COLUMN public.social_wall_reactions.reaction_type IS 'Type de réaction (like, love, haha, wow, sad, angry)';