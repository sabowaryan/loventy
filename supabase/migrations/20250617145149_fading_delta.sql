/*
  # Fonctions utilitaires pour les modèles d'invitation

  1. Fonctions
    - Recherche de modèles avec filtres
    - Création d'invitation à partir d'un modèle
    - Duplication d'invitation existante
    - Statistiques d'utilisation des modèles
*/

-- Fonction pour rechercher des modèles avec filtres
CREATE OR REPLACE FUNCTION search_templates(
  search_term text DEFAULT NULL,
  category_slug text DEFAULT NULL,
  is_premium_only boolean DEFAULT false,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  category_id uuid,
  category_name text,
  is_premium boolean,
  preview_image_url text,
  thumbnail_url text,
  color_palette jsonb,
  usage_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.description,
    t.category_id,
    c.name as category_name,
    t.is_premium,
    t.preview_image_url,
    t.thumbnail_url,
    t.color_palette,
    COUNT(i.id) as usage_count
  FROM invitation_templates t
  JOIN template_categories c ON t.category_id = c.id
  LEFT JOIN invitations i ON i.template_id = t.id
  WHERE 
    t.is_active = true
    AND c.is_active = true
    AND (search_term IS NULL OR 
         t.name ILIKE '%' || search_term || '%' OR 
         t.description ILIKE '%' || search_term || '%')
    AND (category_slug IS NULL OR c.slug = category_slug)
    AND (is_premium_only = false OR t.is_premium = is_premium_only)
  GROUP BY t.id, t.name, t.slug, t.description, t.category_id, c.name, t.is_premium, t.preview_image_url, t.thumbnail_url, t.color_palette
  ORDER BY 
    CASE WHEN search_term IS NOT NULL AND t.name ILIKE '%' || search_term || '%' THEN 0 ELSE 1 END,
    usage_count DESC,
    t.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une invitation à partir d'un modèle
CREATE OR REPLACE FUNCTION create_invitation_from_template(
  user_uuid uuid,
  template_uuid uuid,
  invitation_title text,
  bride_name text DEFAULT NULL,
  groom_name text DEFAULT NULL,
  event_date date DEFAULT NULL,
  event_time time DEFAULT NULL,
  venue text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_invitation_id uuid;
  template_settings jsonb;
BEGIN
  -- Vérifier si l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Vérifier si le modèle existe
  IF NOT EXISTS (SELECT 1 FROM invitation_templates WHERE id = template_uuid) THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Récupérer les paramètres par défaut du modèle
  SELECT default_settings INTO template_settings FROM invitation_templates WHERE id = template_uuid;
  
  -- Créer la nouvelle invitation
  INSERT INTO invitations (
    user_id,
    template_id,
    title,
    bride_name,
    groom_name,
    event_date,
    event_time,
    venue,
    status,
    settings,
    design_settings
  )
  VALUES (
    user_uuid,
    template_uuid,
    invitation_title,
    COALESCE(bride_name, ''),
    COALESCE(groom_name, ''),
    event_date,
    event_time,
    COALESCE(venue, ''),
    'draft',
    template_settings,
    (SELECT color_palette FROM invitation_templates WHERE id = template_uuid)
  )
  RETURNING id INTO new_invitation_id;
  
  -- Retourner l'ID de la nouvelle invitation
  RETURN new_invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour dupliquer une invitation existante
CREATE OR REPLACE FUNCTION duplicate_invitation(
  invitation_uuid uuid,
  new_title text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  original_invitation invitations%ROWTYPE;
  new_invitation_id uuid;
  original_table invitation_tables%ROWTYPE;
  new_table_id uuid;
  original_question invitation_rsvp_questions%ROWTYPE;
  new_question_id uuid;
BEGIN
  -- Récupérer l'invitation originale
  SELECT * INTO original_invitation FROM invitations WHERE id = invitation_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  
  -- Créer la nouvelle invitation
  INSERT INTO invitations (
    user_id,
    template_id,
    title,
    bride_name,
    groom_name,
    event_date,
    event_time,
    venue,
    address,
    message,
    dress_code,
    rsvp_deadline,
    status,
    settings,
    design_settings
  )
  VALUES (
    original_invitation.user_id,
    original_invitation.template_id,
    COALESCE(new_title, original_invitation.title || ' (copie)'),
    original_invitation.bride_name,
    original_invitation.groom_name,
    original_invitation.event_date,
    original_invitation.event_time,
    original_invitation.venue,
    original_invitation.address,
    original_invitation.message,
    original_invitation.dress_code,
    original_invitation.rsvp_deadline,
    'draft',
    original_invitation.settings,
    original_invitation.design_settings
  )
  RETURNING id INTO new_invitation_id;
  
  -- Dupliquer les tables
  FOR original_table IN SELECT * FROM invitation_tables WHERE invitation_id = invitation_uuid
  LOOP
    INSERT INTO invitation_tables (
      invitation_id,
      name,
      description,
      capacity,
      is_vip,
      location_description,
      notes
    )
    VALUES (
      new_invitation_id,
      original_table.name,
      original_table.description,
      original_table.capacity,
      original_table.is_vip,
      original_table.location_description,
      original_table.notes
    )
    RETURNING id INTO new_table_id;
  END LOOP;
  
  -- Dupliquer les questions RSVP
  FOR original_question IN SELECT * FROM invitation_rsvp_questions WHERE invitation_id = invitation_uuid
  LOOP
    INSERT INTO invitation_rsvp_questions (
      invitation_id,
      question,
      question_type,
      options,
      is_required,
      display_order
    )
    VALUES (
      new_invitation_id,
      original_question.question,
      original_question.question_type,
      original_question.options,
      original_question.is_required,
      original_question.display_order
    )
    RETURNING id INTO new_question_id;
  END LOOP;
  
  -- Retourner l'ID de la nouvelle invitation
  RETURN new_invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques d'utilisation des modèles
CREATE OR REPLACE FUNCTION get_template_usage_stats(
  days_limit integer DEFAULT 30
)
RETURNS TABLE (
  template_id uuid,
  template_name text,
  category_name text,
  is_premium boolean,
  usage_count bigint,
  view_count bigint,
  unique_users bigint,
  avg_guests numeric,
  avg_confirmation_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as template_id,
    t.name as template_name,
    c.name as category_name,
    t.is_premium,
    COUNT(i.id) as usage_count,
    COALESCE(SUM(i.view_count), 0) as view_count,
    COUNT(DISTINCT i.user_id) as unique_users,
    COALESCE(AVG(gs.total_guests), 0) as avg_guests,
    COALESCE(AVG(gs.confirmation_rate), 0) as avg_confirmation_rate
  FROM invitation_templates t
  JOIN template_categories c ON t.category_id = c.id
  LEFT JOIN invitations i ON i.template_id = t.id AND i.created_at >= (CURRENT_DATE - days_limit::interval)
  LEFT JOIN guest_stats gs ON i.id = gs.invitation_id
  WHERE t.is_active = true
  GROUP BY t.id, t.name, c.name, t.is_premium
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les modèles recommandés pour un utilisateur
CREATE OR REPLACE FUNCTION get_recommended_templates(
  user_uuid uuid,
  limit_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  category_name text,
  is_premium boolean,
  preview_image_url text,
  color_palette jsonb,
  score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    -- Catégories que l'utilisateur a déjà utilisées
    SELECT 
      t.category_id,
      COUNT(*) as usage_count
    FROM invitations i
    JOIN invitation_templates t ON i.template_id = t.id
    WHERE i.user_id = user_uuid
    GROUP BY t.category_id
  ),
  user_premium_status AS (
    -- Vérifier si l'utilisateur a un abonnement premium
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = user_uuid
        AND r.name = 'premium'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    ) as is_premium
  )
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.description,
    c.name as category_name,
    t.is_premium,
    t.preview_image_url,
    t.color_palette,
    -- Score basé sur les préférences de l'utilisateur et la popularité
    (
      CASE 
        WHEN uc.category_id IS NOT NULL THEN 3.0 -- Bonus pour les catégories déjà utilisées
        ELSE 1.0
      END
      *
      CASE
        WHEN t.is_premium AND ups.is_premium THEN 1.5 -- Bonus pour les modèles premium si l'utilisateur est premium
        WHEN NOT t.is_premium THEN 1.2 -- Léger bonus pour les modèles gratuits
        ELSE 0.8 -- Pénalité pour les modèles premium si l'utilisateur n'est pas premium
      END
      *
      (1.0 + (SELECT COUNT(*) FROM invitations WHERE template_id = t.id) / 100.0) -- Popularité
    ) as score
  FROM invitation_templates t
  JOIN template_categories c ON t.category_id = c.id
  CROSS JOIN user_premium_status ups
  LEFT JOIN user_categories uc ON t.category_id = uc.category_id
  WHERE t.is_active = true
    AND c.is_active = true
    AND (NOT t.is_premium OR ups.is_premium OR t.is_premium = false)
  ORDER BY score DESC, t.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions pour les fonctions
GRANT EXECUTE ON FUNCTION search_templates TO authenticated;
GRANT EXECUTE ON FUNCTION search_templates TO anon;
GRANT EXECUTE ON FUNCTION create_invitation_from_template TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_template_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_templates TO authenticated;