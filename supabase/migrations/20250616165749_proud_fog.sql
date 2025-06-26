/*
  # Fix Users Table RLS Policy

  1. Changes
    - Drop the problematic "Confirmed users can view own profile" policy
    - Recreate it with correct logic using auth.uid() function
    - Fix the EXISTS subquery to properly check if the current user's email is confirmed

  2. Security
    - Maintains RLS protection
    - Only allows authenticated users to view their own profile data
    - Only allows access if the user's email has been confirmed
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Confirmed users can view own profile" ON users;

-- Create the corrected policy
CREATE POLICY "Confirmed users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) AND 
    (EXISTS (
      SELECT 1
      FROM auth.users au
      WHERE (au.id = auth.uid()) AND (au.email_confirmed_at IS NOT NULL)
    ))
  );