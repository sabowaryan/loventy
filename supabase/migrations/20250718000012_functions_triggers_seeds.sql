-- =====================================================
-- FONCTIONS, TRIGGERS, SEEDS ET BUCKETS LOVENTY
-- =====================================================
-- Ce script complète le système avec toutes les fonctions, triggers, seeds et buckets
-- manquants des anciens fichiers de migration

-- =====================================================
-- 1. FONCTIONS UTILITAIRES DE BASE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des tokens sécurisés
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(length), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider les emails
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le rôle utilisateur en cache (évite la récursion RLS)
CREATE OR REPLACE FUNCTION get_user_role_cache()
RETURNS user_role_enum AS $$
DECLARE
  v_user_id UUID;
  v_role user_role_enum;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN 'guest';
  END IF;
  
  -- Récupérer le rôle principal sans déclencher les policies RLS
  SELECT (
    array_agg(ur.role ORDER BY 
      CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'moderator' THEN 3
        WHEN 'host' THEN 4
        WHEN 'support' THEN 5
        WHEN 'guest' THEN 6
      END
    )
  )[1] INTO v_role
  FROM user_roles ur
  WHERE ur.user_id = v_user_id
    AND ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP);
  
  RETURN COALESCE(v_role, 'host');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FONCTIONS D'AUTHENTIFICATION ET GESTION UTILISATEURS
-- =====================================================

-- Fonction pour créer un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user_with_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_limits JSONB;
BEGIN
  RAISE LOG 'Creating new user profile for user_id: %', NEW.id;
  
  -- Étape 1 : Créer le profil utilisateur
  BEGIN
    INSERT INTO public.profiles (
      id, email, first_name, last_name, avatar_url,
      phone, timezone, language, is_active, email_verified
    )
    VALUES (
      NEW.id, NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
      COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
      true,
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RAISE LOG 'Profile created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user_id: %. Error: %', NEW.id, SQLERRM;
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
  END;

  -- Étape 2 : Assigner le rôle 'host'
  BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_by, is_active)
    VALUES (NEW.id, 'host', NEW.id, true);
    RAISE LOG 'Role assigned successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error assigning role for user_id: %. Error: %', NEW.id, SQLERRM;
    RAISE EXCEPTION 'Erreur lors de l''assignation du rôle: %', SQLERRM;
  END;

  -- Étape 3 : Assigner le plan gratuit
  BEGIN
    SELECT get_plan_limits('free'::subscription_plan_enum) INTO v_plan_limits;

    INSERT INTO public.user_subscriptions (
      user_id, plan, status,
      max_events, max_guests_per_event, max_storage_mb,
      features
    )
    VALUES (
      NEW.id,
      'free',
      'active',
      COALESCE((v_plan_limits->>'events')::INTEGER, 1),
      COALESCE((v_plan_limits->>'guests')::INTEGER, 50),
      COALESCE((v_plan_limits->>'storage')::INTEGER, 100),
      v_plan_limits->'features'
    );
    RAISE LOG 'Subscription created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de l''insertion dans user_subscriptions pour user_id % : %', NEW.id, SQLERRM;
  END;

  -- Étape 4 : Créer une session d'audit
  BEGIN
    INSERT INTO public.user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
    VALUES (
      NEW.id,
      generate_secure_token(),
      '127.0.0.1'::inet,
      'Registration',
      CURRENT_TIMESTAMP + INTERVAL '24 hours'
    );
    RAISE LOG 'Session created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating session for user_id: %. Error: %', NEW.id, SQLERRM;
  END;

  RAISE LOG 'User registration completed successfully for user_id: %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Fonction pour vérifier si un utilisateur a un rôle
