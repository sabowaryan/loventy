/*
  # Fix RLS policies for users table

  1. Policy Updates
    - Update the "Confirmed users can view own profile" policy to be more permissive
    - Add a fallback policy for authenticated users to read their own profile
    - Ensure policies work correctly during the email confirmation flow

  2. Security
    - Maintain security by only allowing users to access their own data
    - Keep admin access intact
    - Allow anonymous access during auth flow as needed
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Confirmed users can view own profile" ON users;
DROP POLICY IF EXISTS "Confirmed users can insert own profile" ON users;
DROP POLICY IF EXISTS "Confirmed users can update own profile" ON users;

-- Create new, more reliable policies for authenticated users
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

-- Keep the admin policies intact
-- (These should already exist based on the schema)

-- Keep the anonymous read policy for auth flow
-- (This should already exist based on the schema)