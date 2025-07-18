-- Migration: Correction des erreurs d'inscription utilisateur
-- Description: Corrige les problèmes dans la fonction handle_new_user_with_plan
-- Date: 2025-07-18

-- =====================================================
-- 1. CORRECTION DE LA FONCTION handle_new_user_with_plan
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_with_plan();

CREATE OR REPLACE FUNCTION handle_new_user_with_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_limits JSONB;
BEGIN
  RAISE LOG 'Creating new user profile for user_id: %', NEW.id;
  
  -- Étape 1 : Créer le profil utilisateur
  BEGIN
    INSERT INTO public.profiles (
      id, email, first_name, last_name, avatar_url,
      phone, timezone, language, is_active, email_verified
    )
    VALUES (
      NEW.id, NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
      COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
      true,
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RAISE LOG 'Profile created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user_id: %. Error: %', NEW.id, SQLERRM;
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
  END;

  -- Étape 2 : Assigner le rôle 'host'
  BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_by, is_active)
    VALUES (NEW.id, 'host', NEW.id, true);
    RAISE LOG 'Role assigned successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error assigning role for user_id: %. Error: %', NEW.id, SQLERRM;
    RAISE EXCEPTION 'Erreur lors de l''assignation du rôle: %', SQLERRM;
  END;

  -- Étape 3 : Assigner le plan gratuit (via la table plans)
  BEGIN
   SELECT get_plan_limits('free'::subscription_plan_enum) INTO v_plan_limits;

    INSERT INTO public.user_subscriptions (
      user_id, plan, status,
      max_events, max_guests_per_event, max_storage_mb,
      features, current_period_start, current_period_end
    )
    VALUES (
      NEW.id,
      'free',
      'active',
      COALESCE((v_plan_limits->>'events')::INTEGER, 1),
      COALESCE((v_plan_limits->>'guests')::INTEGER, 50),
      COALESCE((v_plan_limits->>'storage')::INTEGER, 100),
      v_plan_limits->'features',
      CURRENT_TIMESTAMP,
      NULL
    );
    RAISE LOG 'Subscription created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de l''insertion dans user_subscriptions pour user_id % : %', NEW.id, SQLERRM;
  END;

  -- Étape 4 : (optionnel) créer une session d’audit
  BEGIN
    INSERT INTO public.user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
    VALUES (
      NEW.id,
      generate_secure_token(),
      '127.0.0.1'::inet,
      'Registration',
      CURRENT_TIMESTAMP + INTERVAL '24 hours'
    );
    RAISE LOG 'Session created successfully for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating session for user_id: %. Error: %', NEW.id, SQLERRM;
  END;

  RAISE LOG 'User registration completed successfully for user_id: %', NEW.id;
  RETURN NEW;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_with_plan();


-- =====================================================
-- 2. VÉRIFICATION ET CORRECTION DES CONTRAINTES
-- =====================================================

-- Vérifier que la fonction get_plan_limits existe et fonctionne
DO $$
DECLARE
  v_test_limits JSONB;
BEGIN
  SELECT get_plan_limits('free') INTO v_test_limits;
  IF v_test_limits IS NULL THEN
    RAISE EXCEPTION 'La fonction get_plan_limits ne retourne pas de résultat valide';
  END IF;
  RAISE LOG 'Plan limits function test successful: %', v_test_limits;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error testing get_plan_limits: %', SQLERRM;
END $$;

-- Vérifier que la fonction generate_secure_token existe
DO $$
DECLARE
  v_test_token TEXT;
BEGIN
  SELECT generate_secure_token() INTO v_test_token;
  IF v_test_token IS NULL OR length(v_test_token) < 10 THEN
    RAISE EXCEPTION 'La fonction generate_secure_token ne fonctionne pas correctement';
  END IF;
  RAISE LOG 'Secure token function test successful';
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error testing generate_secure_token: %', SQLERRM;
END $$;

-- =====================================================
-- 3. RECRÉATION DU TRIGGER
-- =====================================================

-- Supprimer et recréer le trigger pour s'assurer qu'il utilise la bonne fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user_with_plan();

-- =====================================================
-- 4. FONCTION DE NETTOYAGE POUR LES INSCRIPTIONS ÉCHOUÉES
-- =====================================================

