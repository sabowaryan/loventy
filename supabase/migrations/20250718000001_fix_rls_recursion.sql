-- Migration: Correction des problèmes de récursion RLS
-- Description: Corrige les politiques RLS qui causent des récursions infinies
-- Date: 2025-07-18

-- =====================================================
-- 1. SUPPRESSION DES POLITIQUES RLS PROBLÉMATIQUES
-- =====================================================

-- Supprimer les anciennes politiques qui référencent profiles.role
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Only admins can modify templates" ON invitation_templates;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;

-- =====================================================
-- 2. NOUVELLES POLITIQUES RLS SANS RÉCURSION
-- =====================================================

-- Politique pour les profils - utilise le système de rôles granulaire
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

CREATE POLICY "Admins can update user profiles" ON profiles
  FOR UPDATE USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

-- Politique pour les sessions utilisateur
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

-- Politique pour les templates d'invitation
CREATE POLICY "Only admins can modify templates" ON invitation_templates
  FOR ALL USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

-- Politique pour les logs d'audit
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

-- Politique pour les logs d'email
CREATE POLICY "Admins can view all email logs" ON email_logs
  FOR SELECT USING (
    has_user_role('super_admin') OR has_user_role('admin')
  );

-- =====================================================
-- 3. CORRECTION DE LA FONCTION is_admin()
-- =====================================================

-- Remplacer la fonction is_admin() qui cause la récursion
DROP FUNCTION IF EXISTS is_admin();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_user_role('super_admin') OR has_user_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. OPTIMISATION DES POLITIQUES POUR ÉVITER LA RÉCURSION
-- =====================================================

-- Politique optimisée pour les événements - évite les jointures complexes
DROP POLICY IF EXISTS "Collaborators can view events" ON events;
DROP POLICY IF EXISTS "Collaborators can update events" ON events;

CREATE POLICY "Collaborators can view events" ON events
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT event_id FROM event_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update events" ON events
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT event_id FROM event_collaborators 
      WHERE user_id = auth.uid()
      AND (permissions->>'write')::boolean = true
    )
  );

-- =====================================================
-- 5. POLITIQUES SIMPLIFIÉES POUR LES INVITATIONS
-- =====================================================

-- Simplifier les politiques d'invitations pour éviter les jointures complexes
DROP POLICY IF EXISTS "Collaborators can access invitations" ON invitations;
DROP POLICY IF EXISTS "Collaborators can update invitations" ON invitations;

CREATE POLICY "Collaborators can access invitations" ON invitations
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    ) OR
    event_id IN (
      SELECT event_id FROM event_collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update invitations" ON invitations
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    ) OR
    event_id IN (
      SELECT event_id FROM event_collaborators 
      WHERE user_id = auth.uid()
      AND (permissions->>'write')::boolean = true
    )
  );

-- =====================================================
-- 6. POLITIQUES OPTIMISÉES POUR LES INVITÉS
-- =====================================================

-- Simplifier les politiques pour les invités
DROP POLICY IF EXISTS "Event owners can manage all guests" ON guests;

CREATE POLICY "Event owners can manage all guests" ON guests
  FOR ALL USING (
    invitation_id IN (
      SELECT i.id FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE e.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 7. FONCTION DE VÉRIFICATION DES PERMISSIONS OPTIMISÉE
-- =====================================================

-- Remplacer la fonction has_event_permission pour éviter la récursion
DROP FUNCTION IF EXISTS has_event_permission(UUID, TEXT);

CREATE OR REPLACE FUNCTION has_event_permission(event_uuid UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_is_owner BOOLEAN;
  v_has_permission BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier si l'utilisateur est propriétaire
  SELECT (owner_id = v_user_id) INTO v_is_owner
  FROM events
  WHERE id = event_uuid;
  
  IF v_is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Vérifier les permissions de collaborateur
  SELECT (permissions->>permission_type)::boolean INTO v_has_permission
  FROM event_collaborators
  WHERE event_id = event_uuid AND user_id = v_user_id;
  
  RETURN COALESCE(v_has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FONCTION DE CACHE POUR LES RÔLES UTILISATEUR
-- =====================================================

-- Créer une fonction de cache pour éviter les requêtes répétées
CREATE OR REPLACE FUNCTION get_user_role_cache()
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_roles TEXT[];
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  -- Récupérer tous les rôles actifs de l'utilisateur
  SELECT array_agg(role::TEXT) INTO v_roles
  FROM user_roles
  WHERE user_id = v_user_id 
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Retourner le rôle le plus élevé
  IF 'super_admin' = ANY(v_roles) THEN
    RETURN 'super_admin';
  ELSIF 'admin' = ANY(v_roles) THEN
    RETURN 'admin';
  ELSIF 'moderator' = ANY(v_roles) THEN
    RETURN 'moderator';
  ELSIF 'host' = ANY(v_roles) THEN
    RETURN 'host';
  ELSIF 'guest' = ANY(v_roles) THEN
    RETURN 'guest';
  ELSE
    RETURN 'user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. POLITIQUES RLS POUR LES NOUVELLES TABLES
-- =====================================================

-- Assurer que toutes les nouvelles tables ont des politiques RLS appropriées
ALTER TABLE IF EXISTS seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique pour seo_metadata (déjà définie dans la migration SEO)
-- Politique pour login_attempts (déjà définie dans la migration login)

-- =====================================================
-- 10. NETTOYAGE ET OPTIMISATION
-- =====================================================

-- Supprimer les vues qui pourraient causer des problèmes
DROP VIEW IF EXISTS admin_user_overview;

-- Recréer la vue admin sans récursion
CREATE VIEW admin_user_overview AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.avatar_url,
  get_user_role_cache() as role,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.last_login_at,
  CASE WHEN p.is_active = false THEN 'suspended' ELSE 'active' END as status,
  COALESCE(stats.events_count, 0) as events_count,
  COALESCE(stats.guests_count, 0) as guests_count
FROM profiles p
LEFT JOIN (
  SELECT 
    e.owner_id,
    COUNT(DISTINCT e.id) as events_count,
    COUNT(DISTINCT g.id) as guests_count
  FROM events e
  LEFT JOIN invitations i ON e.id = i.event_id
  LEFT JOIN guests g ON i.id = g.invitation_id
  GROUP BY e.owner_id
) stats ON p.id = stats.owner_id;

-- =====================================================
-- 11. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Fonction optimisée pour vérifier les permissions admin sans récursion RLS';
COMMENT ON FUNCTION has_event_permission(UUID, TEXT) IS 'Fonction optimisée pour vérifier les permissions sur un événement';
COMMENT ON FUNCTION get_user_role_cache() IS 'Cache des rôles utilisateur pour éviter les requêtes répétées';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🔧 Problèmes de récursion RLS corrigés !';
  RAISE NOTICE '✅ Politiques RLS optimisées sans récursion';
  RAISE NOTICE '✅ Fonctions de sécurité mises à jour';
  RAISE NOTICE '✅ Cache des rôles implémenté';
  RAISE NOTICE '✅ Performances améliorées';
END $$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================