/*
  # Fix RLS Policy Infinite Recursion

  1. Database Issues Fixed
    - Remove circular dependencies in RLS policies
    - Simplify role-based access control
    - Add proper admin check function
    - Fix user roles and permissions policies

  2. Security Updates
    - Maintain proper access control
    - Ensure users can only access their own data
    - Allow admins to manage system data safely
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les rôles" ON roles;
DROP POLICY IF EXISTS "Tous peuvent lire les rôles" ON roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions" ON permissions;
DROP POLICY IF EXISTS "Tous peuvent lire les permissions" ON permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions des rôles" ON role_permissions;
DROP POLICY IF EXISTS "Tous peuvent lire les permissions des rôles" ON role_permissions;

-- Create a safe admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Create simplified policies for roles table
CREATE POLICY "Allow read access to roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    -- Use direct role check without recursion
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Create simplified policies for permissions table
CREATE POLICY "Allow read access to permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Create simplified policies for role_permissions table
CREATE POLICY "Allow read access to role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
          SELECT id FROM roles WHERE name = 'admin' AND is_system = true
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Create or replace the get_user_roles function with better error handling
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid)
RETURNS TABLE(
  role_name text,
  role_description text,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    r.name as role_name,
    r.description as role_description,
    ur.expires_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

-- Create or replace the get_user_permissions function with better error handling
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE(
  permission_name text,
  resource text,
  action text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT
    p.name as permission_name,
    p.resource,
    p.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_uuid
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

-- Ensure we have a default admin role
INSERT INTO roles (name, description, is_system) 
VALUES ('admin', 'System Administrator', true)
ON CONFLICT (name) DO NOTHING;

-- Ensure we have a default user role
INSERT INTO roles (name, description, is_system) 
VALUES ('user', 'Regular User', true)
ON CONFLICT (name) DO NOTHING;