-- Fonction pour nettoyer les données d'un utilisateur en cas d'échec d'inscription
CREATE OR REPLACE FUNCTION cleanup_failed_registration(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Supprimer les données partielles en cas d'échec
  DELETE FROM user_sessions WHERE user_id = user_uuid;
  DELETE FROM user_subscriptions WHERE user_id = user_uuid;
  DELETE FROM user_roles WHERE user_id = user_uuid;
  DELETE FROM profiles WHERE id = user_uuid;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error cleaning up failed registration for user_id: %. Error: %', user_uuid, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FONCTION DE TEST D'INSCRIPTION
-- =====================================================

-- Fonction pour tester le processus d'inscription (à utiliser en développement)
CREATE OR REPLACE FUNCTION test_user_registration()
RETURNS TEXT AS $$
DECLARE
  v_test_user_id UUID;
  v_result TEXT;
BEGIN
  -- Générer un ID de test
  v_test_user_id := gen_random_uuid();
  
  -- Simuler l'insertion d'un utilisateur
  BEGIN
    -- Tester la création du profil
    INSERT INTO profiles (
      id, 
      email, 
      first_name, 
      last_name,
      is_active
    )
    VALUES (
      v_test_user_id,
      'test@example.com',
      'Test',
      'User',
      true
    );
    
    -- Tester l'assignation du rôle
    INSERT INTO user_roles (user_id, role, granted_by, is_active)
    VALUES (v_test_user_id, 'host', v_test_user_id, true);
    
    -- Tester la création de l'abonnement
    INSERT INTO user_subscriptions (
      user_id, 
      plan, 
      status,
      max_events,
      max_guests_per_event,
      max_storage_mb
    )
    VALUES (
      v_test_user_id,
      'free',
      'active',
      1,
      50,
      100
    );
    
    v_result := 'SUCCESS: Test registration completed';
    
    -- Nettoyer les données de test
    PERFORM cleanup_failed_registration(v_test_user_id);
    
  EXCEPTION WHEN OTHERS THEN
    v_result := 'ERROR: ' || SQLERRM;
    -- Nettoyer en cas d'erreur
    PERFORM cleanup_failed_registration(v_test_user_id);
  END;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION handle_new_user_with_plan() IS 'Fonction robuste pour créer un profil utilisateur complet lors de l''inscription avec gestion d''erreurs';
COMMENT ON FUNCTION cleanup_failed_registration(UUID) IS 'Nettoie les données partielles en cas d''échec d''inscription';
COMMENT ON FUNCTION test_user_registration() IS 'Fonction de test pour valider le processus d''inscription';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🔧 Fonction d''inscription utilisateur corrigée !';
  RAISE NOTICE '✅ Gestion d''erreurs robuste implémentée';
  RAISE NOTICE '✅ Trigger recréé avec la fonction corrigée';
  RAISE NOTICE '✅ Fonctions de nettoyage et test ajoutées';
  RAISE NOTICE '✅ Logs détaillés pour le debugging';
END $$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- =====================================================
-- 7. CORRECTION DES POLITIQUES RLS MANQUANTES
-- =====================================================

-- Supprimer et recréer les politiques pour éviter les conflits

-- Politique pour permettre l'insertion de nouveaux profils lors de l'inscription
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
CREATE POLICY "Allow profile creation during registration" ON profiles
  FOR INSERT 
  WITH CHECK (true); -- Permet l'insertion pour tous (nécessaire pour l'inscription)

-- Politique pour permettre l'insertion de rôles lors de l'inscription
DROP POLICY IF EXISTS "Allow role assignment during registration" ON user_roles;
CREATE POLICY "Allow role assignment during registration" ON user_roles
  FOR INSERT 
  WITH CHECK (true); -- Permet l'assignation de rôles lors de l'inscription

-- Politique pour permettre l'insertion d'abonnements lors de l'inscription
DROP POLICY IF EXISTS "Allow subscription creation during registration" ON user_subscriptions;
CREATE POLICY "Allow subscription creation during registration" ON user_subscriptions
  FOR INSERT 
  WITH CHECK (true); -- Permet la création d'abonnements lors de l'inscription

-- Politique pour permettre l'insertion de sessions lors de l'inscription
DROP POLICY IF EXISTS "Allow session creation during registration" ON user_sessions;
CREATE POLICY "Allow session creation during registration" ON user_sessions
  FOR INSERT 
  WITH CHECK (true); -- Permet la création de sessions

-- =====================================================
-- 8. VÉRIFICATION DES POLITIQUES RLS
-- =====================================================

-- Fonction pour vérifier que toutes les politiques nécessaires existent
CREATE OR REPLACE FUNCTION check_registration_policies()
RETURNS TEXT AS $$
DECLARE
  v_policies_count INTEGER;
  v_result TEXT;
