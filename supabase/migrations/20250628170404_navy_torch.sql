/*
  # Fonction de vérification des limites d'événements

  Cette fonction vérifie si un utilisateur a atteint sa limite mensuelle d'événements
  en fonction de son plan d'abonnement.
  
  1. Fonctionnalité
    - Compte le nombre d'événements créés par l'utilisateur dans le mois en cours
    - Récupère la limite d'événements en fonction du plan de l'utilisateur
    - Retourne true si l'utilisateur peut créer un nouvel événement, false sinon
  
  2. Paramètres
    - user_uuid: UUID de l'utilisateur
  
  3. Retour
    - boolean: true si l'utilisateur peut créer un événement, false sinon
*/

CREATE OR REPLACE FUNCTION public.check_event_limit(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_count INTEGER;
  event_limit INTEGER;
  is_premium BOOLEAN;
  current_month_start TIMESTAMP;
BEGIN
  -- Définir le début du mois en cours
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Compter les événements créés par l'utilisateur ce mois-ci
  SELECT COUNT(*)
  INTO event_count
  FROM public.event
  WHERE user_id = user_uuid
  AND created_at >= current_month_start;
  
  -- Vérifier si l'utilisateur a un abonnement premium actif
  SELECT EXISTS (
    SELECT 1
    FROM public.stripe_user_subscriptions sus
    JOIN public.stripe_customers sc ON sus.customer_id = sc.customer_id
    WHERE sc.user_id = user_uuid
    AND sus.subscription_status = 'active'
    AND (sus.price_id = 'price_1RZ8beAmXOVRZkyiLPc5T1N6' OR sus.price_id = 'price_1RZ8fpAmXOVRZkyizFbIXhpN')
  ) INTO is_premium;
  
  -- Définir la limite d'événements en fonction du plan
  IF is_premium THEN
    -- Les utilisateurs premium ont une limite plus élevée ou illimitée
    -- Utilisateurs Essentiel: 5 événements par mois
    -- Utilisateurs Prestige: illimité (représenté par une valeur élevée)
    
    -- Vérifier si c'est un plan Prestige
    IF EXISTS (
      SELECT 1
      FROM public.stripe_user_subscriptions sus
      JOIN public.stripe_customers sc ON sus.customer_id = sc.customer_id
      WHERE sc.user_id = user_uuid
      AND sus.subscription_status = 'active'
      AND sus.price_id = 'price_1RZ8fpAmXOVRZkyizFbIXhpN'
    ) THEN
      event_limit := 999999; -- Pratiquement illimité
    ELSE
      event_limit := 5; -- Plan Essentiel
    END IF;
  ELSE
    -- Utilisateurs gratuits: 1 événement par mois
    event_limit := 1;
  END IF;
  
  -- Retourner true si l'utilisateur n'a pas atteint sa limite
  RETURN event_count < event_limit;
END;
$$;

-- Accorder les privilèges d'exécution
GRANT EXECUTE ON FUNCTION public.check_event_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_event_limit(UUID) TO service_role;