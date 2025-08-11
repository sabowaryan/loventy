-- =====================================================
-- RESET DES TYPES ET TABLES LOVENTY (STRUCTURE SEULE)
-- =====================================================
-- Ce script supprime et recrée tous les types ENUM et tables principales du système Loventy
-- Il n'inclut PAS les fonctions, triggers, vues, index, policies complexes, ni buckets
-- Il active la RLS sur toutes les tables concernées

-- =========================
-- 1. SUPPRESSION DES TYPES
-- =========================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT n.nspname, t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname IN (
      'user_role_type', 'invitation_status_type', 'rsvp_status_type', 'email_status_type', 'file_type_enum',
      'subscription_status_type', 'audit_action_type', 'user_role_enum', 'subscription_plan_enum', 'plan_status_enum',
      'plan_mode', 'mfa_method_enum', 'mfa_status_enum', 'audit_action_enum', 'audit_severity_enum'
    )
  ) LOOP
    EXECUTE format('DROP TYPE IF EXISTS %I.%I CASCADE;', r.nspname, r.typname);
  END LOOP;
END $$;

-- =========================
-- 2. CRÉATION DES TYPES ENUM
-- =========================

CREATE TYPE user_role_type AS ENUM ('super_admin', 'admin', 'moderator', 'host', 'guest', 'support');
CREATE TYPE invitation_status_type AS ENUM ('draft', 'published', 'sent', 'archived');
CREATE TYPE rsvp_status_type AS ENUM ('pending', 'confirmed', 'declined', 'maybe');
CREATE TYPE email_status_type AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE file_type_enum AS ENUM ('image', 'video', 'audio', 'document');
CREATE TYPE subscription_status_type AS ENUM ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE audit_action_type AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'suspend', 'unsuspend');
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'moderator', 'host', 'guest', 'support');
CREATE TYPE subscription_plan_enum AS ENUM ('free', 'premium', 'pro', 'enterprise');
CREATE TYPE plan_status_enum AS ENUM ('active', 'trial', 'expired', 'cancelled', 'suspended');
CREATE TYPE plan_mode AS ENUM ('subscription', 'one_time');
CREATE TYPE mfa_method_enum AS ENUM ('totp', 'sms', 'email', 'backup_codes');
CREATE TYPE mfa_status_enum AS ENUM ('pending', 'verified', 'disabled');
CREATE TYPE audit_action_enum AS ENUM (
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REGISTER',
  'SUSPEND', 'UNSUSPEND', 'BAN', 'UNBAN', 'ROLE_ASSIGN', 'ROLE_REMOVE',
  'PLAN_CHANGE', 'PAYMENT', 'MFA_ENABLE', 'MFA_DISABLE', 'MFA_VERIFY',
  'SESSION_CREATE', 'SESSION_TERMINATE', 'CONTENT_MODERATE', 'CONTENT_FLAG'
);
CREATE TYPE audit_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_severity_enum AS ENUM ('info', 'warning', 'high', 'critical');

-- =========================
-- 3. SUPPRESSION DES TABLES
-- =========================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'user_sessions', 'events', 'event_collaborators', 'template_categories', 'invitation_templates',
        'invitations', 'guests', 'rsvp_questions', 'rsvp_answers', 'user_files', 'invitation_media',
        'stripe_customers', 'stripe_subscriptions', 'audit_logs', 'email_logs', 'user_roles', 'user_subscriptions',
        'role_permissions', 'plans', 'user_mfa_settings', 'mfa_attempts', 'session_activities', 'system_metrics',
        'system_alerts', 'user_usage_metrics', 'login_attempts', 'seo_metadata'
      )
  ) LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', r.tablename);
  END LOOP;
END $$;

-- =========================
-- 4. CRÉATION DES TABLES PRINCIPALES
-- =========================

-- Table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\\+?[1-9]\\d{1,14}$'),
  CONSTRAINT valid_timezone CHECK (timezone IS NOT NULL),
  CONSTRAINT valid_language CHECK (language IN ('fr', 'en', 'es', 'ar'))
);

-- Table user_sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'wedding',
  event_date DATE NOT NULL,
  event_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_country TEXT DEFAULT 'France',
  timezone TEXT DEFAULT 'Europe/Paris',
  max_guests INTEGER,
  dress_code TEXT,
  gift_registry_url TEXT,
  special_instructions TEXT,
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_max_guests CHECK (max_guests IS NULL OR max_guests > 0),
  CONSTRAINT valid_event_date CHECK (event_date IS NOT NULL),
  CONSTRAINT valid_gift_url CHECK (gift_registry_url IS NULL OR gift_registry_url ~* '^https?://'),
  CONSTRAINT valid_slug CHECK (slug IS NOT NULL)
);

-- Table event_collaborators
CREATE TABLE event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor',
  permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id),
  -- Contraintes de validation
  CONSTRAINT valid_role CHECK (role IN ('owner', 'editor', 'viewer', 'guest'))
);

-- Table template_categories
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_slug CHECK (slug IS NOT NULL)
);

-- Table invitation_templates
CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  preview_image_url TEXT,
  thumbnail_url TEXT,
  design_config JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_slug CHECK (slug IS NOT NULL),
  CONSTRAINT valid_usage_count CHECK (usage_count IS NULL OR usage_count >= 0)
);

-- Table invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES invitation_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  custom_message TEXT,
  rsvp_deadline DATE,
  status invitation_status_type DEFAULT 'draft',
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  design_settings JSONB DEFAULT '{}',
  access_code TEXT UNIQUE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_rsvp_deadline CHECK (rsvp_deadline IS NULL OR rsvp_deadline >= CURRENT_DATE),
  CONSTRAINT valid_view_count CHECK (view_count IS NULL OR view_count >= 0)
);

