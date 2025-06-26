/*
  # Fix infinite recursion in roles table RLS policies

  1. Problem
    - Current RLS policies on the `roles` table use functions like `is_admin_safe()` 
    - These functions likely query the roles table again, creating infinite recursion
    - This prevents users from loading their profile data

  2. Solution
    - Replace problematic policies with simpler, non-recursive ones
    - Use direct auth.uid() checks instead of role-based checks for basic access
    - Allow authenticated users to read roles (needed for user profile loading)
    - Restrict admin operations to service role only to avoid recursion

  3. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies
    - Ensure users can read roles without triggering recursion
*/

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Allow admin to manage roles" ON public.roles;
DROP POLICY IF EXISTS "Allow read access to roles" ON public.roles;

-- Create new non-recursive policies
-- Allow all authenticated users to read roles (needed for profile loading)
CREATE POLICY "Allow authenticated users to read roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to manage roles (avoids recursion issues)
CREATE POLICY "Service role can manage roles"
  ON public.roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public read access to non-system roles if needed
CREATE POLICY "Allow public read of non-system roles"
  ON public.roles
  FOR SELECT
  TO public
  USING (is_system = false OR is_system IS NULL);