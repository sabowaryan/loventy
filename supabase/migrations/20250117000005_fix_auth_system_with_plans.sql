/*
  # Correction du système d'authentification avec rôles granulaires et plans
  
  Cette migration corrige le système d'auth en :
  - Supprimant la colonne role de profiles (trop simpliste)
  - Ajoutant un système de rôles granulaires avec super_admin
  - Ajoutant un système de plans (gratuit, premium, pro)
  - Créant les fonctions d'auth adaptées
  - Assignant automatiquement un plan gratuit aux nouveaux utilisateurs
*/

-- =====================================================
-- SUPPRESSION DE L'ANCIEN SYSTÈME
-- =====================================================

-- Supprimer d'abord toutes les dépendances sur la colonne role

-- Supprimer les politiques RLS qui dépendent de la colonne role
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Only admins can modify templates" ON invitation_templates;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;

-- Supprimer les vues qui dépendent de la colonne role
DROP VIEW IF EXISTS admin_user_overview;

-- Supprimer les fonctions qui dépendent de la colonne role
DROP FUNCTION IF EXISTS is_admin();

-- Maintenant supprimer la colonne role de profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- =====================================================
-- NOUVEAU SYSTÈME DE RÔLES GRANULAIRES
-- =====================================================

-- Types énumérés pour les rôles et plans
CREATE TYPE user_role_enum AS ENUM (
  'super_admin',    -- Contrôle total du système
  'admin',          -- Administration générale
  'moderator',      -- Modération de contenu
  'host',           -- Organisateur d'événements (défaut)
  'guest',          -- Invité
  'support'         -- Support client
);

CREATE TYPE subscription_plan_enum AS ENUM (
  'free',           -- Plan gratuit (défaut)
  'premium',        -- Plan premium
  'pro',            -- Plan professionnel
  'enterprise'      -- Plan entreprise
);

CREATE TYPE plan_status_enum AS ENUM (
  'active',         -- Plan actif
  'trial',          -- Période d'essai
  'expired',        -- Plan expiré
  'cancelled',      -- Plan annulé
  'suspended'       -- Plan suspendu
);

-- =====================================================
-- TABLES POUR LE NOUVEAU SYSTÈME
-- =====================================================

-- Table des rôles système
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'host',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ, -- NULL = permanent
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, role), -- Un utilisateur ne peut avoir qu'une fois le même rôle
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- Table des plans d'abonnement utilisateur
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan_enum NOT NULL DEFAULT 'free',
  status plan_status_enum NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  
  -- Limites du plan
  max_events INTEGER,
  max_guests_per_event INTEGER,
  max_storage_mb INTEGER,
  features JSONB DEFAULT '{}', -- Features disponibles pour ce plan
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_dates CHECK (
    expires_at IS NULL OR expires_at > started_at
  ),
  CONSTRAINT valid_trial CHECK (
    trial_ends_at IS NULL OR trial_ends_at > started_at
  )
);

-- Table des permissions granulaires
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role_enum NOT NULL,
  resource TEXT NOT NULL, -- events, invitations, users, etc.
  action TEXT NOT NULL,   -- create, read, update, delete, manage
  conditions JSONB DEFAULT '{}', -- Conditions supplémentaires
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(role, resource, action)
);

-- =====================================================
-- INDEX DE PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan ON user_subscriptions(plan);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER set_timestamp_user_roles BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_subscriptions BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- DONNÉES DE BASE - PERMISSIONS PAR RÔLE
-- =====================================================

-- Permissions pour super_admin (accès total)
INSERT INTO role_permissions (role, resource, action) VALUES
  ('super_admin', '*', '*'),
  ('super_admin', 'system', 'manage'),
  ('super_admin', 'users', 'manage'),
  ('super_admin', 'roles', 'manage'),
  ('super_admin', 'subscriptions', 'manage');

-- Permissions pour admin
INSERT INTO role_permissions (role, resource, action) VALUES
  ('admin', 'users', 'read'),
  ('admin', 'users', 'update'),
  ('admin', 'users', 'suspend'),
  ('admin', 'events', 'read'),
  ('admin', 'invitations', 'read'),
  ('admin', 'analytics', 'read'),
  ('admin', 'support', 'manage');

-- Permissions pour moderator
INSERT INTO role_permissions (role, resource, action) VALUES
  ('moderator', 'events', 'read'),
  ('moderator', 'events', 'moderate'),
  ('moderator', 'invitations', 'read'),
  ('moderator', 'invitations', 'moderate'),
  ('moderator', 'users', 'read');

