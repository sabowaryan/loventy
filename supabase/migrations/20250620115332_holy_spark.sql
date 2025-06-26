/*
# Ajout de détails d'invitation étendus

1. Nouvelles colonnes
   - Ajout de champs pour le titre d'annonce, message formel, hôte
   - Ajout de champs pour les informations de contact
   - Ajout de champs pour les informations de transport et d'hébergement
   - Ajout de champs pour les politiques concernant les enfants et les cadeaux
   - Ajout de champs pour la cagnotte de lune de miel
   - Ajout de champs pour le message du couple et les valeurs
   - Ajout de champs pour la playlist et les suggestions de chansons

2. Modifications
   - Mise à jour des contraintes de vérification pour le statut
*/

-- Ajouter de nouvelles colonnes à la table invitations
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS announcement_title TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS formal_message_intro TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS contact_person_name TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS parking_info TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS public_transport_info TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS shuttle_info TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS accommodation_suggestions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS preferred_hotel_name TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS preferred_hotel_code TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS children_policy TEXT DEFAULT 'welcome';
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS gift_policy TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS honeymoon_fund_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS honeymoon_fund_message TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS honeymoon_fund_target_amount NUMERIC DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS couple_message_type TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS couple_message_content TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS couple_values_statement TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS couple_quote TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS playlist_url TEXT DEFAULT NULL;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS allow_song_suggestions BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS countdown_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS quiz_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS social_wall_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS social_wall_moderation_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS virtual_keepsake_enabled BOOLEAN DEFAULT FALSE;

-- Mettre à jour la contrainte de vérification pour le statut
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invitations_status_check' 
    AND conrelid = 'public.invitations'::regclass
  ) THEN
    ALTER TABLE public.invitations DROP CONSTRAINT invitations_status_check;
  END IF;
  
  ALTER TABLE public.invitations ADD CONSTRAINT invitations_status_check 
    CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'sent'::text, 'archived'::text, 'canceled'::text]));
END $$;

-- Mettre à jour la contrainte de vérification pour children_policy
ALTER TABLE public.invitations ADD CONSTRAINT invitations_children_policy_check 
  CHECK (children_policy = ANY (ARRAY['welcome'::text, 'not_admitted'::text, 'limited'::text]));

-- Mettre à jour la contrainte de vérification pour couple_message_type
ALTER TABLE public.invitations ADD CONSTRAINT invitations_couple_message_type_check 
  CHECK (couple_message_type = ANY (ARRAY['video'::text, 'audio'::text, 'text'::text]));

COMMENT ON COLUMN public.invitations.announcement_title IS 'Titre d''annonce comme "SAVE THE DATE"';
COMMENT ON COLUMN public.invitations.formal_message_intro IS 'Message d''introduction formel pour l''invitation';
COMMENT ON COLUMN public.invitations.host_name IS 'Nom de la personne ou famille qui héberge l''événement';
COMMENT ON COLUMN public.invitations.contact_person_name IS 'Nom de la personne à contacter pour des questions';
COMMENT ON COLUMN public.invitations.contact_phone IS 'Numéro de téléphone de contact';
COMMENT ON COLUMN public.invitations.contact_email IS 'Email de contact';
COMMENT ON COLUMN public.invitations.parking_info IS 'Informations sur le stationnement';
COMMENT ON COLUMN public.invitations.public_transport_info IS 'Informations sur les transports en commun';
COMMENT ON COLUMN public.invitations.shuttle_info IS 'Informations sur les navettes';
COMMENT ON COLUMN public.invitations.accommodation_suggestions IS 'Suggestions d''hébergement au format JSON';
COMMENT ON COLUMN public.invitations.preferred_hotel_name IS 'Nom de l''hôtel préféré';
COMMENT ON COLUMN public.invitations.preferred_hotel_code IS 'Code de réduction pour l''hôtel préféré';
COMMENT ON COLUMN public.invitations.children_policy IS 'Politique concernant les enfants (welcome, not_admitted, limited)';
COMMENT ON COLUMN public.invitations.gift_policy IS 'Politique concernant les cadeaux';
COMMENT ON COLUMN public.invitations.honeymoon_fund_enabled IS 'Indique si la cagnotte pour la lune de miel est activée';
COMMENT ON COLUMN public.invitations.honeymoon_fund_message IS 'Message pour la cagnotte de lune de miel';
COMMENT ON COLUMN public.invitations.honeymoon_fund_target_amount IS 'Montant cible pour la cagnotte de lune de miel';
COMMENT ON COLUMN public.invitations.couple_message_type IS 'Type de message du couple (video, audio, text)';
COMMENT ON COLUMN public.invitations.couple_message_content IS 'Contenu du message du couple (URL ou texte)';
COMMENT ON COLUMN public.invitations.couple_values_statement IS 'Déclaration des valeurs du couple';
COMMENT ON COLUMN public.invitations.couple_quote IS 'Citation ou verset préféré du couple';
COMMENT ON COLUMN public.invitations.playlist_url IS 'URL de la playlist du mariage';
COMMENT ON COLUMN public.invitations.allow_song_suggestions IS 'Indique si les invités peuvent suggérer des chansons';
COMMENT ON COLUMN public.invitations.countdown_enabled IS 'Indique si le compte à rebours est activé';
COMMENT ON COLUMN public.invitations.quiz_enabled IS 'Indique si le quiz sur les mariés est activé';
COMMENT ON COLUMN public.invitations.social_wall_enabled IS 'Indique si le mur social est activé';
COMMENT ON COLUMN public.invitations.social_wall_moderation_enabled IS 'Indique si la modération du mur social est activée';
COMMENT ON COLUMN public.invitations.virtual_keepsake_enabled IS 'Indique si le coffret virtuel souvenir est activé';