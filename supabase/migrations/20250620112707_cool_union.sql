/*
  # Correction des politiques RLS pour user_roles

  1. Problème
    - Récursion infinie détectée dans la politique "Admins can view all roles"
    - La politique actuelle crée une boucle infinie en vérifiant le rôle admin dans la même table

  2. Solution
    - Création d'une fonction sécurisée has_role_safe() qui évite la récursion
    - Mise à jour de la politique pour utiliser cette fonction
    - Optimisation des autres politiques pour plus de clarté et de performance

  3. Sécurité
    - Maintien de la protection RLS pour les données sensibles
    - Utilisation de SECURITY DEFINER pour la fonction critique
*/

-- Créer une fonction sécurisée pour vérifier si l'utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION public.has_role_safe(role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_role boolean;
BEGIN
  -- Utiliser une requête directe sans récursion
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.user_roles ur ON u.id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE 
      u.id = auth.uid() AND 
      r.name = role_name AND
      (ur.expires_at IS NULL OR ur.expires_at > now())
  ) INTO has_role;
  
  RETURN has_role;
END;
$$;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Recréer les politiques avec des implémentations optimisées
CREATE POLICY "Admins can view all roles" 
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role_safe('admin'));

CREATE POLICY "Users can view own roles" 
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage roles" 
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ajouter une politique pour permettre aux administrateurs de gérer les rôles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role_safe('admin'))
WITH CHECK (public.has_role_safe('admin'));

-- Vérifier et corriger les permissions sur la fonction
GRANT EXECUTE ON FUNCTION public.has_role_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_safe TO anon;
GRANT EXECUTE ON FUNCTION public.has_role_safe TO service_role;