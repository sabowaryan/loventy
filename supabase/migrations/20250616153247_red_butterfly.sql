/*
  # Fix infinite recursion in user_roles RLS policies

  1. Problem
    - Current policies on user_roles table create infinite recursion
    - Policies check admin role by querying user_roles table itself
    - This creates a circular dependency when evaluating policies

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid self-referencing
    - Use simpler logic that doesn't create recursion
    - Allow users to read their own roles without admin check
    - Restrict modifications to service role only

  3. Changes
    - Remove recursive admin checks from user_roles policies
    - Simplify SELECT policy to allow users to see their own roles
    - Keep admin-only policies for INSERT/UPDATE/DELETE but use service role
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Les admins peuvent voir tous les rôles utilisateurs" ON user_roles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres rôles" ON user_roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent assigner des rôles" ON user_roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les assignations de rôles" ON user_roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent supprimer les assignations de rôles" ON user_roles;

-- Create new non-recursive policies
-- Users can view their own role assignments
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only service role can insert role assignments (no recursion)
CREATE POLICY "Service role can insert roles"
  ON user_roles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can update role assignments (no recursion)
CREATE POLICY "Service role can update roles"
  ON user_roles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only service role can delete role assignments (no recursion)
CREATE POLICY "Service role can delete roles"
  ON user_roles
  FOR DELETE
  TO service_role
  USING (true);

-- Create a function to safely check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
      AND r.name = 'admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Create admin-accessible policies using the function
CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;