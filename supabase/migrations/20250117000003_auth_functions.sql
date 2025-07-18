/*
  # Fonctions d'authentification adaptées aux nouvelles tables
  
  Fonctions RPC sécurisées pour :
  - Gestion des profils utilisateur
  - Système de rôles simplifié
  - Sessions et audit
  - Fonctions admin
*/

-- =====================================================
-- FONCTIONS DE GESTION DES PROFILS
-- =====================================================

-- Fonction pour créer un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'host'::user_role_type
  );
  
  -- Créer une session d'audit
  INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
  VALUES (
    NEW.id,
    generate_secure_token(),
    '0.0.0.0'::inet,
    'Registration',
    CURRENT_TIMESTAMP + INTERVAL '24 hours'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction pour obtenir le profil utilisateur complet
CREATE OR REPLACE FUNCTION get_user_profile(target_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_profile JSON;
BEGIN
  -- Utiliser l'ID fourni ou l'utilisateur actuel
  v_user_id := COALESCE(target_user_id, auth.uid());
  
  -- Vérifier les permissions (utilisateur lui-même ou admin)
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
    'role', p.role,
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
  -- Vérifier que l'utilisateur est connecté
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
-- FONCTIONS DE GESTION DES RÔLES SIMPLIFIÉES
-- =====================================================

-- Fonction pour obtenir les rôles d'un utilisateur (simplifié)
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
  
  -- Pour le système simplifié, retourner le rôle depuis la table profiles
  RETURN QUERY
  SELECT 
    p.role::TEXT as role_name,
    CASE p.role
      WHEN 'admin' THEN 'Administrateur système'
      WHEN 'host' THEN 'Organisateur d''événements'
      WHEN 'guest' THEN 'Invité'
      ELSE 'Utilisateur'
    END as role_description,
    p.created_at as assigned_at
  FROM profiles p
  WHERE p.id = v_user_id AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les permissions d'un utilisateur (simplifié)
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID DEFAULT NULL)
RETURNS TABLE(
  permission_name TEXT,
  permission_description TEXT,
  resource TEXT,
  action TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_user_role user_role_type;
BEGIN
  v_user_id := COALESCE(user_uuid, auth.uid());
  
  -- Récupérer le rôle de l'utilisateur
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id AND is_active = true;
  
  -- Retourner les permissions selon le rôle
  IF v_user_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      'admin_full_access'::TEXT as permission_name,
      'Accès complet administrateur'::TEXT as permission_description,
      '*'::TEXT as resource,
      '*'::TEXT as action
    UNION ALL
    SELECT 
      'manage_users'::TEXT,
      'Gestion des utilisateurs'::TEXT,
      'users'::TEXT,
      'manage'::TEXT
    UNION ALL
    SELECT 
      'view_analytics'::TEXT,
      'Consultation des analytics'::TEXT,
      'analytics'::TEXT,
      'read'::TEXT;
  ELSIF v_user_role = 'host' THEN
    RETURN QUERY
    SELECT 
      'manage_events'::TEXT as permission_name,
      'Gestion des événements'::TEXT as permission_description,
      'events'::TEXT as resource,
      'manage'::TEXT as action
    UNION ALL
    SELECT 
      'manage_invitations'::TEXT,
      'Gestion des invitations'::TEXT,
      'invitations'::TEXT,
      'manage'::TEXT
    UNION ALL
    SELECT 
      'manage_guests'::TEXT,
      'Gestion des invités'::TEXT,
      'guests'::TEXT,
      'manage'::TEXT;
  ELSE
    RETURN QUERY
    SELECT 
      'view_invitation'::TEXT as permission_name,
      'Consultation des invitations'::TEXT as permission_description,
      'invitations'::TEXT as resource,
      'read'::TEXT as action;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS DE GESTION DES SESSIONS
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
    s.created_at as last_active_at, -- Simplification pour l'instant
    s.ip_address::TEXT,
    s.user_agent,
    s.expires_at,
    false as is_current_session -- Simplification pour l'instant
  FROM user_sessions s
  WHERE s.user_id = auth.uid()
    AND s.expires_at > CURRENT_TIMESTAMP
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS ADMIN
-- =====================================================

-- Fonction pour suspendre un utilisateur (version simplifiée)
CREATE OR REPLACE FUNCTION admin_suspend_user(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier les permissions admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  -- Désactiver le profil
  UPDATE profiles 
  SET is_active = false
  WHERE id = p_user_id;
  
  -- Log de l'audit
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

-- Fonction pour lever une suspension (version simplifiée)
CREATE OR REPLACE FUNCTION admin_unsuspend_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier les permissions admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  -- Réactiver le profil
  UPDATE profiles 
  SET is_active = true
  WHERE id = p_user_id;
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (auth.uid(), 'unsuspend', 'user', p_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir la vue d'ensemble admin d'un utilisateur
CREATE OR REPLACE FUNCTION get_admin_user_overview(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_overview JSON;
BEGIN
  -- Vérifier les permissions admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'avatar_url', p.avatar_url,
    'role', p.role,
    'is_active', p.is_active,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'last_login_at', p.last_login_at,
    'events_count', COALESCE(stats.events_count, 0),
    'guests_count', COALESCE(stats.guests_count, 0),
    'events_last_30_days', COALESCE(stats.events_last_30_days, 0),
    'guests_last_30_days', COALESCE(stats.guests_last_30_days, 0),
    'storage_used_bytes', COALESCE(stats.storage_used, 0),
    'subscription_status', COALESCE(sub.status, 'inactive'),
    'current_period_end', sub.current_period_end,
    'suspension_reason', CASE WHEN p.is_active = false THEN 'Compte suspendu' ELSE null END,
    'is_suspended', NOT p.is_active
  ) INTO v_overview
  FROM profiles p
  LEFT JOIN (
    SELECT 
      e.owner_id,
      COUNT(DISTINCT e.id) as events_count,
      COUNT(DISTINCT g.id) as guests_count,
      COUNT(DISTINCT e.id) FILTER (WHERE e.created_at >= CURRENT_DATE - INTERVAL '30 days') as events_last_30_days,
      COUNT(DISTINCT g.id) FILTER (WHERE g.created_at >= CURRENT_DATE - INTERVAL '30 days') as guests_last_30_days
    FROM events e
    LEFT JOIN invitations i ON e.id = i.event_id
    LEFT JOIN guests g ON i.id = g.invitation_id
    WHERE e.owner_id = p_user_id
    GROUP BY e.owner_id
  ) stats ON p.id = stats.owner_id
  LEFT JOIN (
    SELECT SUM(file_size) as storage_used
    FROM user_files
    WHERE user_id = p_user_id
  ) files ON true
  LEFT JOIN stripe_subscriptions sub ON sub.customer_id = (
    SELECT customer_id FROM stripe_customers WHERE user_id = p_user_id
  )
  WHERE p.id = p_user_id;
  
  RETURN v_overview;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour terminer une session (admin)
CREATE OR REPLACE FUNCTION admin_terminate_session(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier les permissions admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission insuffisante - Admin requis';
  END IF;
  
  -- Expirer la session
  UPDATE user_sessions 
  SET expires_at = CURRENT_TIMESTAMP
  WHERE id = p_session_id;
  
  -- Log de l'audit
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
  VALUES (auth.uid(), 'delete', 'session', p_session_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS MFA (SIMPLIFIÉES)
-- =====================================================

-- Pour l'instant, fonctions stub pour la compatibilité
CREATE OR REPLACE FUNCTION get_user_mfa_status()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'enabled', false,
    'verified', false,
    'methods', '[]'::json,
    'preferred_method', null
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION setup_mfa(method_type TEXT)
RETURNS JSON AS $$
BEGIN
  -- Stub pour compatibilité
  RETURN json_build_object(
    'secret', null,
    'qr_code', null
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_mfa(code TEXT, method_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Stub pour compatibilité
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION disable_mfa()
RETURNS BOOLEAN AS $$
BEGIN
  -- Stub pour compatibilité
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUES POUR L'ADMINISTRATION
-- =====================================================

-- Vue pour l'aperçu admin des utilisateurs
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.role,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.last_login_at,
  CASE WHEN p.is_active = false THEN 'suspended' ELSE 'active' END as status,
  CASE WHEN p.is_active = false THEN 'Compte suspendu' ELSE null END as suspension_reason,
  COALESCE(stats.events_count, 0) as events_count,
  COALESCE(stats.guests_count, 0) as guests_count,
  COALESCE(stats.events_last_30_days, 0) as events_last_30_days,
  COALESCE(stats.guests_last_30_days, 0) as guests_last_30_days,
  COALESCE(files.storage_used, 0) as storage_used_bytes,
  COALESCE(sub.status, 'inactive') as subscription_status,
  sub.current_period_end
FROM profiles p
LEFT JOIN (
  SELECT 
    e.owner_id,
    COUNT(DISTINCT e.id) as events_count,
    COUNT(DISTINCT g.id) as guests_count,
    COUNT(DISTINCT e.id) FILTER (WHERE e.created_at >= CURRENT_DATE - INTERVAL '30 days') as events_last_30_days,
    COUNT(DISTINCT g.id) FILTER (WHERE g.created_at >= CURRENT_DATE - INTERVAL '30 days') as guests_last_30_days
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
LEFT JOIN stripe_subscriptions sub ON sub.customer_id = (
  SELECT customer_id FROM stripe_customers WHERE user_id = p.id
);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🔐 Fonctions d''authentification créées avec succès !';
  RAISE NOTICE '✅ Gestion des profils utilisateur';
  RAISE NOTICE '✅ Système de rôles simplifié';
  RAISE NOTICE '✅ Gestion des sessions';
  RAISE NOTICE '✅ Fonctions d''administration';
  RAISE NOTICE '✅ Triggers automatiques configurés';
END $$;