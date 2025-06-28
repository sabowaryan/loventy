/*
  # Mise à jour de la fonction de création d'invitation à partir d'un modèle
  
  Cette fonction crée une nouvelle invitation basée sur un modèle et la lie à un événement.
  
  1. Modifications
    - Ajout du paramètre event_uuid pour lier l'invitation à un événement
    - Mise à jour de la requête d'insertion pour inclure event_id
  
  2. Paramètres
    - user_uuid: UUID de l'utilisateur
    - template_uuid: UUID du modèle d'invitation
    - invitation_title: Titre de l'invitation
    - event_uuid: UUID de l'événement (nouveau paramètre)
    - bride_name: Nom de la mariée (optionnel)
    - groom_name: Nom du marié (optionnel)
    - event_date: Date de l'événement (optionnel)
    - event_time: Heure de l'événement (optionnel)
    - venue: Lieu de l'événement (optionnel)
  
  3. Retour
    - UUID: ID de la nouvelle invitation créée
*/

CREATE OR REPLACE FUNCTION public.create_invitation_from_template(
  user_uuid UUID,
  template_uuid UUID,
  invitation_title TEXT,
  event_uuid UUID,
  bride_name TEXT DEFAULT NULL,
  groom_name TEXT DEFAULT NULL,
  event_date DATE DEFAULT NULL,
  event_time TIME DEFAULT NULL,
  venue TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invitation_id UUID;
  template_settings JSONB;
BEGIN
  -- Récupérer les paramètres par défaut du modèle
  SELECT default_settings INTO template_settings
  FROM public.invitation_templates
  WHERE id = template_uuid;
  
  -- Créer une nouvelle invitation
  INSERT INTO public.invitations (
    user_id,
    title,
    template_id,
    event_id,
    bride_name,
    groom_name,
    event_date,
    event_time,
    venue,
    status,
    design_settings,
    created_at,
    updated_at
  )
  VALUES (
    user_uuid,
    invitation_title,
    template_uuid,
    event_uuid,
    bride_name,
    groom_name,
    event_date,
    event_time,
    venue,
    'draft',
    template_settings,
    now(),
    now()
  )
  RETURNING id INTO new_invitation_id;
  
  RETURN new_invitation_id;
END;
$$;

-- Accorder les privilèges d'exécution
GRANT EXECUTE ON FUNCTION public.create_invitation_from_template(UUID, UUID, TEXT, UUID, TEXT, TEXT, DATE, TIME, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invitation_from_template(UUID, UUID, TEXT, UUID, TEXT, TEXT, DATE, TIME, TEXT) TO service_role;