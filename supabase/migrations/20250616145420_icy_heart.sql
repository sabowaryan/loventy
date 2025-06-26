/*
  # Création de la table users

  1. Nouvelle table
    - `users` - Table des profils utilisateurs
      - `id` (uuid, clé primaire, référence auth.users)
      - `email` (text, unique)
      - `first_name` (text, optionnel)
      - `last_name` (text, optionnel)
      - `avatar_url` (text, optionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `users`
    - Politique pour que les utilisateurs puissent lire/modifier leur propre profil
    - Politique pour que les admins puissent tout voir/modifier

  3. Triggers
    - Trigger pour mettre à jour `updated_at` automatiquement
    - Trigger pour créer automatiquement un profil lors de l'inscription
*/

-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique pour que les admins puissent tout voir
CREATE POLICY "Admins can view all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Politique pour que les admins puissent tout modifier
CREATE POLICY "Admins can update all profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Politique pour l'insertion (création de profil)
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);