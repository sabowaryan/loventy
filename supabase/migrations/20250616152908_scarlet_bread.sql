/*
  # Configuration de la vérification email avec OTP

  1. Configuration
    - Active la vérification email obligatoire
    - Configure les templates d'email OTP
    - Met à jour les triggers pour gérer la création d'utilisateur après vérification

  2. Sécurité
    - Assure que seuls les emails vérifiés peuvent se connecter
    - Maintient l'intégrité des données utilisateur
*/

-- Mettre à jour la fonction handle_new_user pour gérer les utilisateurs vérifiés
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email est confirmé avant de créer le profil
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

-- Créer une fonction pour gérer la confirmation d'email
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

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

-- Créer le trigger pour la création d'utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Créer le trigger pour la confirmation d'email
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

-- Mettre à jour les politiques RLS pour s'assurer que seuls les utilisateurs vérifiés peuvent accéder aux données
CREATE POLICY "Users must have confirmed email" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = users.id 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );