-- TYPES ENUM -----------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_mode') THEN
    CREATE TYPE plan_mode AS ENUM ('subscription', 'payment');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_level') THEN
    CREATE TYPE support_level AS ENUM ('basic', 'priority', 'dedicated');
  END IF;
END$$;

-- TABLE ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  mode plan_mode NOT NULL DEFAULT 'subscription',

  limits JSONB NOT NULL CHECK (
    limits ? 'invitations' AND
    limits ? 'guests' AND
    limits ? 'templates' AND
    limits ? 'storage' AND
    limits ? 'emailsPerMonth' AND
    limits ? 'events' AND
    limits ? 'customDomain' AND
    limits ? 'analytics' AND
    limits ? 'support'
  ),

  features JSONB NOT NULL DEFAULT '[]'::JSONB,

  popular BOOLEAN NOT NULL DEFAULT false,

  color TEXT,
  bg_color TEXT,
  border_color TEXT,
  button_color TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEX ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_plans_price_id ON plans (stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_plans_popular ON plans (popular);

-- TRIGGER updated_at --------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON plans;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- SEED : INSERTION DES PLANS -------------------------------------

-- Découverte
INSERT INTO plans (name, stripe_product_id, stripe_price_id, description, price, mode, features, limits, popular, color, bg_color, border_color, button_color)
VALUES (
  'Loventy-Découverte',
  'prod_SU6j0JE6Csfvh8',
  'price_1RZ8WFAmXOVRZkyi8pzlw8Gr',
  'Parfait pour commencer',
  0.00,
  'subscription',
  '["2 modèles gratuits", "3 invitations par mois", "50 invités maximum", "1 événement par mois", "Envoi par email uniquement", "Suivi RSVP basique", "Logo Loventy visible"]',
  jsonb_build_object(
    'invitations', 3,
    'guests', 50,
    'templates', 2,
    'storage', 10,
    'emailsPerMonth', 100,
    'events', 1,
    'customDomain', false,
    'analytics', false,
    'support', 'basic'
  ),
  false,
  'text-gray-600',
  'bg-gray-50',
  'border-gray-200',
  'bg-gray-600'
);

-- Essentiel
INSERT INTO plans (name, stripe_product_id, stripe_price_id, description, price, mode, features, limits, popular, color, bg_color, border_color, button_color)
VALUES (
  'Loventy-Essentiel',
  'prod_SU6py0r0ukMf2z',
  'price_1RZ8beAmXOVRZkyiLPc5T1N6',
  'Idéal pour les petits mariages',
  19.99,
  'subscription',
  '["10 modèles premium", "25 invitations par mois", "300 invités maximum", "5 événements par mois", "Tous les canaux d''envoi", "Suppression du watermark", "Support prioritaire", "Export PDF des invitations", "Statistiques basiques"]',
  jsonb_build_object(
    'invitations', 25,
    'guests', 300,
    'templates', 10,
    'storage', 100,
    'emailsPerMonth', 1000,
    'events', 5,
    'customDomain', false,
    'analytics', true,
    'support', 'priority'
  ),
  true,
  'text-[#D4A5A5]',
  'bg-[#D4A5A5]/5',
  'border-[#D4A5A5]',
  'bg-[#D4A5A5]'
);

-- Prestige
INSERT INTO plans (name, stripe_product_id, stripe_price_id, description, price, mode, features, limits, popular, color, bg_color, border_color, button_color)
VALUES (
  'Loventy-Prestige',
  'prod_SU6tw5V8tpTC4a',
  'price_1RZ8fpAmXOVRZkyizFbIXhpN',
  'Pour les grands événements',
  39.99,
  'subscription',
  '["Tous les modèles inclus", "Invitations illimitées", "Invités illimités", "Événements illimités", "Page personnalisée", "Relances automatiques", "RSVP avancé avec formulaires", "Analytics détaillées", "Support dédié", "API pour intégrations", "Domaine personnalisé"]',
  jsonb_build_object(
    'invitations', -1,
    'guests', -1,
    'templates', -1,
    'storage', 1000,
    'emailsPerMonth', -1,
    'events', -1,
    'customDomain', true,
    'analytics', true,
    'support', 'dedicated'
  ),
  false,
  'text-[#C5D2C2]',
  'bg-[#C5D2C2]/5',
  'border-[#C5D2C2]',
  'bg-[#C5D2C2]'
);

-- VUE FLATTEN ----------------------------------------------------

CREATE OR REPLACE VIEW plans_flat AS
SELECT
  id,
  name,
  stripe_product_id,
  stripe_price_id,
  description,
  price,
  mode,
  popular,
  color,
  bg_color,
  border_color,
  button_color,
  created_at,
  updated_at,
  limits->>'invitations' AS invitations,
  limits->>'guests' AS guests,
  limits->>'templates' AS templates,
  limits->>'storage' AS storage,
  limits->>'emailsPerMonth' AS emailsPerMonth,
  limits->>'events' AS events,
  limits->>'customDomain' AS customDomain,
  limits->>'analytics' AS analytics,
  limits->>'support' AS support,
  features
FROM plans;

-- RLS ------------------------------------------------------------

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all"
ON plans
FOR SELECT
USING (true);

REVOKE INSERT, UPDATE, DELETE ON plans FROM anon, authenticated;

UPDATE plans
SET type = CASE
  WHEN name ILIKE '%découverte%' THEN 'free'::subscription_plan_enum
  WHEN name ILIKE '%essentiel%' THEN 'pro'::subscription_plan_enum
  WHEN name ILIKE '%prestige%' THEN 'premium'::subscription_plan_enum
  ELSE 'free'::subscription_plan_enum
END;

CREATE OR REPLACE FUNCTION upgrade_user_plan(user_uuid UUID, new_plan subscription_plan_enum)
RETURNS VOID AS $$
DECLARE
  v_limits JSONB;
BEGIN
  -- Récupérer les nouvelles limites
  SELECT get_plan_limits(new_plan) INTO v_limits;

  -- Mettre à jour l’abonnement actuel
  UPDATE user_subscriptions
  SET
    plan = new_plan,
    max_events = COALESCE((v_limits->>'max_events')::INTEGER, max_events),
    max_guests_per_event = COALESCE((v_limits->>'max_guests_per_event')::INTEGER, max_guests_per_event),
    max_storage_mb = COALESCE((v_limits->>'max_storage_mb')::INTEGER, max_storage_mb),
    features = v_limits->'features',
    current_period_start = CURRENT_DATE,
    current_period_end = CURRENT_DATE + INTERVAL '1 month',
    status = 'active',
    trial_ends_at = NULL  -- stop trial
  WHERE user_id = user_uuid
    AND status IN ('active', 'trial');
END;
$$ LANGUAGE plpgsql;

