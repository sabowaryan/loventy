/*
# Ajout d'instructions aux questions RSVP

1. Nouvelles colonnes
   - Ajout du champ instructions pour les questions RSVP
   - Ajout du champ max_selections pour limiter le nombre de choix
*/

-- Ajouter de nouvelles colonnes à la table invitation_rsvp_questions
ALTER TABLE public.invitation_rsvp_questions ADD COLUMN IF NOT EXISTS instructions TEXT DEFAULT NULL;
ALTER TABLE public.invitation_rsvp_questions ADD COLUMN IF NOT EXISTS max_selections INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.invitation_rsvp_questions.instructions IS 'Instructions spécifiques pour répondre à la question';
COMMENT ON COLUMN public.invitation_rsvp_questions.max_selections IS 'Nombre maximum de sélections autorisées pour les questions à choix multiples';