/*
  # Système de rôles et permissions (RBAC)

  1. Nouvelles Tables
    - `roles` - Définition des rôles système et personnalisés
    - `permissions` - Permissions granulaires par ressource/action
    - `user_roles` - Attribution des rôles aux utilisateurs
    - `role_permissions` - Permissions accordées à chaque rôle

  2. Rôles prédéfinis
    - `admin` - Administrateur avec tous les droits
    - `user` - Utilisateur standard
    - `premium` - Utilisateur payant avec fonctionnalités avancées
    - `guest` - Accès limité en lecture seule

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques granulaires par rôle
    - Attribution automatique du rôle 'user' aux nouveaux comptes

  4. Fonctions utilitaires
    - Vérification de permissions
    - Récupération des rôles et permissions utilisateur
*/

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table de liaison utilisateur-rôles
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, role_id)
);

-- Table de liaison rôle-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at sur roles
CREATE TRIGGER update_roles_updated_at 
  BEFORE UPDATE ON roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour roles
CREATE POLICY "Tous peuvent lire les rôles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les rôles"
  ON roles
  FOR ALL
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

-- Politiques RLS pour permissions
CREATE POLICY "Tous peuvent lire les permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les permissions"
  ON permissions
  FOR ALL
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

-- Politiques RLS pour user_roles
CREATE POLICY "Les utilisateurs peuvent voir leurs propres rôles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Les admins peuvent voir tous les rôles utilisateurs"
  ON user_roles
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

CREATE POLICY "Seuls les admins peuvent assigner des rôles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

CREATE POLICY "Seuls les admins peuvent modifier les assignations de rôles"
  ON user_roles
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

CREATE POLICY "Seuls les admins peuvent supprimer les assignations de rôles"
  ON user_roles
  FOR DELETE
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

-- Politiques RLS pour role_permissions
CREATE POLICY "Tous peuvent lire les permissions des rôles"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les permissions des rôles"
  ON role_permissions
  FOR ALL
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

-- Insertion des rôles de base
INSERT INTO roles (name, description, is_system) VALUES
  ('admin', 'Administrateur système avec tous les droits', true),
  ('user', 'Utilisateur standard pouvant créer des invitations', true),
  ('guest', 'Invité avec accès limité en lecture seule', true),
  ('premium', 'Utilisateur premium avec fonctionnalités avancées', true)
ON CONFLICT (name) DO NOTHING;

-- Insertion des permissions de base
INSERT INTO permissions (name, description, resource, action) VALUES
  -- Permissions pour les invitations
  ('invitations.create', 'Créer des invitations', 'invitations', 'create'),
  ('invitations.read', 'Lire les invitations', 'invitations', 'read'),
  ('invitations.update', 'Modifier les invitations', 'invitations', 'update'),
  ('invitations.delete', 'Supprimer les invitations', 'invitations', 'delete'),
  ('invitations.send', 'Envoyer des invitations', 'invitations', 'send'),
  
  -- Permissions pour les invités
  ('guests.create', 'Ajouter des invités', 'guests', 'create'),
  ('guests.read', 'Voir la liste des invités', 'guests', 'read'),
  ('guests.update', 'Modifier les informations des invités', 'guests', 'update'),
  ('guests.delete', 'Supprimer des invités', 'guests', 'delete'),
  ('guests.import', 'Importer des listes d''invités', 'guests', 'import'),
  ('guests.export', 'Exporter des listes d''invités', 'guests', 'export'),
  
  -- Permissions pour les modèles
  ('templates.read', 'Voir les modèles gratuits', 'templates', 'read'),
  ('templates.premium', 'Accéder aux modèles premium', 'templates', 'premium'),
  ('templates.create', 'Créer des modèles personnalisés', 'templates', 'create'),
  
  -- Permissions pour les utilisateurs
  ('users.read', 'Voir les profils utilisateurs', 'users', 'read'),
  ('users.update', 'Modifier les profils utilisateurs', 'users', 'update'),
  ('users.delete', 'Supprimer des utilisateurs', 'users', 'delete'),
  ('users.manage_roles', 'Gérer les rôles des utilisateurs', 'users', 'manage_roles'),
  
  -- Permissions pour les statistiques
  ('analytics.read', 'Voir les statistiques de base', 'analytics', 'read'),
  ('analytics.advanced', 'Voir les statistiques avancées', 'analytics', 'advanced'),
  
  -- Permissions système
  ('system.admin', 'Administration système complète', 'system', 'admin'),
  ('system.settings', 'Modifier les paramètres système', 'system', 'settings')
ON CONFLICT (name) DO NOTHING;

-- Attribution des permissions aux rôles
DO $$
DECLARE
  admin_role_id uuid;
  user_role_id uuid;
  guest_role_id uuid;
  premium_role_id uuid;
BEGIN
  -- Récupération des IDs des rôles
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO user_role_id FROM roles WHERE name = 'user';
  SELECT id INTO guest_role_id FROM roles WHERE name = 'guest';
  SELECT id INTO premium_role_id FROM roles WHERE name = 'premium';
  
  -- Permissions pour le rôle admin (toutes les permissions)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Permissions pour le rôle user (permissions de base)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT user_role_id, id FROM permissions 
  WHERE name IN (
    'invitations.create', 'invitations.read', 'invitations.update', 'invitations.delete', 'invitations.send',
    'guests.create', 'guests.read', 'guests.update', 'guests.delete', 'guests.import', 'guests.export',
    'templates.read',
    'users.read', 'users.update',
    'analytics.read'
  )
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Permissions pour le rôle premium (permissions user + premium)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT premium_role_id, id FROM permissions 
  WHERE name IN (
    'invitations.create', 'invitations.read', 'invitations.update', 'invitations.delete', 'invitations.send',
    'guests.create', 'guests.read', 'guests.update', 'guests.delete', 'guests.import', 'guests.export',
    'templates.read', 'templates.premium', 'templates.create',
    'users.read', 'users.update',
    'analytics.read', 'analytics.advanced'
  )
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Permissions pour le rôle guest (lecture seule limitée)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT guest_role_id, id FROM permissions 
  WHERE name IN (
    'invitations.read',
    'templates.read'
  )
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- Fonction pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir tous les rôles d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid)
RETURNS TABLE(role_name text, role_description text, expires_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.description, ur.expires_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
  AND (ur.expires_at IS NULL OR ur.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir toutes les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text, resource text, action text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_uuid
  AND (ur.expires_at IS NULL OR ur.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour assigner automatiquement le rôle 'user' aux nouveaux utilisateurs
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role_id uuid;
BEGIN
  -- Récupérer l'ID du rôle 'user'
  SELECT id INTO user_role_id FROM roles WHERE name = 'user';
  
  -- Assigner le rôle 'user' au nouvel utilisateur
  INSERT INTO user_roles (user_id, role_id)
  VALUES (NEW.id, user_role_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_default_role();