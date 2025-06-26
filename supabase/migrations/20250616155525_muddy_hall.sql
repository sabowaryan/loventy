-- Mettre à jour la fonction handle_new_user pour utiliser les métadonnées utilisateur
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

-- Mettre à jour la fonction handle_email_confirmation pour utiliser les métadonnées
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

-- Créer une fonction pour mettre à jour les métadonnées utilisateur lors de l'inscription OTP
CREATE OR REPLACE FUNCTION public.update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Pour les utilisateurs créés via OTP, on peut avoir besoin de mettre à jour les métadonnées
  -- Cette fonction peut être appelée depuis l'application si nécessaire
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;