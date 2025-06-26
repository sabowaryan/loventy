/*
  # Fix users table RLS policies

  1. Security Changes
    - Remove problematic "Users must have confirmed email" policy that blocks access
    - Ensure authenticated users can read their own profile data
    - Maintain admin access for user management
    - Keep user profile creation and update permissions intact

  2. Policy Updates
    - Remove the restrictive email confirmation policy
    - Ensure clean RLS policy structure for user data access
*/

-- Drop the problematic policy that requires email confirmation
DROP POLICY IF EXISTS "Users must have confirmed email" ON users;

-- Ensure the basic user access policies are properly configured
-- (These should already exist based on the schema, but we'll recreate them to be safe)

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );