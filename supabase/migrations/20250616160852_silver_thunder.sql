/*
  # Fix RLS Policy Infinite Recursion

  1. Security Functions
    - Create safe admin check functions that bypass RLS
    - Create role checking functions without recursion

  2. Policy Updates
    - Drop all existing problematic policies
    - Recreate with safe functions to prevent infinite recursion
    - Ensure proper access control for all tables

  3. RPC Functions
    - Safe functions for getting user roles and permissions
    - Security definer functions to bypass RLS when needed
*/

-- First, drop ALL existing policies that might cause conflicts
DROP POLICY IF EXISTS "Allow admin to manage roles" ON roles;
DROP POLICY IF EXISTS "Allow read access to roles" ON roles;
DROP POLICY IF EXISTS "Allow admin to manage permissions" ON permissions;
DROP POLICY IF EXISTS "Allow read access to permissions" ON permissions;
DROP POLICY IF EXISTS "Allow admin to manage role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Allow read access to role permissions" ON role_permissions;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_admin_safe();
DROP FUNCTION IF EXISTS has_role_safe(text);
DROP FUNCTION IF EXISTS get_user_roles(uuid);
DROP FUNCTION IF EXISTS get_user_permissions(uuid);

-- Create a safe admin check function that doesn't trigger RLS recursion
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
      AND r.is_system = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Create a function to check if user has specific role (without RLS recursion)
CREATE OR REPLACE FUNCTION has_role_safe(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = role_name
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Recreate roles policies with safe admin check
CREATE POLICY "Allow admin to manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

CREATE POLICY "Allow read access to roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate permissions policies with safe admin check
CREATE POLICY "Allow admin to manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

CREATE POLICY "Allow read access to permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate role_permissions policies with safe admin check
CREATE POLICY "Allow admin to manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

CREATE POLICY "Allow read access to role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Update the existing is_admin function to use the safe version
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin_safe();
$$;

-- Create RPC functions for getting user roles and permissions safely
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid)
RETURNS TABLE (
  role_name text,
  role_description text,
  role_id uuid,
  assigned_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.name as role_name,
    r.description as role_description,
    r.id as role_id,
    ur.assigned_at,
    ur.expires_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE (
  permission_name text,
  permission_description text,
  resource text,
  action text,
  permission_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    p.name as permission_name,
    p.description as permission_description,
    p.resource,
    p.action,
    p.id as permission_id
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_uuid
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;