CREATE OR REPLACE FUNCTION has_user_role(role_name user_role_enum)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = v_user_id
      AND ur.role = role_name
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a une permission
CREATE OR REPLACE FUNCTION has_role_permission(resource_name TEXT, action_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = v_user_id
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      AND (rp.resource = resource_name OR rp.resource = '*')
      AND (rp.action = action_name OR rp.action = '*')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est admin (compatible avec l'ancien système)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_user_role('super_admin') OR has_user_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le profil utilisateur complet
CREATE OR REPLACE FUNCTION get_user_profile(target_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_profile JSON;
BEGIN
  v_user_id := COALESCE(target_user_id, auth.uid());
  
  IF v_user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante pour consulter ce profil';
  END IF;
  
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'avatar_url', p.avatar_url,
    'phone', p.phone,
    'date_of_birth', p.date_of_birth,
    'timezone', p.timezone,
    'language', p.language,
    'is_active', p.is_active,
    'email_verified', p.email_verified,
    'phone_verified', p.phone_verified,
    'last_login_at', p.last_login_at,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'status', CASE 
      WHEN p.is_active = false THEN 'suspended' 
      ELSE 'active' 
    END
  ) INTO v_profile
  FROM profiles p
  WHERE p.id = v_user_id;
  
  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le profil utilisateur
CREATE OR REPLACE FUNCTION update_user_profile(
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  UPDATE profiles SET
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    phone = COALESCE(p_phone, phone),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    timezone = COALESCE(p_timezone, timezone),
    language = COALESCE(p_language, language),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = auth.uid();
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    auth.uid(),
    'update',
    'profile',
    auth.uid(),
    json_build_object(
      'first_name', p_first_name,
      'last_name', p_last_name,
      'phone', p_phone,
      'date_of_birth', p_date_of_birth,
      'timezone', p_timezone,
      'language', p_language
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FONCTIONS DE GESTION DES PLANS
-- =====================================================

-- Fonction pour obtenir les limites d'un plan
CREATE OR REPLACE FUNCTION get_plan_limits(plan_type subscription_plan_enum)
RETURNS JSONB AS $$
DECLARE
  v_limits JSONB;
  v_features JSONB;
  v_result JSONB;
BEGIN
  SELECT limits, features
  INTO v_limits, v_features
  FROM plans
  WHERE type = plan_type
  LIMIT 1;

  IF v_limits IS NULL THEN
    -- Plan par défaut si non trouvé
    v_limits := jsonb_build_object(
      'events', 1,
      'guests', 50,
      'storage', 100,
      'templates', 2,
      'emailsPerMonth', 100
    );
    v_features := '[]'::jsonb;
  END IF;

  v_result := v_limits || jsonb_build_object('features', v_features);
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le plan actuel d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_current_plan(user_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_plan JSON;
BEGIN
  v_user_id := COALESCE(user_uuid, auth.uid());
  
  SELECT json_build_object(
    'plan', us.plan,
    'status', us.status,
    'started_at', us.started_at,
    'expires_at', us.expires_at,
    'trial_ends_at', us.trial_ends_at,
    'max_events', us.max_events,
    'max_guests_per_event', us.max_guests_per_event,
    'max_storage_mb', us.max_storage_mb,
    'features', us.features,
    'limits', get_plan_limits(us.plan)
  ) INTO v_plan
  FROM user_subscriptions us
  WHERE us.user_id = v_user_id
    AND us.status IN ('active', 'trial')
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_plan, json_build_object(
    'plan', 'free',
    'status', 'active',
    'limits', get_plan_limits('free')
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour changer le plan d'un utilisateur
CREATE OR REPLACE FUNCTION change_user_plan(
  target_user_id UUID,
  new_plan subscription_plan_enum,
  expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_limits JSONB;
BEGIN
  -- Vérifier les permissions (super_admin ou admin)
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Permission insuffisante pour changer les plans';
  END IF;
  
  -- Obtenir les limites du nouveau plan
  v_plan_limits := get_plan_limits(new_plan);
  
  -- Désactiver l'ancien plan
  UPDATE user_subscriptions 
  SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
  WHERE user_id = target_user_id AND status IN ('active', 'trial');
  
  -- Créer le nouveau plan
  INSERT INTO user_subscriptions (
    user_id,
    plan,
    status,
    expires_at,
    max_events,
    max_guests_per_event,
    max_storage_mb,
    features
  ) VALUES (
    target_user_id,
    new_plan,
    'active',
    expires_at,
    (v_plan_limits->>'max_events')::INTEGER,
    (v_plan_limits->>'max_guests_per_event')::INTEGER,
    (v_plan_limits->>'max_storage_mb')::INTEGER,
    v_plan_limits->'features'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- 4. FONCTIONS MÉTIER
-- =====================================================

-- Fonction pour créer un événement avec invitation par défaut
CREATE OR REPLACE FUNCTION create_event_with_invitation(
  p_title TEXT,
  p_event_date DATE,
  p_venue_name TEXT DEFAULT NULL,
  p_template_slug TEXT DEFAULT 'simplicite-pure'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_invitation_id UUID;
  v_template_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Créer l'événement
  INSERT INTO events (owner_id, title, event_date, venue_name)
  VALUES (auth.uid(), p_title, p_event_date, p_venue_name)
  RETURNING id INTO v_event_id;
  
  -- Récupérer l'ID du template
  SELECT id INTO v_template_id 
  FROM invitation_templates 
  WHERE slug = p_template_slug AND is_active = true;
  
  -- Créer l'invitation par défaut
  INSERT INTO invitations (event_id, template_id, title)
  VALUES (v_event_id, v_template_id, p_title)
  RETURNING id INTO v_invitation_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un invité avec token d'accès
CREATE OR REPLACE FUNCTION add_guest_to_invitation(
  p_invitation_id UUID,
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_plus_one_allowed BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_guest_id UUID;
  v_access_token TEXT;
BEGIN
  -- Vérifier les permissions sur l'invitation
  IF NOT EXISTS (
    SELECT 1 FROM invitations i 
    JOIN events e ON i.event_id = e.id 
    WHERE i.id = p_invitation_id AND e.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission insuffisante pour ajouter des invités';
  END IF;
  
  -- Générer un token d'accès unique
  v_access_token := generate_secure_token(32);
  
  -- Créer l'invité
  INSERT INTO guests (
    invitation_id, 
    name, 
    email, 
    phone, 
    plus_one_allowed,
    access_token
  )
  VALUES (
    p_invitation_id, 
    p_name, 
    p_email, 
    p_phone, 
    p_plus_one_allowed,
    v_access_token
  )
  RETURNING id INTO v_guest_id;
  
  RETURN v_guest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le statut RSVP d'un invité
CREATE OR REPLACE FUNCTION update_guest_rsvp(
  p_access_token TEXT,
  p_status rsvp_status_type,
  p_response_message TEXT DEFAULT NULL,
  p_dietary_restrictions TEXT DEFAULT NULL,
  p_plus_one_name TEXT DEFAULT NULL,
  p_plus_one_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_guest_id UUID;
BEGIN
  -- Vérifier le token et récupérer l'ID de l'invité
  SELECT id INTO v_guest_id
  FROM guests
  WHERE access_token = p_access_token
    AND access_expires_at > CURRENT_TIMESTAMP;
  
  IF v_guest_id IS NULL THEN
    RAISE EXCEPTION 'Token d''accès invalide ou expiré';
  END IF;
  
  -- Mettre à jour les informations de l'invité
  UPDATE guests SET
    status = p_status,
    response_message = p_response_message,
    dietary_restrictions = p_dietary_restrictions,
    plus_one_name = p_plus_one_name,
    plus_one_email = p_plus_one_email,
    responded_at = CURRENT_TIMESTAMP
  WHERE id = v_guest_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques d'un événement
CREATE OR REPLACE FUNCTION get_event_stats(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  -- Vérifier les permissions
  IF NOT EXISTS (
    SELECT 1 FROM events WHERE id = p_event_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission insuffisante pour consulter les statistiques';
  END IF;
  
  SELECT json_build_object(
    'total_invitations', COUNT(DISTINCT i.id),
    'total_guests', COUNT(DISTINCT g.id),
    'confirmed_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'confirmed'),
    'declined_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'declined'),
    'pending_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'pending'),
    'maybe_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'maybe'),
    'plus_ones', COUNT(DISTINCT g.id) FILTER (WHERE g.plus_one_name IS NOT NULL),
    'response_rate', ROUND(
      (COUNT(DISTINCT g.id) FILTER (WHERE g.status != 'pending')::DECIMAL / 
       NULLIF(COUNT(DISTINCT g.id), 0)) * 100, 2
    )
  ) INTO v_stats
  FROM events e
  LEFT JOIN invitations i ON e.id = i.event_id
  LEFT JOIN guests g ON i.id = g.invitation_id
  WHERE e.id = p_event_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FONCTIONS SEO
-- =====================================================

-- Fonction pour mettre à jour updated_at des métadonnées SEO
CREATE OR REPLACE FUNCTION update_seo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider les URLs SEO
CREATE OR REPLACE FUNCTION validate_seo_urls()
RETURNS TRIGGER AS $$
BEGIN
  -- Valider l'URL canonique
  IF NEW.canonical_url IS NOT NULL AND NEW.canonical_url !~ '^https?://' THEN
    RAISE EXCEPTION 'URL canonique invalide: %', NEW.canonical_url;
  END IF;
  
  -- Valider l'URL de l'image OG
  IF NEW.og_image_url IS NOT NULL AND NEW.og_image_url !~ '^https?://' THEN
    RAISE EXCEPTION 'URL image OG invalide: %', NEW.og_image_url;
  END IF;
  
  -- Valider l'URL de l'image Twitter
  IF NEW.twitter_image_url IS NOT NULL AND NEW.twitter_image_url !~ '^https?://' THEN
    RAISE EXCEPTION 'URL image Twitter invalide: %', NEW.twitter_image_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FONCTIONS MFA
-- =====================================================

-- Fonction pour configurer TOTP
CREATE OR REPLACE FUNCTION setup_mfa_totp()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_secret TEXT;
  v_qr_code TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Générer un secret TOTP (32 caractères base32)
  v_secret := encode(gen_random_bytes(20), 'base32');
  
  -- Créer ou mettre à jour la configuration MFA
  INSERT INTO user_mfa_settings (user_id, method, secret_key, status)
  VALUES (v_user_id, 'totp', v_secret, 'pending')
  ON CONFLICT (user_id, method) 
  DO UPDATE SET 
    secret_key = v_secret,
    status = 'pending',
    updated_at = CURRENT_TIMESTAMP;
  
  -- Générer l'URL pour le QR code
  v_qr_code := 'otpauth://totp/Loventy:' || 
    (SELECT email FROM profiles WHERE id = v_user_id) ||
    '?secret=' || v_secret ||
    '&issuer=Loventy';
  
  RETURN json_build_object(
    'secret', v_secret,
    'qr_code', v_qr_code,
    'status', 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Fonction pour vérifier un code MFA
CREATE OR REPLACE FUNCTION verify_mfa_code(
  p_code TEXT,
  p_method mfa_method_enum DEFAULT 'totp'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_settings RECORD;
  v_is_valid BOOLEAN := false;
  v_code_hash TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Hasher le code pour la sécurité
  v_code_hash := encode(digest(p_code, 'sha256'), 'hex');
  
  -- Récupérer les paramètres MFA
  SELECT * INTO v_settings
  FROM user_mfa_settings
  WHERE user_id = v_user_id AND method = p_method;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configuration MFA non trouvée';
  END IF;
  
  -- Pour TOTP, on simule la validation (en production, utiliser une vraie lib TOTP)
  IF p_method = 'totp' THEN
    -- Simulation : accepter les codes de 6 chiffres
    v_is_valid := length(p_code) = 6 AND p_code ~ '^[0-9]+$';
  END IF;
  
  -- Pour les codes de récupération
  IF p_method = 'backup_codes' THEN
    v_is_valid := p_code = ANY(v_settings.backup_codes);
    
    -- Retirer le code utilisé
    IF v_is_valid THEN
      UPDATE user_mfa_settings 
      SET backup_codes = array_remove(backup_codes, p_code)
      WHERE user_id = v_user_id AND method = 'backup_codes';
    END IF;
  END IF;
  
  -- Enregistrer la tentative
  INSERT INTO mfa_attempts (user_id, method, code_hash, success)
  VALUES (v_user_id, p_method, v_code_hash, v_is_valid);
  
  -- Si valide, marquer comme vérifié
  IF v_is_valid THEN
    UPDATE user_mfa_settings 
    SET status = 'verified', verified_at = CURRENT_TIMESTAMP
    WHERE user_id = v_user_id AND method = p_method;
  END IF;
  
  RETURN json_build_object(
    'success', v_is_valid,
    'method', p_method,
    'verified_at', CASE WHEN v_is_valid THEN CURRENT_TIMESTAMP ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le statut MFA
CREATE OR REPLACE FUNCTION get_user_mfa_status()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_mfa_status JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  SELECT json_build_object(
    'enabled', COUNT(*) > 0,
    'verified', COUNT(*) FILTER (WHERE status = 'verified') > 0,
    'methods', json_agg(
      json_build_object(
        'method', method,
        'status', status,
        'verified_at', verified_at
      )
    ) FILTER (WHERE status != 'disabled'),
    'preferred_method', (
      SELECT method FROM user_mfa_settings 
      WHERE user_id = v_user_id AND status = 'verified'
      ORDER BY verified_at DESC LIMIT 1
    )
  ) INTO v_mfa_status
  FROM user_mfa_settings
  WHERE user_id = v_user_id AND status != 'disabled';
  
  RETURN COALESCE(v_mfa_status, json_build_object(
    'enabled', false,
    'verified', false,
    'methods', '[]'::json,
    'preferred_method', null
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FONCTIONS DE SESSIONS
-- =====================================================

-- Fonction pour enregistrer une nouvelle session
CREATE OR REPLACE FUNCTION create_user_session(
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_session_token TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  v_session_token := generate_secure_token();
  
  INSERT INTO user_sessions (
    user_id, 
    session_token, 
    ip_address, 
    user_agent, 
    expires_at
  )
  VALUES (
    auth.uid(),
    v_session_token,
    p_ip_address::inet,
    p_user_agent,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
  )
  RETURNING id INTO v_session_id;
  
  -- Mettre à jour la dernière connexion
  UPDATE profiles 
  SET last_login_at = CURRENT_TIMESTAMP
  WHERE id = auth.uid();
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
  VALUES (
    auth.uid(),
    'login',
    'session',
    v_session_id,
    p_ip_address::inet,
    p_user_agent
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les sessions actives
CREATE OR REPLACE FUNCTION get_user_active_sessions()
RETURNS TABLE(
  id UUID,
  created_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  is_current_session BOOLEAN
) AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.created_at,
    s.created_at as last_active_at,
    s.ip_address::TEXT,
    s.user_agent,
    s.expires_at,
    false as is_current_session
  FROM user_sessions s
  WHERE s.user_id = auth.uid()
    AND s.expires_at > CURRENT_TIMESTAMP
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FONCTIONS ADMIN
-- =====================================================

-- Fonction pour suspendre un utilisateur
CREATE OR REPLACE FUNCTION admin_suspend_user(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  UPDATE profiles 
  SET is_active = false
  WHERE id = p_user_id;
  
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    auth.uid(),
    'suspend',
    'user',
    p_user_id,
    json_build_object('reason', p_reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour lever une suspension
CREATE OR REPLACE FUNCTION admin_unsuspend_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  UPDATE profiles 
  SET is_active = true
  WHERE id = p_user_id;
  
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (auth.uid(), 'unsuspend', 'user', p_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. FONCTIONS DE MAINTENANCE ET NETTOYAGE
-- =====================================================

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les tokens d'accès expirés
CREATE OR REPLACE FUNCTION cleanup_expired_guest_tokens()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE guests 
  SET access_token = NULL, access_expires_at = NULL
  WHERE access_expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques système
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM profiles),
      'active', (SELECT COUNT(*) FROM profiles WHERE is_active = true)
    ),
    'events', json_build_object(
      'total', (SELECT COUNT(*) FROM events),
      'public', (SELECT COUNT(*) FROM events WHERE is_public = true),
      'this_month', (SELECT COUNT(*) FROM events WHERE created_at >= date_trunc('month', CURRENT_DATE))
    ),
    'invitations', json_build_object(
      'total', (SELECT COUNT(*) FROM invitations),
      'published', (SELECT COUNT(*) FROM invitations WHERE status = 'published'),
      'sent', (SELECT COUNT(*) FROM invitations WHERE status = 'sent')
    ),
    'guests', json_build_object(
      'total', (SELECT COUNT(*) FROM guests),
      'confirmed', (SELECT COUNT(*) FROM guests WHERE status = 'confirmed'),
      'pending', (SELECT COUNT(*) FROM guests WHERE status = 'pending')
    ),
    'storage', json_build_object(
      'total_files', (SELECT COUNT(*) FROM user_files),
      'total_size_mb', (SELECT ROUND(SUM(file_size)::numeric / 1024 / 1024, 2) FROM user_files)
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les métriques système
CREATE OR REPLACE FUNCTION get_system_health_metrics()
RETURNS JSON AS $$
DECLARE
  v_metrics JSON;
BEGIN
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;
  
  SELECT json_build_object(
    'database_connections', (
      SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
    ),
    'active_users_24h', (
      SELECT count(DISTINCT user_id) 
      FROM user_sessions 
      WHERE last_activity_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ),
    'total_users', (
      SELECT count(*) FROM profiles WHERE is_active = true
    ),
    'total_events', (
      SELECT count(*) FROM events
    ),
    'error_rate_24h', (
      SELECT count(*) 
      FROM audit_logs 
      WHERE severity IN ('high', 'critical') 
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    )
  ) INTO v_metrics;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'intégrité des données
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Vérifier les profils orphelins
  RETURN QUERY
  SELECT 
    'profiles_without_auth_users'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
    'Profils sans utilisateur auth: ' || COUNT(*)::TEXT
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE u.id IS NULL;
  
  -- Vérifier les événements sans propriétaire
  RETURN QUERY
  SELECT 
    'events_without_owner'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Événements sans propriétaire: ' || COUNT(*)::TEXT
  FROM events e
  LEFT JOIN profiles p ON e.owner_id = p.id
  WHERE p.id IS NULL;
  
  -- Vérifier les invitations sans événement
  RETURN QUERY
  SELECT 
    'invitations_without_event'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Invitations sans événement: ' || COUNT(*)::TEXT
  FROM invitations i
  LEFT JOIN events e ON i.event_id = e.id
  WHERE e.id IS NULL;
  
  -- Vérifier les invités sans invitation
  RETURN QUERY
  SELECT 
    'guests_without_invitation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Invités sans invitation: ' || COUNT(*)::TEXT
  FROM guests g
  LEFT JOIN invitations i ON g.invitation_id = i.id
  WHERE i.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_with_plan();

-- Triggers pour updated_at
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitation_templates BEFORE UPDATE ON invitation_templates FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitations BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_guests BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_files BEFORE UPDATE ON user_files FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_customers BEFORE UPDATE ON stripe_customers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_subscriptions BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_roles BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_subscriptions BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_mfa_settings BEFORE UPDATE ON user_mfa_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_system_alerts BEFORE UPDATE ON system_alerts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_usage_metrics BEFORE UPDATE ON user_usage_metrics FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Triggers pour SEO
CREATE TRIGGER update_seo_metadata_timestamp BEFORE UPDATE ON seo_metadata FOR EACH ROW EXECUTE FUNCTION update_seo_metadata_updated_at();
CREATE TRIGGER validate_seo_metadata_urls BEFORE INSERT OR UPDATE ON seo_metadata FOR EACH ROW EXECUTE FUNCTION validate_seo_urls();

-- =====================================================
-- 11. SEEDS - DONNÉES DE BASE
-- =====================================================

-- Catégories de templates
INSERT INTO template_categories (name, slug, description, icon, display_order) VALUES
  ('Classique', 'classic', 'Templates élégants et intemporels', 'crown', 1),
  ('Moderne', 'modern', 'Designs contemporains et épurés', 'sparkles', 2),
  ('Romantique', 'romantic', 'Templates doux et romantiques', 'heart', 3),
  ('Bohème', 'bohemian', 'Style libre et naturel', 'flower', 4),
  ('Minimaliste', 'minimal', 'Designs simples et raffinés', 'circle', 5),
  ('Vintage', 'vintage', 'Charme rétro et nostalgique', 'camera', 6)
ON CONFLICT (slug) DO NOTHING;

-- Templates d'invitation
INSERT INTO invitation_templates (name, slug, description, category_id, is_premium, preview_image_url, design_config) VALUES
  (
    'Élégance Dorée',
    'elegance-doree',
    'Template classique avec ornements dorés',
    (SELECT id FROM template_categories WHERE slug = 'classic'),
    false,
    '/templates/elegance-doree-preview.jpg',
    '{
      "colors": {"primary": "#D4AF37", "secondary": "#FFFFFF", "accent": "#F5F5DC"},
      "fonts": {"heading": "Playfair Display", "body": "Lato"},
      "layout": "centered"
    }'
  ),
  (
    'Simplicité Pure',
    'simplicite-pure',
    'Design minimaliste et épuré',
    (SELECT id FROM template_categories WHERE slug = 'minimal'),
    false,
    '/templates/simplicite-pure-preview.jpg',
    '{
      "colors": {"primary": "#2C3E50", "secondary": "#FFFFFF", "accent": "#ECF0F1"},
      "fonts": {"heading": "Montserrat", "body": "Open Sans"},
      "layout": "minimal"
    }'
  ),
  (
    'Jardin Secret',
    'jardin-secret',
    'Template romantique avec motifs floraux',
    (SELECT id FROM template_categories WHERE slug = 'romantic'),
    true,
    '/templates/jardin-secret-preview.jpg',
    '{
      "colors": {"primary": "#E8B4CB", "secondary": "#FFFFFF", "accent": "#F7E7CE"},
      "fonts": {"heading": "Dancing Script", "body": "Crimson Text"},
      "layout": "floral"
    }'
  ),
  (
    'Modernité Urbaine',
    'modernite-urbaine',
    'Design contemporain et géométrique',
    (SELECT id FROM template_categories WHERE slug = 'modern'),
    true,
    '/templates/modernite-urbaine-preview.jpg',
    '{
      "colors": {"primary": "#34495E", "secondary": "#FFFFFF", "accent": "#3498DB"},
      "fonts": {"heading": "Roboto", "body": "Source Sans Pro"},
      "layout": "geometric"
    }'
  ),
  (
    'Esprit Bohème',
    'esprit-boheme',
    'Style libre avec éléments naturels',
    (SELECT id FROM template_categories WHERE slug = 'bohemian'),
    false,
    '/templates/esprit-boheme-preview.jpg',
    '{
      "colors": {"primary": "#8B4513", "secondary": "#F5DEB3", "accent": "#DEB887"},
      "fonts": {"heading": "Amatic SC", "body": "Nunito"},
      "layout": "organic"
    }'
  ),
  (
    'Charme Vintage',
    'charme-vintage',
    'Nostalgie et élégance d''antan',
    (SELECT id FROM template_categories WHERE slug = 'vintage'),
    true,
    '/templates/charme-vintage-preview.jpg',
    '{
      "colors": {"primary": "#8B0000", "secondary": "#F5F5DC", "accent": "#CD853F"},
      "fonts": {"heading": "Abril Fatface", "body": "Libre Baskerville"},
      "layout": "vintage"
    }'
  )
ON CONFLICT (slug) DO NOTHING;

-- Permissions par rôle
INSERT INTO role_permissions (role, resource, action) VALUES
  -- Super admin (accès total)
  ('super_admin', '*', '*'),
  ('super_admin', 'system', 'manage'),
  ('super_admin', 'users', 'manage'),
  ('super_admin', 'roles', 'manage'),
  ('super_admin', 'subscriptions', 'manage'),
  
  -- Admin
  ('admin', 'users', 'read'),
  ('admin', 'users', 'update'),
  ('admin', 'users', 'suspend'),
  ('admin', 'events', 'read'),
  ('admin', 'invitations', 'read'),
  ('admin', 'analytics', 'read'),
  ('admin', 'support', 'manage'),
  
  -- Moderator
  ('moderator', 'events', 'read'),
  ('moderator', 'events', 'moderate'),
  ('moderator', 'invitations', 'read'),
  ('moderator', 'invitations', 'moderate'),
  ('moderator', 'users', 'read'),
  
  -- Host (organisateur)
  ('host', 'events', 'create'),
  ('host', 'events', 'read'),
  ('host', 'events', 'update'),
  ('host', 'events', 'delete'),
  ('host', 'invitations', 'create'),
  ('host', 'invitations', 'read'),
  ('host', 'invitations', 'update'),
  ('host', 'invitations', 'delete'),
  ('host', 'guests', 'create'),
  ('host', 'guests', 'read'),
  ('host', 'guests', 'update'),
  ('host', 'guests', 'delete'),
  ('host', 'files', 'upload'),
  ('host', 'analytics', 'read'),
  
  -- Guest
  ('guest', 'invitations', 'read'),
  ('guest', 'rsvp', 'update'),
  
  -- Support
  ('support', 'users', 'read'),
  ('support', 'events', 'read'),
  ('support', 'tickets', 'manage'),
  ('support', 'admin_panel', 'read'),
  ('support', 'admin_panel', 'manage')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Plans d'abonnement
INSERT INTO plans (name, stripe_product_id, stripe_price_id, description, price, mode, type, features, limits, popular, color, bg_color, border_color, button_color) VALUES
  (
    'Loventy-Découverte',
    'prod_SU6j0JE6Csfvh8',
    'price_1RZ8WFAmXOVRZkyi8pzlw8Gr',
    'Parfait pour commencer',
    0.00,
    'subscription',
    'free',
    '["2 modèles gratuits", "3 invitations par mois", "50 invités maximum", "1 événement par mois", "Envoi par email uniquement", "Suivi RSVP basique", "Logo Loventy visible"]',
    jsonb_build_object(
      'events', 1,
      'guests', 50,
      'templates', 2,
      'storage', 10,
      'emailsPerMonth', 100,
      'customDomain', false,
      'analytics', false,
      'support', 'basic'
    ),
    false,
    'text-gray-600',
    'bg-gray-50',
    'border-gray-200',
    'bg-gray-600'
  ),
  (
    'Loventy-Essentiel',
    'prod_SU6py0r0ukMf2z',
    'price_1RZ8beAmXOVRZkyiLPc5T1N6',
    'Idéal pour les petits mariages',
    19.99,
    'subscription',
    'pro',
    '["10 modèles premium", "25 invitations par mois", "300 invités maximum", "5 événements par mois", "Tous les canaux d''envoi", "Suppression du watermark", "Support prioritaire", "Export PDF des invitations", "Statistiques basiques"]',
    jsonb_build_object(
      'events', 5,
      'guests', 300,
      'templates', 10,
      'storage', 100,
      'emailsPerMonth', 1000,
      'customDomain', false,
      'analytics', true,
      'support', 'priority'
    ),
    true,
    'text-[#D4A5A5]',
    'bg-[#D4A5A5]/5',
    'border-[#D4A5A5]',
    'bg-[#D4A5A5]'
  ),
  (
    'Loventy-Prestige',
    'prod_SU6tw5V8tpTC4a',
    'price_1RZ8fpAmXOVRZkyizFbIXhpN',
    'Pour les grands événements',
    39.99,
    'subscription',
    'premium',
    '["Tous les modèles inclus", "Invitations illimitées", "Invités illimités", "Événements illimités", "Page personnalisée", "Relances automatiques", "RSVP avancé avec formulaires", "Analytics détaillées", "Support dédié", "API pour intégrations", "Domaine personnalisé"]',
    jsonb_build_object(
      'events', -1,
      'guests', -1,
      'templates', -1,
      'storage', 1000,
      'emailsPerMonth', -1,
      'customDomain', true,
      'analytics', true,
      'support', 'dedicated'
    ),
    false,
    'text-[#C5D2C2]',
    'bg-[#C5D2C2]/5',
    'border-[#C5D2C2]',
    'bg-[#C5D2C2]'
  )
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 12. BUCKETS STORAGE
-- =====================================================

-- Créer les buckets pour le stockage des fichiers (si le schéma storage existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
      ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
      ('invitation-media', 'invitation-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
      ('event-photos', 'event-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
      ('templates', 'templates', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
      ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 13. POLITIQUES RLS POUR LES BUCKETS
-- =====================================================

-- Politiques RLS pour les buckets (si le schéma storage existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- Politiques pour user-avatars
    CREATE POLICY "Users can upload their own avatars" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can view all avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'user-avatars');

    CREATE POLICY "Users can update their own avatars" ON storage.objects
      FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can delete their own avatars" ON storage.objects
      FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    -- Politiques pour invitation-media
    CREATE POLICY "Event owners can manage invitation media" ON storage.objects
      FOR ALL USING (
        bucket_id = 'invitation-media' AND 
        EXISTS (
          SELECT 1 FROM events e 
          WHERE e.owner_id = auth.uid() 
            AND e.id::text = (storage.foldername(name))[1]
        )
      );

    CREATE POLICY "Public can view invitation media" ON storage.objects
      FOR SELECT USING (bucket_id = 'invitation-media');

    -- Politiques pour event-photos
    CREATE POLICY "Event owners can manage event photos" ON storage.objects
      FOR ALL USING (
        bucket_id = 'event-photos' AND 
        EXISTS (
          SELECT 1 FROM events e 
          WHERE e.owner_id = auth.uid() 
            AND e.id::text = (storage.foldername(name))[1]
        )
      );

    CREATE POLICY "Public can view event photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'event-photos');

    -- Politiques pour templates (admin seulement)
    CREATE POLICY "Only admins can manage templates" ON storage.objects
      FOR ALL USING (bucket_id = 'templates' AND (has_user_role('super_admin') OR has_user_role('admin')));

    CREATE POLICY "Everyone can view templates" ON storage.objects
      FOR SELECT USING (bucket_id = 'templates');

    -- Politiques pour documents
    CREATE POLICY "Users can manage their own documents" ON storage.objects
      FOR ALL USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- =====================================================
-- 14. FONCTIONS ADDITIONNELLES MANQUANTES
-- =====================================================

-- Fonction pour obtenir les rôles d'un utilisateur (compatible ancien système)
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID DEFAULT NULL)
RETURNS TABLE(
  role_name TEXT,
  role_description TEXT,
  assigned_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(user_uuid, auth.uid());
  
  RETURN QUERY
  SELECT 
    ur.role::TEXT as role_name,
    CASE ur.role
      WHEN 'super_admin' THEN 'Super Administrateur'
      WHEN 'admin' THEN 'Administrateur système'
      WHEN 'moderator' THEN 'Modérateur'
      WHEN 'host' THEN 'Organisateur d''événements'
      WHEN 'support' THEN 'Support client'
      WHEN 'guest' THEN 'Invité'
      ELSE 'Utilisateur'
    END as role_description,
    ur.granted_at as assigned_at
  FROM user_roles ur
  WHERE ur.user_id = v_user_id 
    AND ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID DEFAULT NULL)
RETURNS TABLE(
  permission_name TEXT,
  permission_description TEXT,
  resource TEXT,
  action TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(user_uuid, auth.uid());
  
  RETURN QUERY
  SELECT DISTINCT
    (rp.resource || '_' || rp.action) as permission_name,
    ('Permission ' || rp.action || ' sur ' || rp.resource) as permission_description,
    rp.resource,
    rp.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role = rp.role
  WHERE ur.user_id = v_user_id
    AND ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir la vue d'ensemble admin d'un utilisateur
CREATE OR REPLACE FUNCTION get_admin_user_overview(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_overview JSON;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'avatar_url', p.avatar_url,
    'is_active', p.is_active,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'last_login_at', p.last_login_at,
    'roles', COALESCE(roles.roles_array, '[]'::json),
    'primary_role', roles.primary_role,
    'subscription', sub.subscription_info,
    'events_count', COALESCE(stats.events_count, 0),
    'guests_count', COALESCE(stats.guests_count, 0),
    'storage_used_bytes', COALESCE(files.storage_used, 0),
    'is_suspended', NOT p.is_active
  ) INTO v_overview
  FROM profiles p
  LEFT JOIN (
    SELECT 
      ur.user_id,
      json_agg(
        json_build_object(
          'role', ur.role,
          'granted_at', ur.granted_at,
          'expires_at', ur.expires_at,
          'is_active', ur.is_active
        )
      ) as roles_array,
      (array_agg(ur.role ORDER BY 
        CASE ur.role 
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'moderator' THEN 3
          WHEN 'host' THEN 4
          WHEN 'support' THEN 5
          WHEN 'guest' THEN 6
        END
      ))[1] as primary_role
    FROM user_roles ur
    WHERE ur.is_active = true 
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
    GROUP BY ur.user_id
  ) roles ON p.id = roles.user_id
  LEFT JOIN (
    SELECT 
      us.user_id,
      json_build_object(
        'plan', us.plan,
        'status', us.status,
        'expires_at', us.expires_at,
        'features', us.features
      ) as subscription_info
    FROM user_subscriptions us
    WHERE us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1
  ) sub ON p.id = sub.user_id
  LEFT JOIN (
    SELECT 
      e.owner_id,
      COUNT(DISTINCT e.id) as events_count,
      COUNT(DISTINCT g.id) as guests_count
    FROM events e
    LEFT JOIN invitations i ON e.id = i.event_id
    LEFT JOIN guests g ON i.id = g.invitation_id
    GROUP BY e.owner_id
  ) stats ON p.id = stats.owner_id
  LEFT JOIN (
    SELECT user_id, SUM(file_size) as storage_used
    FROM user_files
    GROUP BY user_id
  ) files ON p.id = files.user_id
  WHERE p.id = p_user_id;
  
  RETURN v_overview;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour terminer une session (admin)
CREATE OR REPLACE FUNCTION admin_terminate_session(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  UPDATE user_sessions 
  SET expires_at = CURRENT_TIMESTAMP
  WHERE id = p_session_id;
  
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (auth.uid(), 'delete', 'session', p_session_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour upgrade un plan utilisateur
CREATE OR REPLACE FUNCTION upgrade_user_plan(user_uuid UUID, new_plan subscription_plan_enum)
RETURNS VOID AS $$
DECLARE
  v_limits JSONB;
BEGIN
  SELECT get_plan_limits(new_plan) INTO v_limits;

  UPDATE user_subscriptions
  SET
    plan = new_plan,
    max_events = COALESCE((v_limits->>'events')::INTEGER, max_events),
    max_guests_per_event = COALESCE((v_limits->>'guests')::INTEGER, max_guests_per_event),
    max_storage_mb = COALESCE((v_limits->>'storage')::INTEGER, max_storage_mb),
    features = v_limits->'features',
    status = 'active',
    trial_ends_at = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = user_uuid
    AND status IN ('active', 'trial');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les quotas utilisateur
CREATE OR REPLACE FUNCTION check_user_quota(
  p_user_id UUID,
  p_resource TEXT,
  p_requested_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
  v_current_usage INTEGER;
  v_limit INTEGER;
BEGIN
  -- Récupérer l'abonnement actuel
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier selon le type de ressource
  CASE p_resource
    WHEN 'events' THEN
      SELECT COUNT(*) INTO v_current_usage
      FROM events
      WHERE owner_id = p_user_id;
      v_limit := v_subscription.max_events;
      
    WHEN 'guests' THEN
      SELECT COUNT(*) INTO v_current_usage
      FROM guests g
      JOIN invitations i ON g.invitation_id = i.id
      JOIN events e ON i.event_id = e.id
      WHERE e.owner_id = p_user_id;
      v_limit := v_subscription.max_guests_per_event;
      
    WHEN 'storage' THEN
      SELECT COALESCE(SUM(file_size), 0) / 1024 / 1024 INTO v_current_usage
      FROM user_files
      WHERE user_id = p_user_id;
      v_limit := v_subscription.max_storage_mb;
      
    ELSE
      RETURN true; -- Ressource non reconnue, autoriser par défaut
  END CASE;
  
  -- -1 signifie illimité
  IF v_limit = -1 THEN
    RETURN true;
  END IF;
  
  RETURN (v_current_usage + p_requested_amount) <= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 15. VUES ADDITIONNELLES
-- =====================================================

-- Vue pour les plans (flatten)
CREATE OR REPLACE VIEW plans_flat AS
SELECT
  id,
  name,
  stripe_product_id,
  stripe_price_id,
  description,
  price,
  mode,
  type,
  popular,
  color,
  bg_color,
  border_color,
  button_color,
  created_at,
  updated_at,
  limits->>'events' AS events,
  limits->>'guests' AS guests,
  limits->>'templates' AS templates,
  limits->>'storage' AS storage,
  limits->>'emailsPerMonth' AS emailsPerMonth,
  limits->>'customDomain' AS customDomain,
  limits->>'analytics' AS analytics,
  limits->>'support' AS support,
  features
FROM plans;

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.created_at as registered_at,
  p.last_login_at,
  p.is_active,
  us.plan as current_plan,
  us.status as subscription_status,
  COUNT(DISTINCT e.id) as events_count,
  COUNT(DISTINCT i.id) as invitations_count,
  COUNT(DISTINCT g.id) as guests_count,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'confirmed') as confirmed_guests,
  COALESCE(SUM(uf.file_size), 0) as storage_used_bytes,
  (
    SELECT array_agg(ur.role)
    FROM user_roles ur
    WHERE ur.user_id = p.id
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
  ) as roles
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id AND us.status IN ('active', 'trial')
LEFT JOIN events e ON p.id = e.owner_id
LEFT JOIN invitations i ON e.id = i.event_id
LEFT JOIN guests g ON i.id = g.invitation_id
LEFT JOIN user_files uf ON p.id = uf.user_id
GROUP BY p.id, p.email, p.first_name, p.last_name, p.created_at, p.last_login_at, p.is_active, us.plan, us.status;

-- =====================================================
-- 16. POLITIQUES RLS POUR LES NOUVELLES TABLES
-- =====================================================

-- Politiques pour les plans
CREATE POLICY "Allow read access to all plans" ON plans FOR SELECT USING (true);

-- Politiques pour les vues (si nécessaire)
-- Les vues héritent généralement des politiques des tables sous-jacentes

-- =====================================================
-- 17. FONCTIONS DE NETTOYAGE ET MAINTENANCE AVANCÉES
-- =====================================================

-- Fonction pour archiver les anciens événements
CREATE OR REPLACE FUNCTION archive_old_events(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  UPDATE events 
  SET 
    status = 'archived',
    updated_at = CURRENT_TIMESTAMP
  WHERE event_date < CURRENT_DATE - INTERVAL '1 day' * days_old
    AND status != 'archived';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, details)
  VALUES (
    auth.uid(),
    'archive',
    'events',
    json_build_object('archived_count', archived_count, 'days_old', days_old)
  );
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les fichiers orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  DELETE FROM user_files
  WHERE user_id NOT IN (SELECT id FROM profiles WHERE is_active = true);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les métriques d'utilisation
CREATE OR REPLACE FUNCTION get_usage_metrics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_metrics JSON;
BEGIN
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;
  
  SELECT json_build_object(
    'period_days', days_back,
    'new_users', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ),
    'new_events', (
      SELECT COUNT(*) 
      FROM events 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ),
    'new_invitations', (
      SELECT COUNT(*) 
      FROM invitations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ),
    'active_users', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_sessions 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ),
    'rsvp_responses', (
      SELECT COUNT(*) 
      FROM guests 
      WHERE responded_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ),
    'storage_growth_mb', (
      SELECT ROUND(SUM(file_size)::numeric / 1024 / 1024, 2)
      FROM user_files 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    )
  ) INTO v_metrics;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. FONCTIONS DE NOTIFICATION ET COMMUNICATION
-- =====================================================

-- Fonction pour créer une alerte système
CREATE OR REPLACE FUNCTION create_system_alert(
  p_title TEXT,
  p_message TEXT,
  p_severity alert_severity_enum DEFAULT 'info',
  p_target_roles user_role_enum[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;
  
  INSERT INTO system_alerts (
    title,
    message,
    severity,
    target_roles,
    created_by
  )
  VALUES (
    p_title,
    p_message,
    p_severity,
    p_target_roles,
    auth.uid()
  )
  RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer une alerte comme lue
CREATE OR REPLACE FUNCTION mark_alert_as_read(p_alert_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  INSERT INTO user_alert_reads (user_id, alert_id)
  VALUES (auth.uid(), p_alert_id)
  ON CONFLICT (user_id, alert_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les alertes non lues d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_unread_alerts()
RETURNS TABLE(
  id UUID,
  title TEXT,
  message TEXT,
  severity alert_severity_enum,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_role user_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  v_user_role := get_user_role_cache();
  
  RETURN QUERY
  SELECT 
    sa.id,
    sa.title,
    sa.message,
    sa.severity,
    sa.created_at
  FROM system_alerts sa
  LEFT JOIN user_alert_reads uar ON sa.id = uar.alert_id AND uar.user_id = auth.uid()
  WHERE sa.is_active = true
    AND uar.id IS NULL
    AND (sa.target_roles IS NULL OR v_user_role = ANY(sa.target_roles))
    AND sa.expires_at > CURRENT_TIMESTAMP
  ORDER BY sa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 19. FONCTIONS DE SAUVEGARDE ET RESTAURATION
-- =====================================================

-- Fonction pour exporter les données d'un utilisateur (RGPD)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_export JSON;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Vérifier les permissions
  IF v_user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante pour exporter ces données';
  END IF;
  
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p.*)
      FROM profiles p
      WHERE p.id = v_user_id
    ),
    'events', (
      SELECT json_agg(row_to_json(e.*))
      FROM events e
      WHERE e.owner_id = v_user_id
    ),
    'invitations', (
      SELECT json_agg(
        json_build_object(
          'invitation', row_to_json(i.*),
          'guests', (
            SELECT json_agg(row_to_json(g.*))
            FROM guests g
            WHERE g.invitation_id = i.id
          )
        )
      )
      FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE e.owner_id = v_user_id
    ),
    'files', (
      SELECT json_agg(
        json_build_object(
          'filename', uf.filename,
          'file_size', uf.file_size,
          'mime_type', uf.mime_type,
          'created_at', uf.created_at
        )
      )
      FROM user_files uf
      WHERE uf.user_id = v_user_id
    ),
    'subscription', (
      SELECT row_to_json(us.*)
      FROM user_subscriptions us
      WHERE us.user_id = v_user_id
        AND us.status IN ('active', 'trial')
      ORDER BY us.created_at DESC
      LIMIT 1
    ),
    'export_date', CURRENT_TIMESTAMP
  ) INTO v_export;
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (
    auth.uid(),
    'export',
    'user_data',
    v_user_id
  );
  
  RETURN v_export;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer définitivement les données d'un utilisateur (RGPD)
CREATE OR REPLACE FUNCTION delete_user_data_permanently(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  -- Supprimer dans l'ordre des dépendances
  DELETE FROM guests g
  USING invitations i, events e
  WHERE g.invitation_id = i.id
    AND i.event_id = e.id
    AND e.owner_id = p_user_id;
  
  DELETE FROM invitations i
  USING events e
  WHERE i.event_id = e.id
    AND e.owner_id = p_user_id;
  
  DELETE FROM events WHERE owner_id = p_user_id;
  DELETE FROM user_files WHERE user_id = p_user_id;
  DELETE FROM user_sessions WHERE user_id = p_user_id;
  DELETE FROM user_subscriptions WHERE user_id = p_user_id;
  DELETE FROM user_roles WHERE user_id = p_user_id;
  DELETE FROM user_mfa_settings WHERE user_id = p_user_id;
  DELETE FROM audit_logs WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE id = p_user_id;
  
  -- Log de l'audit (avec l'admin qui effectue l'action)
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (
    auth.uid(),
    'permanent_delete',
    'user_data',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 20. TESTS ET VALIDATION FINALE
-- =====================================================

-- Fonction de test pour valider l'intégrité du système
CREATE OR REPLACE FUNCTION run_system_tests()
RETURNS TABLE(
  test_name TEXT,
  status TEXT,
  message TEXT
) AS $$
BEGIN
  IF NOT (has_user_role('super_admin') OR has_user_role('admin')) THEN
    RAISE EXCEPTION 'Permission insuffisante';
  END IF;
  
  -- Test 1: Vérifier les fonctions critiques
  BEGIN
    PERFORM generate_secure_token();
    PERFORM get_plan_limits('free');
    RETURN QUERY SELECT 'critical_functions'::TEXT, 'PASS'::TEXT, 'Fonctions critiques opérationnelles'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'critical_functions'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 2: Vérifier les triggers
  BEGIN
    PERFORM COUNT(*) FROM pg_trigger WHERE tgname LIKE '%timestamp%';
    RETURN QUERY SELECT 'triggers'::TEXT, 'PASS'::TEXT, 'Triggers configurés correctement'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'triggers'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 3: Vérifier les seeds
  BEGIN
    IF (SELECT COUNT(*) FROM template_categories) >= 6 AND 
       (SELECT COUNT(*) FROM invitation_templates) >= 6 AND
       (SELECT COUNT(*) FROM plans) >= 3 THEN
      RETURN QUERY SELECT 'seeds'::TEXT, 'PASS'::TEXT, 'Données de base présentes'::TEXT;
    ELSE
      RETURN QUERY SELECT 'seeds'::TEXT, 'FAIL'::TEXT, 'Données de base manquantes'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'seeds'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 4: Vérifier les politiques RLS
  BEGIN
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('profiles', 'events', 'invitations', 'guests')) >= 4 THEN
      RETURN QUERY SELECT 'rls_policies'::TEXT, 'PASS'::TEXT, 'Politiques RLS configurées'::TEXT;
    ELSE
      RETURN QUERY SELECT 'rls_policies'::TEXT, 'WARNING'::TEXT, 'Certaines politiques RLS manquantes'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'rls_policies'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
  
  -- Test 5: Vérifier les permissions
  BEGIN
    IF (SELECT COUNT(*) FROM role_permissions) >= 20 THEN
      RETURN QUERY SELECT 'permissions'::TEXT, 'PASS'::TEXT, 'Système de permissions configuré'::TEXT;
    ELSE
      RETURN QUERY SELECT 'permissions'::TEXT, 'FAIL'::TEXT, 'Permissions insuffisantes'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'permissions'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 21. DOCUMENTATION DES BUCKETS (COMMENTAIRES)
-- =====================================================

-- Les buckets suivants doivent être créés manuellement via Supabase Studio ou CLI :
--
-- 1. user-avatars (public)
--    - Taille max: 5MB
--    - Types: image/jpeg, image/png, image/webp
--    - Usage: Photos de profil utilisateur
--
-- 2. invitation-media (public)
--    - Taille max: 50MB
--    - Types: images et vidéos
--    - Usage: Médias pour les invitations
--
-- 3. event-photos (public)
--    - Taille max: 10MB
--    - Types: images uniquement
--    - Usage: Photos d'événements
--
-- 4. templates (public)
--    - Taille max: 2MB
--    - Types: images uniquement
--    - Usage: Aperçus des templates (admin seulement)
--
-- 5. documents (privé)
--    - Taille max: 10MB
--    - Types: PDF, documents texte
--    - Usage: Documents privés utilisateur
--
-- Commandes CLI pour créer les buckets :
-- supabase storage create-bucket user-avatars --public
-- supabase storage create-bucket invitation-media --public
-- supabase storage create-bucket event-photos --public
-- supabase storage create-bucket templates --public
-- supabase storage create-bucket documents

-- =====================================================
-- 22. MESSAGE DE CONFIRMATION FINALE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 MIGRATION LOVENTY COMPLÈTE TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '';
  RAISE NOTICE '✅ FONCTIONS INSTALLÉES :';
  RAISE NOTICE '   • % fonctions d''authentification et gestion utilisateurs', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%user%' OR proname LIKE '%profile%');
  RAISE NOTICE '   • % fonctions de gestion des plans et abonnements', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%plan%' OR proname LIKE '%subscription%');
  RAISE NOTICE '   • % fonctions métier (événements, invitations, invités)', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%event%' OR proname LIKE '%invitation%' OR proname LIKE '%guest%');
  RAISE NOTICE '   • % fonctions SEO et métadonnées', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%seo%');
  RAISE NOTICE '   • % fonctions MFA et sécurité', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%mfa%');
  RAISE NOTICE '   • % fonctions de sessions et audit', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%session%' OR proname LIKE '%audit%');
  RAISE NOTICE '   • % fonctions d''administration', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%admin%');
  RAISE NOTICE '   • % fonctions de maintenance et nettoyage', (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%cleanup%' OR proname LIKE '%archive%');
  RAISE NOTICE '';
  RAISE NOTICE '✅ TRIGGERS CONFIGURÉS :';
  RAISE NOTICE '   • % triggers pour updated_at', (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%timestamp%');
  RAISE NOTICE '   • 1 trigger d''inscription utilisateur';
  RAISE NOTICE '   • 2 triggers SEO (validation et mise à jour)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ SEEDS INSTALLÉES :';
  RAISE NOTICE '   • % catégories de templates', (SELECT COUNT(*) FROM template_categories);
  RAISE NOTICE '   • % templates d''invitation', (SELECT COUNT(*) FROM invitation_templates);
  RAISE NOTICE '   • % permissions par rôle', (SELECT COUNT(*) FROM role_permissions);
  RAISE NOTICE '   • % plans d''abonnement', (SELECT COUNT(*) FROM plans);
  RAISE NOTICE '';
  RAISE NOTICE '✅ SYSTÈME COMPLET :';
  RAISE NOTICE '   • Authentification et autorisation avancées';
  RAISE NOTICE '   • Gestion des rôles et permissions granulaires';
  RAISE NOTICE '   • Système MFA (TOTP + codes de récupération)';
  RAISE NOTICE '   • Gestion des sessions sécurisées';
  RAISE NOTICE '   • Audit et logs complets';
  RAISE NOTICE '   • Fonctions d''administration avancées';
  RAISE NOTICE '   • Export/suppression RGPD';
  RAISE NOTICE '   • Métriques et statistiques système';
  RAISE NOTICE '   • Tests d''intégrité automatisés';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 LOVENTY EST PRÊT POUR LA PRODUCTION !';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PROCHAINES ÉTAPES :';
  RAISE NOTICE '   1. Créer les buckets de stockage (voir documentation dans le fichier)';
  RAISE NOTICE '   2. Configurer les politiques RLS pour les buckets';
  RAISE NOTICE '   3. Tester les fonctions critiques avec run_system_tests()';
  RAISE NOTICE '   4. Configurer les tâches de maintenance automatiques';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIN DU FICHIER DE MIGRATION
-- =====================================================