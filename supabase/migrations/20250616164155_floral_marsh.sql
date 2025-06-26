-- Activer la confirmation d'email obligatoire dans la configuration Supabase
-- (Ceci doit être fait dans le dashboard Supabase : Authentication > Settings > Email confirmation required)

-- Mettre à jour la fonction handle_new_user pour ne créer le profil qu'après confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne créer le profil que si l'email est confirmé
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction handle_email_confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'email vient d'être confirmé, créer ou mettre à jour le profil utilisateur
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction assign_default_role pour vérifier la confirmation d'email
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
  user_confirmed boolean;
BEGIN
  -- Vérifier si l'utilisateur a confirmé son email
  SELECT email_confirmed_at IS NOT NULL INTO user_confirmed
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Ne pas assigner de rôle si l'email n'est pas confirmé
  IF NOT user_confirmed THEN
    RETURN NEW;
  END IF;
  
  -- Get the default 'user' role ID
  SELECT id INTO default_role_id 
  FROM public.roles 
  WHERE name = 'user' AND is_system = true;
  
  -- If default role exists, assign it to the new user
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, assigned_at)
    VALUES (NEW.id, default_role_id, now())
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON public.users;

-- Créer les nouveaux triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Supprimer TOUTES les politiques existantes sur la table users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Confirmed users can view own profile" ON users;
DROP POLICY IF EXISTS "Confirmed users can insert own profile" ON users;
DROP POLICY IF EXISTS "Confirmed users can update own profile" ON users;

-- Créer de nouvelles politiques qui vérifient la confirmation d'email
CREATE POLICY "Confirmed users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = users.id 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Confirmed users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = users.id 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Confirmed users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = users.id 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  )
  WITH CHECK (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = users.id 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

-- Recréer les politiques admin
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

-- Fonction pour vérifier si un utilisateur a confirmé son email
CREATE OR REPLACE FUNCTION is_email_confirmed(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND email_confirmed_at IS NOT NULL
  );
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION is_email_confirmed TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_confirmed TO anon;