/*
  # Nettoyage et optimisation finale
  
  - Suppression des anciennes structures si elles existent
  - Optimisation des index
  - Vérification de l'intégrité
  - Configuration finale
*/

-- =====================================================
-- NETTOYAGE DES ANCIENNES STRUCTURES
-- =====================================================

-- Supprimer les anciennes tables si elles existent (de l'ancien système)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Supprimer les anciennes vues si elles existent
DROP VIEW IF EXISTS user_permissions_view CASCADE;
DROP VIEW IF EXISTS user_roles_view CASCADE;

-- =====================================================
-- OPTIMISATION DES INDEX
-- =====================================================

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_events_owner_date ON events(owner_id, event_date);
CREATE INDEX IF NOT EXISTS idx_invitations_event_status ON invitations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_status ON guests(invitation_id, status);
CREATE INDEX IF NOT EXISTS idx_guests_token_expires ON guests(access_token, access_expires_at) WHERE access_expires_at > CURRENT_TIMESTAMP;

-- Index pour les recherches textuelles
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || email));
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Index partiels pour les données actives
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_public ON events(id, event_date) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_invitations_published ON invitations(id, event_id) WHERE status = 'published';

-- =====================================================
-- FONCTIONS D'OPTIMISATION
-- =====================================================

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les tokens d'accès expirés
CREATE OR REPLACE FUNCTION cleanup_expired_guest_tokens()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE guests 
  SET access_token = NULL, access_expires_at = NULL
  WHERE access_expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques système
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM profiles),
      'active', (SELECT COUNT(*) FROM profiles WHERE is_active = true),
      'admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
      'hosts', (SELECT COUNT(*) FROM profiles WHERE role = 'host'),
      'guests', (SELECT COUNT(*) FROM profiles WHERE role = 'guest')
    ),
    'events', json_build_object(
      'total', (SELECT COUNT(*) FROM events),
      'public', (SELECT COUNT(*) FROM events WHERE is_public = true),
      'this_month', (SELECT COUNT(*) FROM events WHERE created_at >= date_trunc('month', CURRENT_DATE))
    ),
    'invitations', json_build_object(
      'total', (SELECT COUNT(*) FROM invitations),
      'published', (SELECT COUNT(*) FROM invitations WHERE status = 'published'),
      'sent', (SELECT COUNT(*) FROM invitations WHERE status = 'sent')
    ),
    'guests', json_build_object(
      'total', (SELECT COUNT(*) FROM guests),
      'confirmed', (SELECT COUNT(*) FROM guests WHERE status = 'confirmed'),
      'pending', (SELECT COUNT(*) FROM guests WHERE status = 'pending')
    ),
    'storage', json_build_object(
      'total_files', (SELECT COUNT(*) FROM user_files),
      'total_size_mb', (SELECT ROUND(SUM(file_size)::numeric / 1024 / 1024, 2) FROM user_files)
    ),
    'system', json_build_object(
      'expired_sessions', (SELECT COUNT(*) FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP),
      'active_suspensions', (SELECT COUNT(*) FROM user_suspensions WHERE is_active = true),
      'last_cleanup', CURRENT_TIMESTAMP
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TÂCHES DE MAINTENANCE AUTOMATIQUE
-- =====================================================

-- Créer une extension pour les tâches cron si disponible
-- (Nécessite l'extension pg_cron sur certains environnements)
DO $$
BEGIN
  -- Essayer de créer l'extension pg_cron si elle est disponible
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    
    -- Programmer le nettoyage automatique des sessions expirées (tous les jours à 2h)
    PERFORM cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
    
    -- Programmer le nettoyage des tokens expirés (toutes les semaines)
    PERFORM cron.schedule('cleanup-expired-tokens', '0 3 * * 0', 'SELECT cleanup_expired_guest_tokens();');
    
    RAISE NOTICE 'Tâches de maintenance automatique configurées avec pg_cron';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'pg_cron non disponible - maintenance manuelle requise';
  END;
END $$;

-- =====================================================
-- VÉRIFICATIONS D'INTÉGRITÉ
-- =====================================================

-- Fonction pour vérifier l'intégrité des données
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Vérifier les profils orphelins
  RETURN QUERY
  SELECT 
    'profiles_without_auth_users'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
    'Profils sans utilisateur auth: ' || COUNT(*)::TEXT
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE u.id IS NULL;
  
  -- Vérifier les événements sans propriétaire
  RETURN QUERY
  SELECT 
    'events_without_owner'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Événements sans propriétaire: ' || COUNT(*)::TEXT
  FROM events e
  LEFT JOIN profiles p ON e.owner_id = p.id
  WHERE p.id IS NULL;
  
  -- Vérifier les invitations sans événement
  RETURN QUERY
  SELECT 
    'invitations_without_event'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Invitations sans événement: ' || COUNT(*)::TEXT
  FROM invitations i
  LEFT JOIN events e ON i.event_id = e.id
  WHERE e.id IS NULL;
  
  -- Vérifier les invités sans invitation
  RETURN QUERY
  SELECT 
    'guests_without_invitation'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Invités sans invitation: ' || COUNT(*)::TEXT
  FROM guests g
  LEFT JOIN invitations i ON g.invitation_id = i.id
  WHERE i.id IS NULL;
  
  -- Vérifier les tokens expirés non nettoyés
  RETURN QUERY
  SELECT 
    'expired_guest_tokens'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END::TEXT,
    'Tokens d''invités expirés: ' || COUNT(*)::TEXT
  FROM guests
  WHERE access_expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
  
  -- Vérifier les sessions expirées
  RETURN QUERY
  SELECT 
    'expired_sessions'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END::TEXT,
    'Sessions expirées: ' || COUNT(*)::TEXT
  FROM user_sessions
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONFIGURATION FINALE
-- =====================================================

-- Mettre à jour les statistiques des tables pour l'optimiseur
ANALYZE profiles;
ANALYZE events;
ANALYZE invitations;
ANALYZE guests;
ANALYZE user_files;
ANALYZE user_sessions;
ANALYZE audit_logs;

-- Créer un utilisateur admin par défaut si aucun n'existe
DO $$
BEGIN
  -- Vérifier s'il y a déjà un admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    RAISE NOTICE 'Aucun administrateur trouvé. Créez un compte et modifiez son rôle manuellement.';
    RAISE NOTICE 'UPDATE profiles SET role = ''admin'' WHERE email = ''votre-email@example.com'';';
  ELSE
    RAISE NOTICE 'Administrateur(s) existant(s) trouvé(s)';
  END IF;
END $$;

-- Message de confirmation final
DO $$
DECLARE
  integrity_results RECORD;
  issue_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🧹 Nettoyage et optimisation terminés !';
  RAISE NOTICE '✅ Index optimisés pour les performances';
  RAISE NOTICE '✅ Fonctions de maintenance créées';
  RAISE NOTICE '✅ Vérifications d''intégrité configurées';
  
  -- Exécuter une vérification d'intégrité
  FOR integrity_results IN SELECT * FROM check_data_integrity() LOOP
    IF integrity_results.status != 'OK' THEN
      issue_count := issue_count + 1;
      RAISE NOTICE '⚠️  %: % (%)', integrity_results.status, integrity_results.check_name, integrity_results.details;
    END IF;
  END LOOP;
  
  IF issue_count = 0 THEN
    RAISE NOTICE '✅ Toutes les vérifications d''intégrité sont OK';
  ELSE
    RAISE NOTICE '⚠️  % problème(s) d''intégrité détecté(s)', issue_count;
  END IF;
  
  RAISE NOTICE '🎉 Système Loventy prêt pour la production !';
END $$;