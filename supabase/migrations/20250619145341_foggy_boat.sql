/*
  # Fix Function Search Path Mutable Warnings

  1. Problem
    - Functions without an explicit search_path setting can be vulnerable to search path injection
    - Current functions have a role mutable search_path
    - This is a security warning in Supabase

  2. Solution
    - Add SET search_path = public to all affected functions
    - This prevents potential search path injection attacks
    - Maintains the same functionality while improving security

  3. Functions Fixed
    - calculate_user_usage
    - check_plan_limit
    - is_email_confirmed
    - create_invitation_from_template
    - duplicate_invitation
    - get_template_usage_stats
    - get_recommended_templates
    - get_table_guests
    - handle_new_user
    - search_templates
    - update_updated_at_column
    - user_has_permission
    - create_user_profile
    - assign_default_role
    - update_user_metadata
    - handle_email_confirmation
    - extract_first_name
    - extract_last_name
    - extract_avatar_url
*/

-- Fix calculate_user_usage function
CREATE OR REPLACE FUNCTION calculate_user_usage(user_uuid uuid, start_date timestamptz DEFAULT date_trunc('month', now()))
RETURNS TABLE (
  invitations_count bigint,
  guests_count bigint,
  emails_sent bigint,
  storage_used bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE((SELECT COUNT(*) FROM invitations WHERE user_id = user_uuid AND created_at >= start_date), 0) as invitations_count,
    COALESCE((SELECT COUNT(*) FROM guests WHERE user_id = user_uuid), 0) as guests_count,
    COALESCE((SELECT COUNT(*) FROM email_logs WHERE user_id = user_uuid AND sent_at >= start_date), 0) as emails_sent,
    COALESCE((SELECT SUM(file_size) FROM user_files WHERE user_id = user_uuid), 0) as storage_used;
$$;

-- Fix check_plan_limit function
CREATE OR REPLACE FUNCTION check_plan_limit(
  user_uuid uuid,
  limit_type text,
  amount integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_usage record;
  user_subscription record;
  plan_limits jsonb;
  current_limit integer;
BEGIN
  -- Récupérer l'abonnement actuel
  SELECT * INTO user_subscription
  FROM stripe_user_subscriptions
  WHERE customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = user_uuid
  );

  -- Définir les limites par défaut (plan gratuit)
  plan_limits := '{
    "invitations": 3,
    "guests": 50,
    "emails": 100,
    "storage": 10485760
  }'::jsonb;

  -- Ajuster les limites selon l'abonnement
  IF user_subscription.subscription_status = 'active' THEN
    CASE user_subscription.price_id
      WHEN 'price_1RZ8beAmXOVRZkyiLPc5T1N6' THEN -- Plan Essentiel
        plan_limits := '{
          "invitations": 25,
          "guests": 300,
          "emails": 1000,
          "storage": 104857600
        }'::jsonb;
      WHEN 'price_1RZ8fpAmXOVRZkyizFbIXhpN' THEN -- Plan Prestige
        plan_limits := '{
          "invitations": -1,
          "guests": -1,
          "emails": -1,
          "storage": 1073741824
        }'::jsonb;
    END CASE;
  END IF;

  -- Récupérer la limite pour le type demandé
  current_limit := (plan_limits ->> limit_type)::integer;

  -- Si la limite est -1 (illimitée), autoriser
  IF current_limit = -1 THEN
    RETURN true;
  END IF;

  -- Calculer l'utilisation actuelle
  SELECT * INTO current_usage FROM calculate_user_usage(user_uuid);

  -- Vérifier selon le type de limite
  CASE limit_type
    WHEN 'invitations' THEN
      RETURN (current_usage.invitations_count + amount) <= current_limit;
    WHEN 'guests' THEN
      RETURN (current_usage.guests_count + amount) <= current_limit;
    WHEN 'emails' THEN
      RETURN (current_usage.emails_sent + amount) <= current_limit;
    WHEN 'storage' THEN
      RETURN (current_usage.storage_used + amount) <= current_limit;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Fix is_email_confirmed function
CREATE OR REPLACE FUNCTION is_email_confirmed(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND email_confirmed_at IS NOT NULL
  );
$$;

