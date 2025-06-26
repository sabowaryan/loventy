/*
# Création de la table des événements d'invitation

1. Nouvelle table
   - Création de la table invitation_events pour stocker les détails du programme
   - Ajout des colonnes pour le type d'événement, l'heure, le lieu, etc.
   - Ajout d'un plan B en cas de mauvais temps

2. Sécurité
   - Ajout de politiques RLS pour la gestion des événements
   - Ajout d'un trigger pour la mise à jour automatique de updated_at
*/

-- Créer la table invitation_events
CREATE TABLE IF NOT EXISTS public.invitation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  event_time TIME WITHOUT TIME ZONE NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  plan_b_location_name TEXT DEFAULT NULL,
  plan_b_address TEXT DEFAULT NULL,
  plan_b_description TEXT DEFAULT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ajouter une contrainte de vérification pour event_type
ALTER TABLE public.invitation_events ADD CONSTRAINT invitation_events_event_type_check
  CHECK (event_type = ANY (ARRAY['ceremony'::text, 'reception'::text, 'cocktail'::text, 'dinner'::text, 'party'::text, 'other'::text]));

-- Créer un index sur invitation_id
CREATE INDEX idx_invitation_events_invitation_id ON public.invitation_events(invitation_id);

-- Créer un index sur event_type
CREATE INDEX idx_invitation_events_event_type ON public.invitation_events(event_type);

-- Activer RLS
ALTER TABLE public.invitation_events ENABLE ROW LEVEL SECURITY;

-- Ajouter une politique pour que les utilisateurs puissent gérer leurs propres événements
CREATE POLICY "Users can manage own events" 
ON public.invitation_events
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

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_invitation_events_updated_at
BEFORE UPDATE ON public.invitation_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.invitation_events IS 'Événements liés à une invitation (cérémonie, réception, etc.)';
COMMENT ON COLUMN public.invitation_events.event_type IS 'Type d''événement (ceremony, reception, cocktail, dinner, party, other)';
COMMENT ON COLUMN public.invitation_events.title IS 'Titre de l''événement';
COMMENT ON COLUMN public.invitation_events.event_time IS 'Heure de l''événement';
COMMENT ON COLUMN public.invitation_events.location_name IS 'Nom du lieu de l''événement';
COMMENT ON COLUMN public.invitation_events.address IS 'Adresse du lieu de l''événement';
COMMENT ON COLUMN public.invitation_events.description IS 'Description de l''événement';
COMMENT ON COLUMN public.invitation_events.plan_b_location_name IS 'Nom du lieu alternatif en cas de mauvais temps';
COMMENT ON COLUMN public.invitation_events.plan_b_address IS 'Adresse du lieu alternatif';
COMMENT ON COLUMN public.invitation_events.plan_b_description IS 'Description du plan B';
COMMENT ON COLUMN public.invitation_events.display_order IS 'Ordre d''affichage de l''événement';