-- Table guests
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status rsvp_status_type DEFAULT 'pending',
  response_message TEXT,
  dietary_restrictions TEXT,
  plus_one_allowed BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  plus_one_email TEXT,
  access_token TEXT UNIQUE DEFAULT NULL,
  access_expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_plus_one_email CHECK (plus_one_allowed IS FALSE OR plus_one_email IS NULL OR plus_one_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\\+?[1-9]\\d{1,14}$'),
  CONSTRAINT valid_access_expiry CHECK (access_expires_at IS NULL OR access_expires_at > CURRENT_TIMESTAMP),
  CONSTRAINT plus_one_logic CHECK (plus_one_allowed IS FALSE OR (plus_one_name IS NULL AND plus_one_email IS NULL))
);

-- Table rsvp_questions
CREATE TABLE rsvp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_question_type CHECK (question_type IN ('text', 'select', 'checkbox', 'radio')),
  CONSTRAINT valid_display_order CHECK (display_order IS NULL OR display_order >= 0)
);

-- Table rsvp_answers
CREATE TABLE rsvp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES rsvp_questions(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, guest_id)
);

-- Table user_files
CREATE TABLE user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type file_type_enum NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_file_size CHECK (file_size > 0),
  CONSTRAINT valid_file_url CHECK (file_url IS NOT NULL)
);

-- Table invitation_media
CREATE TABLE invitation_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  file_id UUID REFERENCES user_files(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_media_type CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  CONSTRAINT valid_display_order CHECK (display_order IS NULL OR display_order >= 0)
);

-- Table stripe_customers
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table stripe_subscriptions
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES stripe_customers(customer_id) ON DELETE CASCADE NOT NULL,
  subscription_id TEXT UNIQUE NOT NULL,
  price_id TEXT NOT NULL,
  status subscription_status_type NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_period CHECK (current_period_start IS NOT NULL AND current_period_end IS NOT NULL)
);

-- Table audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action_type NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table email_logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  status email_status_type DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_recipient_email CHECK (recipient_email IS NOT NULL)
);

-- Table user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'host',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, role),
  -- Contraintes de validation
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
);

-- Table user_subscriptions
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
  max_events INTEGER,
  max_guests_per_event INTEGER,
  max_storage_mb INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT valid_dates CHECK (started_at IS NOT NULL AND (expires_at IS NULL OR expires_at > started_at) AND (trial_ends_at IS NULL OR trial_ends_at > started_at)),
  CONSTRAINT valid_trial CHECK (plan = 'free' OR trial_ends_at IS NOT NULL)
);

-- Table role_permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role_enum NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, resource, action)
);

-- Table plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  mode plan_mode NOT NULL DEFAULT 'subscription',
  type subscription_plan_enum NOT NULL DEFAULT 'free',
  limits JSONB NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::JSONB,
  popular BOOLEAN NOT NULL DEFAULT false,
  color TEXT,
  bg_color TEXT,
  border_color TEXT,
  button_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table user_mfa_settings
CREATE TABLE user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method mfa_method_enum NOT NULL,
  status mfa_status_enum DEFAULT 'pending',
  secret_key TEXT,
  phone_number TEXT,
  email_address TEXT,
  backup_codes TEXT[],
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, method)
);

-- Table mfa_attempts
CREATE TABLE mfa_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method mfa_method_enum NOT NULL,
  code_hash TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

-- Table session_activities
CREATE TABLE session_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  resource TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table system_metrics
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table system_alerts
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity audit_severity_enum NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table user_usage_metrics
CREATE TABLE user_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  page_views INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  invitations_sent INTEGER DEFAULT 0,
  guests_added INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric_date)
);

-- Table login_attempts
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Contraintes de validation
  CONSTRAINT login_attempts_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table seo_metadata
CREATE TABLE seo_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT,
  entity_id UUID,
  entity_type TEXT CHECK (entity_type IN ('event', 'invitation', 'profile', 'page')),
  meta_title TEXT NOT NULL CHECK (char_length(meta_title) <= 60),
  meta_description TEXT CHECK (char_length(meta_description) <= 160),
  meta_keywords TEXT CHECK (char_length(meta_keywords) <= 255),
  canonical_url TEXT,
  og_title TEXT CHECK (char_length(og_title) <= 60),
  og_description TEXT CHECK (char_length(og_description) <= 160),
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website' CHECK (og_type IN ('website', 'article', 'profile', 'event')),
  twitter_card TEXT DEFAULT 'summary_large_image' CHECK (twitter_card IN ('summary', 'summary_large_image', 'app', 'player')),
  twitter_title TEXT CHECK (char_length(twitter_title) <= 70),
  twitter_description TEXT CHECK (char_length(twitter_description) <= 200),
  twitter_image_url TEXT,
  robots TEXT DEFAULT 'index,follow' CHECK (robots ~ '^(index|noindex),(follow|nofollow)$'),
  priority DECIMAL(2,1) DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
  change_frequency TEXT DEFAULT 'monthly' CHECK (change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  language_code TEXT DEFAULT 'fr' CHECK (char_length(language_code) = 2),
  region_code TEXT CHECK (char_length(region_code) = 2),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Contraintes de validation
  CONSTRAINT unique_page_path UNIQUE (page_path),
  CONSTRAINT unique_entity_seo UNIQUE (entity_id, entity_type),
  CONSTRAINT page_or_entity_required CHECK (
    (page_path IS NOT NULL AND entity_id IS NULL) OR 
    (page_path IS NULL AND entity_id IS NOT NULL)
  )
);

-- =========================
-- 5. ACTIVATION DE LA RLS
-- =========================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- =========================
-- FIN DU SCRIPT STRUCTURE
-- ========================= 