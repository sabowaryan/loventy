/*
  # Système de gestion des plans et limitations

  1. Nouvelles tables
    - `invitations` - Stockage des invitations créées
    - `guests` - Stockage des invités
    - `email_logs` - Logs des emails envoyés
    - `user_files` - Fichiers uploadés par les utilisateurs
    - `plan_usage` - Cache des statistiques d'utilisation

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour l'accès utilisateur et admin

  3. Fonctions
    - Calcul automatique des statistiques d'utilisation
    - Vérification des limites en temps réel
*/

-- Table des invitations
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  template_id text NOT NULL,
  bride_name text DEFAULT '',
  groom_name text DEFAULT '',
  event_date date,
  event_time time,
  venue text DEFAULT '',
  address text DEFAULT '',
  message text DEFAULT '',
  dress_code text DEFAULT '',
  rsvp_deadline date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sent', 'archived')),
  settings jsonb DEFAULT '{}',
  design_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des invités
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  response_message text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des logs d'emails
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES invitations(id) ON DELETE SET NULL,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  email_type text NOT NULL CHECK (email_type IN ('invitation', 'reminder', 'confirmation', 'update')),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'failed')),
  provider text DEFAULT 'internal',
  external_id text,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz
);

-- Table des fichiers utilisateur
CREATE TABLE IF NOT EXISTS user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES invitations(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_path text NOT NULL,
  file_url text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table de cache des statistiques d'utilisation
CREATE TABLE IF NOT EXISTS plan_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  invitations_count integer DEFAULT 0,
  guests_count integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  storage_used bigint DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);

CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_usage_user_period ON plan_usage(user_id, period_start);

-- Activer RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_usage ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour invitations
CREATE POLICY "Users can manage own invitations"
  ON invitations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour guests
CREATE POLICY "Users can manage own guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour email_logs
CREATE POLICY "Users can view own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour user_files
CREATE POLICY "Users can manage own files"
  ON user_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour plan_usage
CREATE POLICY "Users can view own usage"
  ON plan_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage usage stats"
  ON plan_usage
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les statistiques d'utilisation
CREATE OR REPLACE FUNCTION calculate_user_usage(user_uuid uuid, start_date timestamptz DEFAULT date_trunc('month', now()))
RETURNS TABLE (
  invitations_count bigint,
  guests_count bigint,
  emails_sent bigint,
  storage_used bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE((SELECT COUNT(*) FROM invitations WHERE user_id = user_uuid AND created_at >= start_date), 0) as invitations_count,
    COALESCE((SELECT COUNT(*) FROM guests WHERE user_id = user_uuid), 0) as guests_count,
    COALESCE((SELECT COUNT(*) FROM email_logs WHERE user_id = user_uuid AND sent_at >= start_date), 0) as emails_sent,
    COALESCE((SELECT SUM(file_size) FROM user_files WHERE user_id = user_uuid), 0) as storage_used;
$$;

-- Fonction pour vérifier les limites d'un plan
CREATE OR REPLACE FUNCTION check_plan_limit(
  user_uuid uuid,
  limit_type text,
  amount integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Vue pour les statistiques d'utilisation utilisateur
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(inv_stats.invitations_this_month, 0) as invitations_this_month,
  COALESCE(guest_stats.total_guests, 0) as total_guests,
  COALESCE(email_stats.emails_this_month, 0) as emails_this_month,
  COALESCE(file_stats.storage_used_mb, 0) as storage_used_mb,
  COALESCE(sub.subscription_status, 'not_started') as subscription_status,
  COALESCE(sub.price_id, 'free') as price_id
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as invitations_this_month
  FROM invitations 
  WHERE created_at >= date_trunc('month', now())
  GROUP BY user_id
) inv_stats ON u.id = inv_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_guests
  FROM guests
  GROUP BY user_id
) guest_stats ON u.id = guest_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as emails_this_month
  FROM email_logs
  WHERE sent_at >= date_trunc('month', now())
  GROUP BY user_id
) email_stats ON u.id = email_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    ROUND(SUM(file_size) / 1048576.0, 2) as storage_used_mb
  FROM user_files
  GROUP BY user_id
) file_stats ON u.id = file_stats.user_id
LEFT JOIN stripe_user_subscriptions sub ON u.id IN (
  SELECT user_id FROM stripe_customers WHERE customer_id = sub.customer_id
);

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;