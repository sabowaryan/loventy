/*
  # Schéma pour les modèles d'invitation et tables connexes

  1. Nouvelles Tables
    - `invitation_templates` - Modèles d'invitation disponibles
    - `template_categories` - Catégories de modèles (classique, moderne, etc.)
    - `template_images` - Images associées aux modèles
    - `invitation_tables` - Tables où s'assoiront les invités
    - `invitation_guests` - Détails des invités avec informations de contact
    - `invitation_media` - Médias associés aux invitations (photos, vidéos)
    - `invitation_thank_you` - Messages de remerciement et livre d'or
    - `invitation_rsvp_questions` - Questions personnalisées pour les RSVP

  2. Relations
    - Modèles liés aux catégories
    - Invitations liées aux modèles
    - Invités liés aux invitations et aux tables
    - Médias liés aux invitations

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour l'accès utilisateur et admin
*/

-- Table des catégories de modèles
CREATE TABLE IF NOT EXISTS template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des modèles d'invitation
CREATE TABLE IF NOT EXISTS invitation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES template_categories(id),
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  preview_image_url text,
  thumbnail_url text,
  color_palette jsonb DEFAULT '{}',
  font_pairs jsonb DEFAULT '{}',
  layout_options jsonb DEFAULT '{}',
  default_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des images de modèles
CREATE TABLE IF NOT EXISTS template_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES invitation_templates(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL, -- 'preview', 'background', 'detail', etc.
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table des tables d'invités
CREATE TABLE IF NOT EXISTS invitation_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capacity integer DEFAULT 8,
  is_vip boolean DEFAULT false,
  location_description text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des invités étendue
CREATE TABLE IF NOT EXISTS invitation_guests_extended (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  table_id uuid REFERENCES invitation_tables(id) ON DELETE SET NULL,
  guest_type text NOT NULL, -- 'solo', 'couple', 'family'
  dietary_restrictions text,
  plus_one boolean DEFAULT false,
  plus_one_name text,
  plus_one_email text,
  plus_one_phone text,
  whatsapp_number text,
  telegram_username text,
  age_group text, -- 'adult', 'child', 'infant'
  relationship text, -- 'family', 'friend', 'colleague', etc.
  side text, -- 'bride', 'groom', 'both'
  gift_registry_contribution boolean DEFAULT false,
  gift_description text,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des médias d'invitation
CREATE TABLE IF NOT EXISTS invitation_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type text NOT NULL, -- 'couple_photo', 'background', 'gallery', 'logo', etc.
  file_id uuid REFERENCES user_files(id) ON DELETE SET NULL,
  title text,
  description text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des messages de remerciement et livre d'or
CREATE TABLE IF NOT EXISTS invitation_thank_you (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  message text NOT NULL,
  author_name text,
  author_email text,
  is_public boolean DEFAULT true,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des questions RSVP personnalisées
CREATE TABLE IF NOT EXISTS invitation_rsvp_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL, -- 'text', 'choice', 'boolean', etc.
  options jsonb, -- Pour les questions à choix
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des réponses aux questions RSVP
CREATE TABLE IF NOT EXISTS invitation_rsvp_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES invitation_rsvp_questions(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  answer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(question_id, guest_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_guests_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_thank_you ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_rsvp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_rsvp_answers ENABLE ROW LEVEL SECURITY;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_invitation_templates_category ON invitation_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_template_images_template ON template_images(template_id);
CREATE INDEX IF NOT EXISTS idx_invitation_tables_invitation ON invitation_tables(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_guests_extended_guest ON invitation_guests_extended(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitation_guests_extended_table ON invitation_guests_extended(table_id);
CREATE INDEX IF NOT EXISTS idx_invitation_media_invitation ON invitation_media(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_media_user ON invitation_media(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_thank_you_invitation ON invitation_thank_you(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_thank_you_guest ON invitation_thank_you(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitation_rsvp_questions_invitation ON invitation_rsvp_questions(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_rsvp_answers_question ON invitation_rsvp_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_invitation_rsvp_answers_guest ON invitation_rsvp_answers(guest_id);

-- Triggers pour updated_at
CREATE TRIGGER update_template_categories_updated_at
  BEFORE UPDATE ON template_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_templates_updated_at
  BEFORE UPDATE ON invitation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_tables_updated_at
  BEFORE UPDATE ON invitation_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_guests_extended_updated_at
  BEFORE UPDATE ON invitation_guests_extended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_media_updated_at
  BEFORE UPDATE ON invitation_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_rsvp_questions_updated_at
  BEFORE UPDATE ON invitation_rsvp_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour template_categories
CREATE POLICY "Tous peuvent lire les catégories de modèles"
  ON template_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les catégories"
  ON template_categories
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

-- Politiques RLS pour invitation_templates
CREATE POLICY "Tous peuvent lire les modèles actifs"
  ON invitation_templates
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les modèles"
  ON invitation_templates
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

-- Politiques RLS pour template_images
CREATE POLICY "Tous peuvent lire les images des modèles"
  ON template_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les images des modèles"
  ON template_images
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

-- Politiques RLS pour invitation_tables
CREATE POLICY "Les utilisateurs peuvent gérer leurs tables"
  ON invitation_tables
  FOR ALL
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour invitation_guests_extended
CREATE POLICY "Les utilisateurs peuvent gérer leurs invités étendus"
  ON invitation_guests_extended
  FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN invitations i ON g.invitation_id = i.id
      WHERE i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN invitations i ON g.invitation_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

-- Politiques RLS pour invitation_media
CREATE POLICY "Les utilisateurs peuvent gérer leurs médias"
  ON invitation_media
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques RLS pour invitation_thank_you
CREATE POLICY "Les utilisateurs peuvent lire les remerciements de leurs invitations"
  ON invitation_thank_you
  FOR SELECT
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
    OR
    (is_public = true AND is_approved = true)
  );

CREATE POLICY "Les invités peuvent ajouter des remerciements"
  ON invitation_thank_you
  FOR INSERT
  TO public
  WITH CHECK (is_public = true);

CREATE POLICY "Les utilisateurs peuvent gérer les remerciements de leurs invitations"
  ON invitation_thank_you
  FOR UPDATE
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour invitation_rsvp_questions
CREATE POLICY "Les utilisateurs peuvent gérer leurs questions RSVP"
  ON invitation_rsvp_questions
  FOR ALL
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = auth.uid()
    )
  );

-- Politiques RLS pour invitation_rsvp_answers
CREATE POLICY "Les utilisateurs peuvent lire les réponses RSVP de leurs invitations"
  ON invitation_rsvp_answers
  FOR SELECT
  TO authenticated
  USING (
    question_id IN (
      SELECT q.id FROM invitation_rsvp_questions q
      JOIN invitations i ON q.invitation_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

CREATE POLICY "Les invités peuvent répondre aux questions RSVP"
  ON invitation_rsvp_answers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Accorder les permissions de lecture aux utilisateurs anonymes
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON template_categories TO anon;
GRANT SELECT ON invitation_templates TO anon;
GRANT SELECT ON template_images TO anon;
GRANT SELECT ON invitation_thank_you TO anon;
GRANT INSERT ON invitation_thank_you TO anon;
GRANT INSERT ON invitation_rsvp_answers TO anon;