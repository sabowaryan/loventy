/*
# Ajout de détails de groupe pour les invités

1. Nouvelles colonnes
   - Ajout du champ guest_group pour catégoriser les invités
   - Ajout de champs pour les menus personnalisés et plannings
   - Ajout de champs pour les accès VIP et zones spéciales
*/

-- Ajouter de nouvelles colonnes à la table invitation_guests_extended
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS guest_group TEXT DEFAULT NULL;
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS custom_menu_details TEXT DEFAULT NULL;
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS custom_event_schedule JSONB DEFAULT NULL;
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS special_access_code TEXT DEFAULT NULL;
ALTER TABLE public.invitation_guests_extended ADD COLUMN IF NOT EXISTS special_instructions TEXT DEFAULT NULL;

COMMENT ON COLUMN public.invitation_guests_extended.guest_group IS 'Groupe d''invités (family, witness, vip, etc.)';
COMMENT ON COLUMN public.invitation_guests_extended.custom_menu_details IS 'Détails du menu personnalisé pour cet invité';
COMMENT ON COLUMN public.invitation_guests_extended.custom_event_schedule IS 'Planning d''événements personnalisé pour cet invité';
COMMENT ON COLUMN public.invitation_guests_extended.is_vip IS 'Indique si l''invité a un statut VIP';
COMMENT ON COLUMN public.invitation_guests_extended.special_access_code IS 'Code d''accès spécial pour les zones réservées';
COMMENT ON COLUMN public.invitation_guests_extended.special_instructions IS 'Instructions spéciales pour cet invité';