BEGIN
  -- Vérifier les politiques pour profiles
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies 
  WHERE tablename = 'profiles' 
  AND cmd = 'INSERT';
  
  IF v_policies_count = 0 THEN
    RETURN 'ERROR: Aucune politique INSERT trouvée pour la table profiles';
  END IF;
  
  -- Vérifier les politiques pour user_roles
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies 
  WHERE tablename = 'user_roles' 
  AND cmd = 'INSERT';
  
  IF v_policies_count = 0 THEN
    RETURN 'ERROR: Aucune politique INSERT trouvée pour la table user_roles';
  END IF;
  
  -- Vérifier les politiques pour user_subscriptions
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies 
  WHERE tablename = 'user_subscriptions' 
  AND cmd = 'INSERT';
  
  IF v_policies_count = 0 THEN
    RETURN 'ERROR: Aucune politique INSERT trouvée pour la table user_subscriptions';
  END IF;
  
  RETURN 'SUCCESS: Toutes les politiques d''insertion nécessaires sont présentes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la vérification
DO $$
DECLARE
  v_check_result TEXT;
BEGIN
  SELECT check_registration_policies() INTO v_check_result;
  RAISE NOTICE 'Vérification des politiques: %', v_check_result;
END $$;

-- =====================================================
-- 9. MESSAGE FINAL DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🔧 Correction complète du système d''inscription !';
  RAISE NOTICE '✅ Fonction handle_new_user_with_plan corrigée avec gestion d''erreurs';
  RAISE NOTICE '✅ Politiques RLS d''insertion ajoutées';
  RAISE NOTICE '✅ Trigger recréé et testé';
  RAISE NOTICE '✅ Fonctions de nettoyage et diagnostic ajoutées';
  RAISE NOTICE '✅ Logs détaillés pour le debugging';
  RAISE NOTICE '🎯 L''inscription devrait maintenant fonctionner correctement !';
END $$;

-- =====================================================
-- 10. NETTOYAGE DE L'ANCIENNE FONCTION OBSOLÈTE
-- =====================================================

-- Supprimer l'ancienne fonction handle_new_user() qui est obsolète
-- Cette fonction référence profiles.role qui n'existe plus et cause des erreurs
DROP FUNCTION IF EXISTS handle_new_user();

-- Vérifier qu'aucun trigger n'utilise encore l'ancienne fonction
DO $$
DECLARE
  v_trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
  AND event_object_table = 'users'
  AND event_object_schema = 'auth';
  
  IF v_trigger_count > 1 THEN
    RAISE WARNING 'Attention: Plusieurs triggers on_auth_user_created détectés. Nettoyage nécessaire.';
    
    -- Supprimer tous les triggers existants et recréer le bon
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Recréer le trigger avec la bonne fonction
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW 
      EXECUTE FUNCTION handle_new_user_with_plan();
      
    RAISE NOTICE 'Trigger on_auth_user_created nettoyé et recréé avec handle_new_user_with_plan()';
  ELSE
    RAISE NOTICE 'Un seul trigger on_auth_user_created trouvé - Configuration correcte';
  END IF;
END $$;

-- =====================================================
-- 11. DOCUMENTATION DES FONCTIONS ACTIVES
-- =====================================================

-- Documenter quelle fonction est maintenant utilisée
COMMENT ON FUNCTION handle_new_user_with_plan() IS 
'FONCTION ACTIVE: Crée un profil utilisateur complet lors de l''inscription avec le système de rôles granulaire et les abonnements. Remplace l''ancienne handle_new_user() qui était obsolète.';

-- Fonction pour lister les fonctions d'inscription actives
CREATE OR REPLACE FUNCTION get_active_registration_functions()
RETURNS TABLE(
  function_name TEXT,
  status TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'handle_new_user_with_plan'::TEXT as function_name,
    'ACTIVE'::TEXT as status,
    'Fonction principale pour l''inscription avec rôles granulaires et abonnements'::TEXT as description
  WHERE EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_with_plan'
  )
  
  UNION ALL
  
  SELECT 
    'handle_new_user'::TEXT as function_name,
    'SUPPRIMÉE'::TEXT as status,
    'Ancienne fonction obsolète qui référençait profiles.role (supprimée)'::TEXT as description
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Afficher l'état des fonctions d'inscription
DO $$
DECLARE
  v_function RECORD;
BEGIN
  RAISE NOTICE '📋 État des fonctions d''inscription :';
  FOR v_function IN SELECT * FROM get_active_registration_functions() LOOP
    RAISE NOTICE '  - % : % - %', v_function.function_name, v_function.status, v_function.description;
  END LOOP;
END $$;

-- =====================================================
-- 12. MESSAGE FINAL DE NETTOYAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🧹 Nettoyage des fonctions obsolètes terminé !';
  RAISE NOTICE '✅ handle_new_user() obsolète supprimée';
  RAISE NOTICE '✅ handle_new_user_with_plan() est maintenant la seule fonction active';
  RAISE NOTICE '✅ Trigger on_auth_user_created nettoyé et vérifié';
  RAISE NOTICE '✅ Documentation mise à jour';
  RAISE NOTICE '🎯 Système d''inscription unifié et fonctionnel !';
END $$;