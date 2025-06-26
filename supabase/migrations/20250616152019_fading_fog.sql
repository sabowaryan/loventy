/*
  # Fix user signup trigger

  1. Functions
    - Create or replace the handle_new_user function to automatically create user profiles
    - Create or replace the assign_default_role function to assign default roles

  2. Triggers
    - Create trigger to automatically create user profile when auth user is created
    - Create trigger to assign default role when user profile is created

  3. Default Role
    - Ensure a default 'user' role exists for new registrations
*/

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to assign default role
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the default 'user' role ID
  SELECT id INTO default_role_id 
  FROM public.roles 
  WHERE name = 'user' AND is_system = true;
  
  -- If default role exists, assign it to the new user
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, assigned_at)
    VALUES (NEW.id, default_role_id, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON public.users;

-- Create trigger to handle new auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to assign default role after user profile creation
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Ensure default 'user' role exists
INSERT INTO public.roles (name, description, is_system)
VALUES ('user', 'Default user role', true)
ON CONFLICT (name) DO NOTHING;

-- Create basic permissions if they don't exist
INSERT INTO public.permissions (name, description, resource, action)
VALUES 
  ('read_own_profile', 'Read own user profile', 'users', 'read'),
  ('update_own_profile', 'Update own user profile', 'users', 'update')
ON CONFLICT (name) DO NOTHING;

-- Assign basic permissions to user role
DO $$
DECLARE
  user_role_id uuid;
  read_permission_id uuid;
  update_permission_id uuid;
BEGIN
  -- Get role and permission IDs
  SELECT id INTO user_role_id FROM public.roles WHERE name = 'user';
  SELECT id INTO read_permission_id FROM public.permissions WHERE name = 'read_own_profile';
  SELECT id INTO update_permission_id FROM public.permissions WHERE name = 'update_own_profile';
  
  -- Assign permissions to role
  IF user_role_id IS NOT NULL AND read_permission_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (user_role_id, read_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  IF user_role_id IS NOT NULL AND update_permission_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (user_role_id, update_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END $$;