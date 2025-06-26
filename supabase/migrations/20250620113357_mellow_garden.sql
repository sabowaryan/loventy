/*
  # Correction des politiques de la table roles

  1. Suppression des politiques existantes
     - Supprime toutes les politiques actuelles sur la table roles qui causent une récursion infinie
  
  2. Création de nouvelles politiques sécurisées
     - Utilise la fonction has_role_safe pour éviter la récursion
     - Ajoute des politiques pour les différents niveaux d'accès (admin, authenticated, public)
  
  3. Vérification des permissions
     - S'assure que les permissions sont correctement attribuées
*/

-- Supprimer toutes les politiques existantes sur la table roles
DROP POLICY IF EXISTS "Allow admin to manage roles" ON public.roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.roles;
DROP POLICY IF EXISTS "Allow public read of non-system roles" ON public.roles;
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les catégories" ON public.roles;
DROP POLICY IF EXISTS "Tous peuvent lire les catégories de modèles" ON public.roles;

-- Créer de nouvelles politiques sécurisées pour la table roles
-- Politique pour les administrateurs (utilise has_role_safe pour éviter la récursion)
CREATE POLICY "Admins can manage roles" 
ON public.roles
FOR ALL
TO authenticated
USING (public.has_role_safe('admin'))
WITH CHECK (public.has_role_safe('admin'));

-- Politique pour permettre aux utilisateurs authentifiés de lire tous les rôles
CREATE POLICY "Authenticated users can read roles" 
ON public.roles
FOR SELECT
TO authenticated
USING (true);

-- Politique pour permettre au public de lire les rôles non-système
CREATE POLICY "Public can read non-system roles" 
ON public.roles
FOR SELECT
TO public
USING ((is_system = false) OR (is_system IS NULL));

-- Vérifier que la fonction has_role_safe existe, sinon la créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role_safe' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Créer la fonction has_role_safe si elle n'existe pas
    EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION public.has_role_safe(role_name text)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $INNER$
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
    $INNER$;
    $FUNC$;

    -- Accorder les permissions d'exécution sur la fonction
    GRANT EXECUTE ON FUNCTION public.has_role_safe TO authenticated;
    GRANT EXECUTE ON FUNCTION public.has_role_safe TO anon;
    GRANT EXECUTE ON FUNCTION public.has_role_safe TO service_role;
  END IF;
END
$$;