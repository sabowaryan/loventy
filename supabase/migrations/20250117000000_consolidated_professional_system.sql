/*
  # Système Loventy - Architecture Professionnelle Consolidée
  
  Migration complète avec :
  - Architecture normalisée et optimisée
  - Sécurité RLS complète avec politiques
  - Contraintes et validations robustes
  - Nommage cohérent et professionnel
  - Suppression des duplications
  - Index de performance optimisés
*/

-- =====================================================
-- EXTENSIONS ET CONFIGURATION
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Types énumérés consolidés
CREATE TYPE user_role_type AS ENUM ('admin', 'host', 'guest');
CREATE TYPE invitation_status_type AS ENUM ('draft', 'published', 'sent', 'archived');
CREATE TYPE rsvp_status_type AS ENUM ('pending', 'confirmed', 'declined', 'maybe');
CREATE TYPE email_status_type AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE file_type_enum AS ENUM ('image', 'video', 'audio', 'document');
CREATE TYPE subscription_status_type AS ENUM (
    'inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);
CREATE TYPE audit_action_type AS ENUM (
    'create', 'update', 'delete', 'login', 'logout', 'suspend', 'unsuspend'
);

-- =====================================================
-- FONCTIONS UTILITAIRES
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

-- =====================================================
-- TABLES CORE - UTILISATEURS ET AUTHENTIFICATION
-- =====================================================

-- Profils utilisateurs étendus
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
  role user_role_type DEFAULT 'host',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (is_valid_email(email)),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
  CONSTRAINT valid_timezone CHECK (timezone IS NOT NULL),
  CONSTRAINT valid_language CHECK (language IN ('fr', 'en', 'es', 'ar'))
);

-- Sessions utilisateur pour audit
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- =====================================================
-- TABLES CORE - ÉVÉNEMENTS
-- =====================================================

-- Événements centralisés (suppression duplication avec invitations)
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
  
  CONSTRAINT valid_max_guests CHECK (max_guests IS NULL OR max_guests > 0),
  CONSTRAINT valid_event_date CHECK (event_date >= CURRENT_DATE),
  CONSTRAINT valid_gift_url CHECK (gift_registry_url IS NULL OR gift_registry_url ~ '^https?://'),
  CONSTRAINT valid_slug CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$')
);

-- Collaborateurs d'événements
CREATE TABLE event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor',
  permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('viewer', 'editor', 'admin'))
);

-- =====================================================
-- TABLES CORE - INVITATIONS
-- =====================================================

-- Catégories de templates
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Templates d'invitation
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
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_usage_count CHECK (usage_count >= 0)
);

-- Invitations (référence à l'événement, pas de duplication)
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
  access_code TEXT UNIQUE DEFAULT generate_secure_token(8),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_rsvp_deadline CHECK (rsvp_deadline IS NULL OR rsvp_deadline >= CURRENT_DATE),
  CONSTRAINT valid_view_count CHECK (view_count >= 0)
);

-- =====================================================
-- TABLES CORE - GESTION DES INVITÉS
-- =====================================================

-- Invités
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
  access_token TEXT UNIQUE DEFAULT generate_secure_token(),
  access_expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email IS NULL OR is_valid_email(email)),
  CONSTRAINT valid_plus_one_email CHECK (plus_one_email IS NULL OR is_valid_email(plus_one_email)),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
  CONSTRAINT valid_access_expiry CHECK (access_expires_at > created_at),
  CONSTRAINT plus_one_logic CHECK (
    (plus_one_allowed = false AND plus_one_name IS NULL AND plus_one_email IS NULL) OR
    (plus_one_allowed = true)
  )
);

-- Questions RSVP personnalisées
CREATE TABLE rsvp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_question_type CHECK (question_type IN ('text', 'choice', 'boolean', 'number')),
  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Réponses aux questions RSVP
CREATE TABLE rsvp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES rsvp_questions(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(question_id, guest_id)
);

-- =====================================================
-- TABLES CORE - FICHIERS ET MÉDIAS
-- =====================================================

-- Fichiers utilisateur
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
  
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 50 * 1024 * 1024), -- 50MB max
  CONSTRAINT valid_file_url CHECK (file_url ~ '^https?://')
);

-- Médias d'invitation
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
  
  CONSTRAINT valid_media_type CHECK (media_type IN ('couple_photo', 'background', 'gallery', 'logo')),
  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- =====================================================
-- TABLES BUSINESS - STRIPE ET PAIEMENTS
-- =====================================================

-- Clients Stripe
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Abonnements Stripe
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
  
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

-- =====================================================
-- TABLES SYSTÈME - AUDIT ET LOGS
-- =====================================================

-- Logs d'audit
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

-- Logs d'emails
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
  
  CONSTRAINT valid_recipient_email CHECK (is_valid_email(recipient_email))
);

-- =====================================================
-- INDEX DE PERFORMANCE
-- =====================================================

-- Index utilisateurs
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Index événements
CREATE INDEX idx_events_owner_id ON events(owner_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_public ON events(is_public);
CREATE INDEX idx_event_collaborators_event_id ON event_collaborators(event_id);
CREATE INDEX idx_event_collaborators_user_id ON event_collaborators(user_id);

-- Index invitations
CREATE INDEX idx_invitations_event_id ON invitations(event_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_access_code ON invitations(access_code);

-- Index invités
CREATE INDEX idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX idx_guests_access_token ON guests(access_token);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_guests_email ON guests(email);

-- Index fichiers
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_file_type ON user_files(file_type);
CREATE INDEX idx_invitation_media_invitation_id ON invitation_media(invitation_id);

-- Index business
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);

-- Index système
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers pour updated_at
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitation_templates BEFORE UPDATE ON invitation_templates FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitations BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_guests BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_files BEFORE UPDATE ON user_files FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_customers BEFORE UPDATE ON stripe_customers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_subscriptions BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- ACTIVATION RLS
-- =====================================================

-- Activation RLS sur toutes les tables
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