-- Fix create_invitation_from_template function
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix duplicate_invitation function
CREATE OR REPLACE FUNCTION duplicate_invitation(
  invitation_uuid uuid,
  new_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  original_invitation invitations%ROWTYPE;
  new_invitation_id uuid;
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
$$;

-- Fix get_template_usage_stats function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix get_recommended_templates function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix get_table_guests function
CREATE OR REPLACE FUNCTION get_table_guests(table_uuid uuid)
RETURNS TABLE (
  guest_id uuid,
  guest_name text,
  guest_email text,
  guest_status text,
  guest_type text,
  plus_one boolean,
  plus_one_name text,
  relationship text,
  side text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cette fonction ne fait plus rien car la table invitation_tables a été supprimée
  RETURN QUERY SELECT 
    NULL::uuid as guest_id,
    NULL::text as guest_name,
    NULL::text as guest_email,
    NULL::text as guest_status,
    NULL::text as guest_type,
    NULL::boolean as plus_one,
    NULL::text as plus_one_name,
    NULL::text as relationship,
    NULL::text as side
  WHERE false;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer le profil utilisateur pour tous les utilisateurs confirmés
  -- (OAuth users sont automatiquement confirmés)
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO users (id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        CASE 
          WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
          THEN trim(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1))
          ELSE ''
        END,
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search_templates function
CREATE OR REPLACE FUNCTION search_templates(
  search_term text DEFAULT NULL,
  category_slug_param text DEFAULT NULL,
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
  is_premium boolean,
  is_active boolean,
  preview_image_url text,
  thumbnail_url text,
  color_palette jsonb,
  font_pairs jsonb,
  layout_options jsonb,
  default_settings jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  category_name text,
  category_slug text,
  category_icon text,
  usage_count bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.description,
    t.category_id,
    t.is_premium,
    t.is_active,
    t.preview_image_url,
    t.thumbnail_url,
    t.color_palette,
    t.font_pairs,
    t.layout_options,
    t.default_settings,
    t.created_at,
    t.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    COALESCE(stats.usage_count, 0) as usage_count,
    COALESCE(stats.unique_users, 0) as unique_users
  FROM invitation_templates t
  LEFT JOIN template_categories c ON t.category_id = c.id
  LEFT JOIN (
    SELECT 
      template_id,
      COUNT(*) as usage_count,
      COUNT(DISTINCT user_id) as unique_users
    FROM invitations
    WHERE template_id IS NOT NULL
    GROUP BY template_id
  ) stats ON t.id::text = stats.template_id
  WHERE 
    t.is_active = true
    AND (search_term IS NULL OR (
      t.name ILIKE '%' || search_term || '%' 
      OR t.description ILIKE '%' || search_term || '%'
      OR c.name ILIKE '%' || search_term || '%'
    ))
    AND (category_slug_param IS NULL OR c.slug = category_slug_param)
    AND (NOT is_premium_only OR t.is_premium = true)
  ORDER BY 
    CASE WHEN search_term IS NOT NULL THEN
      CASE 
        WHEN t.name ILIKE search_term || '%' THEN 1
        WHEN t.name ILIKE '%' || search_term || '%' THEN 2
        ELSE 3
      END
    ELSE 0
    END,
    COALESCE(stats.usage_count, 0) DESC,
    t.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix user_has_permission function
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid
    AND p.name = permission_name
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$;

-- Fix create_user_profile function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix assign_default_role function
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id uuid;
  user_confirmed boolean;
BEGIN
  -- Vérifier si l'utilisateur a confirmé son email
  SELECT email_confirmed_at IS NOT NULL INTO user_confirmed
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Ne pas assigner de rôle si l'email n'est pas confirmé
  IF NOT user_confirmed THEN
    RETURN NEW;
  END IF;
  
  -- Get the default 'user' role ID
  SELECT id INTO default_role_id 
  FROM roles 
  WHERE name = 'user' AND is_system = true;
  
  -- If default role exists, assign it to the new user
  IF default_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (NEW.id, default_role_id, now())
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_user_metadata function
CREATE OR REPLACE FUNCTION update_user_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Pour les utilisateurs créés via OTP, on peut avoir besoin de mettre à jour les métadonnées
  -- Cette fonction peut être appelée depuis l'application si nécessaire
  RETURN NEW;
END;
$$;

-- Fix handle_email_confirmation function
CREATE OR REPLACE FUNCTION handle_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si l'email vient d'être confirmé, créer ou mettre à jour le profil utilisateur
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO users (id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        CASE 
          WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
          THEN trim(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1))
          ELSE ''
        END,
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix extract_first_name function
CREATE OR REPLACE FUNCTION extract_first_name(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    user_metadata->>'first_name',
    user_metadata->>'given_name',
    split_part(user_metadata->>'full_name', ' ', 1),
    ''
  );
$$;

-- Fix extract_last_name function
CREATE OR REPLACE FUNCTION extract_last_name(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    user_metadata->>'last_name',
    user_metadata->>'family_name',
    CASE 
      WHEN user_metadata->>'full_name' IS NOT NULL 
      THEN trim(substring(user_metadata->>'full_name' from position(' ' in user_metadata->>'full_name') + 1))
      ELSE ''
    END,
    ''
  );
$$;

-- Fix extract_avatar_url function
CREATE OR REPLACE FUNCTION extract_avatar_url(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    user_metadata->>'avatar_url',
    user_metadata->>'picture',
    ''
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_user_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_plan_limit TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_confirmed TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_invitation_from_template TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_template_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_guests TO authenticated;
GRANT EXECUTE ON FUNCTION search_templates TO authenticated, anon;
GRANT EXECUTE ON FUNCTION extract_first_name TO authenticated;
GRANT EXECUTE ON FUNCTION extract_last_name TO authenticated;
GRANT EXECUTE ON FUNCTION extract_avatar_url TO authenticated;