-- Permissions pour host (organisateur)
INSERT INTO role_permissions (role, resource, action) VALUES
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
  ('host', 'analytics', 'read');

-- Permissions pour guest
INSERT INTO role_permissions (role, resource, action) VALUES
  ('guest', 'invitations', 'read'),
  ('guest', 'rsvp', 'update');

-- Permissions pour support
INSERT INTO role_permissions (role, resource, action) VALUES
  ('support', 'users', 'read'),
  ('support', 'events', 'read'),
  ('support', 'tickets', 'manage');

-- =====================================================
-- CONFIGURATION DES PLANS
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
    RAISE EXCEPTION 'Aucun plan trouvé pour le type "%"', plan_type;
  END IF;

  -- Fusionner les limits et features dans un seul JSONB (optionnel)
  v_result := v_limits || jsonb_build_object('features', v_features);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FONCTIONS D'AUTHENTIFICATION MISES À JOUR
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_with_plan();

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

  -- Étape 3 : Assigner le plan gratuit (via la table plans)
  BEGIN
    SELECT get_plan_limits('free'::subscription_plan_enum) INTO v_plan_limits;

    INSERT INTO public.user_subscriptions (
      user_id, plan, status,
      max_events, max_guests_per_event, max_storage_mb,
      features, current_period_start, current_period_end
    )
    VALUES (
      NEW.id,
      'free',
      'active',
      COALESCE((v_plan_limits->>'events')::INTEGER, 1),
      COALESCE((v_plan_limits->>'guests')::INTEGER, 50),
      COALESCE((v_plan_limits->>'storage')::INTEGER, 100),
      v_plan_limits->'features',
      CURRENT_TIMESTAMP,
      NULL
    );
    RAISE LOG 'Subscription created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de l''insertion dans user_subscriptions pour user_id % : %', NEW.id, SQLERRM;
  END;

  -- Étape 4 : (optionnel) créer une session d’audit
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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_with_plan();


-- Fonction pour obtenir le profil utilisateur complet avec rôles et plan
CREATE OR REPLACE FUNCTION get_user_profile_complete(target_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_profile JSON;
BEGIN
  v_user_id := COALESCE(target_user_id, auth.uid());
  
  -- Vérifier les permissions
  IF v_user_id != auth.uid() AND NOT has_role_permission('users', 'read') THEN
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
    'roles', COALESCE(roles.roles_array, '[]'::json),
    'primary_role', roles.primary_role,
    'subscription', subscription.subscription_info,
    'permissions', COALESCE(perms.permissions_array, '[]'::json),
    'status', CASE 
      WHEN p.is_active = false THEN 'suspended' 
      WHEN subscription.subscription_info->>'status' = 'expired' THEN 'expired'
      ELSE 'active' 
    END
  ) INTO v_profile
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
        'started_at', us.started_at,
        'expires_at', us.expires_at,
        'trial_ends_at', us.trial_ends_at,
        'max_events', us.max_events,
        'max_guests_per_event', us.max_guests_per_event,
        'max_storage_mb', us.max_storage_mb,
        'features', us.features
      ) as subscription_info
    FROM user_subscriptions us
    WHERE us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1
  ) subscription ON p.id = subscription.user_id
  LEFT JOIN (
    SELECT 
      roles.user_id,
      json_agg(DISTINCT
        json_build_object(
          'resource', rp.resource,
          'action', rp.action,
          'conditions', rp.conditions
        )
      ) as permissions_array
    FROM (
      SELECT user_id, role
      FROM user_roles
      WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    ) roles
    JOIN role_permissions rp ON roles.role = rp.role
    GROUP BY roles.user_id
  ) perms ON p.id = perms.user_id
  WHERE p.id = v_user_id;
  
  RETURN v_profile;
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
  
  -- Vérifier si l'utilisateur a la permission
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
-- ACTIVATION RLS POUR LES NOUVELLES TABLES
-- =====================================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Politiques RLS pour user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Politiques RLS pour role_permissions (lecture seule pour tous les utilisateurs connectés)
CREATE POLICY "Authenticated users can view permissions" ON role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only super_admin can manage permissions" ON role_permissions
  FOR ALL USING (has_user_role('super_admin'));

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour les utilisateurs avec leurs rôles et plans
CREATE OR REPLACE VIEW users_with_roles_and_plans AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.is_active,
  p.created_at,
  p.updated_at,
  roles.primary_role,
  roles.all_roles,
  sub.plan as current_plan,
  sub.status as plan_status,
  sub.expires_at as plan_expires_at,
  sub.features as plan_features
