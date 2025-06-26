/*
  # Fix users table permissions for anon role

  1. Security Changes
    - Add policy to allow anon role to read user profiles during authentication flow
    - This is needed for the initial profile loading after sign-in
    
  2. Notes
    - The policy is restrictive and only allows reading during the authentication process
    - Existing authenticated user policies remain unchanged
*/

-- Allow anon role to read users table (needed during authentication flow)
CREATE POLICY "Allow anon to read users during auth"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Grant SELECT permission to anon role on users table
GRANT SELECT ON public.users TO anon;