-- Migration pour supporter l'authentification Google
-- Cette migration améliore la gestion des utilisateurs OAuth

-- Mettre à jour la fonction handle_new_user pour mieux gérer les utilisateurs OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil utilisateur pour tous les utilisateurs confirmés
  -- (OAuth users sont automatiquement confirmés)
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        CASE 
          WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
          THEN trim(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1))
          ELSE ''
        END,
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction handle_email_confirmation pour OAuth
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'email vient d'être confirmé, créer ou mettre à jour le profil utilisateur
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        CASE 
          WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
          THEN trim(substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1))
          ELSE ''
        END,
        ''
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction assign_default_role pour OAuth
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
  user_confirmed boolean;
BEGIN
  -- Vérifier si l'utilisateur a confirmé son email (OAuth users sont auto-confirmés)
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

-- Fonction pour extraire le prénom depuis les métadonnées OAuth
CREATE OR REPLACE FUNCTION extract_first_name(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    user_metadata->>'first_name',
    user_metadata->>'given_name',
    split_part(user_metadata->>'full_name', ' ', 1),
    ''
  );
$$;

-- Fonction pour extraire le nom de famille depuis les métadonnées OAuth
CREATE OR REPLACE FUNCTION extract_last_name(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    user_metadata->>'last_name',
    user_metadata->>'family_name',
    CASE 
      WHEN user_metadata->>'full_name' IS NOT NULL 
      THEN trim(substring(user_metadata->>'full_name' from position(' ' in user_metadata->>'full_name') + 1))
      ELSE ''
    END,
    ''
  );
$$;

-- Fonction pour extraire l'avatar depuis les métadonnées OAuth
CREATE OR REPLACE FUNCTION extract_avatar_url(user_metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    user_metadata->>'avatar_url',
    user_metadata->>'picture',
    ''
  );
$$;

-- Accorder les permissions sur les nouvelles fonctions
GRANT EXECUTE ON FUNCTION extract_first_name TO authenticated;
GRANT EXECUTE ON FUNCTION extract_last_name TO authenticated;
GRANT EXECUTE ON FUNCTION extract_avatar_url TO authenticated;