FROM profiles p
LEFT JOIN (
  SELECT 
    ur.user_id,
    (array_agg(ur.role ORDER BY 
      CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'moderator' THEN 3
        WHEN 'host' THEN 4
        WHEN 'support' THEN 5
        WHEN 'guest' THEN 6
      END
    ))[1] as primary_role,
    array_agg(ur.role) as all_roles
  FROM user_roles ur
  WHERE ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
  GROUP BY ur.user_id
) roles ON p.id = roles.user_id
LEFT JOIN (
  SELECT DISTINCT ON (user_id)
    user_id,
    plan,
    status,
    expires_at,
    features
  FROM user_subscriptions
  WHERE status IN ('active', 'trial')
  ORDER BY user_id, created_at DESC
) sub ON p.id = sub.user_id;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🔧 Système d''authentification corrigé avec succès !';
  RAISE NOTICE '✅ Rôles granulaires : super_admin, admin, moderator, host, guest, support';
  RAISE NOTICE '✅ Plans d''abonnement : free, premium, pro, enterprise';
  RAISE NOTICE '✅ Attribution automatique du plan gratuit aux nouveaux utilisateurs';
  RAISE NOTICE '✅ Système de permissions basé sur les rôles';
  RAISE NOTICE '✅ Fonctions d''administration pour gérer les plans';
  RAISE NOTICE '✅ Politiques RLS sécurisées';
END $$;
--
 =====================================================
-- RECRÉATION DES POLITIQUES RLS SUPPRIMÉES
-- =====================================================

-- Recréer les politiques pour profiles avec le nouveau système
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

CREATE POLICY "Admins can update user profiles" ON profiles
  FOR UPDATE USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Recréer les politiques pour user_sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Recréer les politiques pour invitation_templates
CREATE POLICY "Only admins can modify templates" ON invitation_templates
  FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Recréer les politiques pour audit_logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Recréer les politiques pour email_logs
CREATE POLICY "Admins can view all email logs" ON email_logs
  FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- =====================================================
-- RECRÉATION DES FONCTIONS UTILES
-- =====================================================

-- Fonction pour vérifier si un utilisateur est admin (compatible avec l'ancien système)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_user_role('super_admin') OR has_user_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RECRÉATION DES VUES SUPPRIMÉES
-- =====================================================

-- Vue admin pour l'aperçu des utilisateurs
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.is_active,
  p.email_verified,
  p.phone_verified,
  p.last_login_at,
  p.created_at,
  p.updated_at,
  roles.primary_role as role, -- Compatibilité avec l'ancien système
  roles.all_roles,
  sub.plan as current_plan,
  sub.status as plan_status,
  sub.expires_at as plan_expires_at,
  -- Statistiques utilisateur
  COALESCE(events_count.count, 0) as events_count,
  COALESCE(invitations_count.count, 0) as invitations_count
FROM profiles p
LEFT JOIN (
  SELECT 
    ur.user_id,
    (array_agg(ur.role ORDER BY 
      CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'moderator' THEN 3
        WHEN 'host' THEN 4
        WHEN 'support' THEN 5
        WHEN 'guest' THEN 6
      END
    ))[1] as primary_role,
    array_agg(ur.role) as all_roles
  FROM user_roles ur
  WHERE ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
  GROUP BY ur.user_id
) roles ON p.id = roles.user_id
LEFT JOIN (
  SELECT DISTINCT ON (user_id)
    user_id,
    plan,
    status,
    expires_at
  FROM user_subscriptions
  WHERE status IN ('active', 'trial')
  ORDER BY user_id, created_at DESC
) sub ON p.id = sub.user_id
LEFT JOIN (
  SELECT owner_id, COUNT(*) as count
  FROM events
  GROUP BY owner_id
) events_count ON p.id = events_count.owner_id
LEFT JOIN (
  SELECT 
    e.owner_id, 
    COUNT(i.*) as count
  FROM events e
  LEFT JOIN invitations i ON e.id = i.event_id
  GROUP BY e.owner_id
) invitations_count ON p.id = invitations_count.owner_id;

-- Mise à jour du message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS sécurisées et recréées';
  RAISE NOTICE '✅ Vues et fonctions utiles recréées';
  RAISE NOTICE '✅ Compatibilité maintenue avec l''ancien système';
END $$;