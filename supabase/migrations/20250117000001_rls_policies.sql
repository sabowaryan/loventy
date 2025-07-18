/*
  # Politiques RLS Sécurisées pour Loventy
  
  Définition complète des politiques de sécurité au niveau ligne (RLS)
  avec gestion granulaire des permissions par rôle et contexte.
*/

-- =====================================================
-- POLITIQUES RLS - PROFILS UTILISATEURS
-- =====================================================

-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les admins peuvent modifier les rôles
CREATE POLICY "Admins can update user roles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- POLITIQUES RLS - SESSIONS UTILISATEUR
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- POLITIQUES RLS - ÉVÉNEMENTS
-- =====================================================

-- Les propriétaires peuvent tout faire sur leurs événements
CREATE POLICY "Owners can manage own events" ON events
  FOR ALL USING (auth.uid() = owner_id);

-- Les collaborateurs peuvent voir les événements selon leurs permissions
CREATE POLICY "Collaborators can view events" ON events
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM event_collaborators 
      WHERE event_id = events.id 
      AND user_id = auth.uid()
    )
  );

-- Les collaborateurs peuvent modifier selon leurs permissions
CREATE POLICY "Collaborators can update events" ON events
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM event_collaborators 
      WHERE event_id = events.id 
      AND user_id = auth.uid()
      AND (permissions->>'write')::boolean = true
    )
  );

-- Les événements publics sont visibles par tous
CREATE POLICY "Public events are viewable by all" ON events
  FOR SELECT USING (is_public = true);

-- =====================================================
-- POLITIQUES RLS - COLLABORATEURS D'ÉVÉNEMENTS
-- =====================================================

-- Les propriétaires d'événements peuvent gérer les collaborateurs
CREATE POLICY "Event owners can manage collaborators" ON event_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_collaborators.event_id 
      AND owner_id = auth.uid()
    )
  );

-- Les collaborateurs peuvent voir les autres collaborateurs
CREATE POLICY "Collaborators can view other collaborators" ON event_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_collaborators.event_id 
      AND (owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM event_collaborators ec2 
             WHERE ec2.event_id = event_collaborators.event_id 
             AND ec2.user_id = auth.uid()
           ))
    )
  );

-- =====================================================
-- POLITIQUES RLS - TEMPLATES
-- =====================================================

-- Les catégories de templates sont publiques
CREATE POLICY "Template categories are public" ON template_categories
  FOR SELECT USING (is_active = true);

-- Les templates actifs sont visibles par tous les utilisateurs connectés
CREATE POLICY "Active templates are viewable by authenticated users" ON invitation_templates
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Seuls les admins peuvent modifier les templates
CREATE POLICY "Only admins can modify templates" ON invitation_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- POLITIQUES RLS - INVITATIONS
-- =====================================================

-- Les propriétaires d'événements peuvent gérer leurs invitations
CREATE POLICY "Event owners can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = invitations.event_id 
      AND owner_id = auth.uid()
    )
  );

-- Les collaborateurs peuvent voir/modifier selon leurs permissions
CREATE POLICY "Collaborators can access invitations" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN event_collaborators ec ON e.id = ec.event_id
      WHERE e.id = invitations.event_id 
      AND ec.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update invitations" ON invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN event_collaborators ec ON e.id = ec.event_id
      WHERE e.id = invitations.event_id 
      AND ec.user_id = auth.uid()
      AND (ec.permissions->>'write')::boolean = true
    )
  );

-- Les invitations publiques sont visibles par tous
CREATE POLICY "Public invitations are viewable by all" ON invitations
  FOR SELECT USING (is_public = true);

-- =====================================================
-- POLITIQUES RLS - INVITÉS
-- =====================================================

-- Les propriétaires d'événements peuvent gérer tous les invités
CREATE POLICY "Event owners can manage all guests" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE i.id = guests.invitation_id 
      AND e.owner_id = auth.uid()
    )
  );

-- Les invités peuvent voir et modifier leurs propres informations via token
CREATE POLICY "Guests can access own data via token" ON guests
  FOR SELECT USING (
    access_token = current_setting('request.headers')::json->>'x-guest-token'
    AND access_expires_at > CURRENT_TIMESTAMP
  );

CREATE POLICY "Guests can update own data via token" ON guests
  FOR UPDATE USING (
    access_token = current_setting('request.headers')::json->>'x-guest-token'
    AND access_expires_at > CURRENT_TIMESTAMP
  );

-- =====================================================
-- POLITIQUES RLS - QUESTIONS ET RÉPONSES RSVP
-- =====================================================

-- Les propriétaires d'événements peuvent gérer les questions RSVP
CREATE POLICY "Event owners can manage RSVP questions" ON rsvp_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE i.id = rsvp_questions.invitation_id 
      AND e.owner_id = auth.uid()
    )
  );

-- Les invités peuvent voir les questions de leur invitation
CREATE POLICY "Guests can view RSVP questions" ON rsvp_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guests g
      WHERE g.invitation_id = rsvp_questions.invitation_id
      AND g.access_token = current_setting('request.headers')::json->>'x-guest-token'
      AND g.access_expires_at > CURRENT_TIMESTAMP
    )
  );

-- Les propriétaires peuvent voir toutes les réponses
CREATE POLICY "Event owners can view all RSVP answers" ON rsvp_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rsvp_questions rq
      JOIN invitations i ON rq.invitation_id = i.id
      JOIN events e ON i.event_id = e.id
      WHERE rq.id = rsvp_answers.question_id 
      AND e.owner_id = auth.uid()
    )
  );

-- Les invités peuvent gérer leurs propres réponses
CREATE POLICY "Guests can manage own RSVP answers" ON rsvp_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guests g
      WHERE g.id = rsvp_answers.guest_id
      AND g.access_token = current_setting('request.headers')::json->>'x-guest-token'
      AND g.access_expires_at > CURRENT_TIMESTAMP
    )
  );

-- =====================================================
-- POLITIQUES RLS - FICHIERS ET MÉDIAS
-- =====================================================

-- Les utilisateurs peuvent gérer leurs propres fichiers
CREATE POLICY "Users can manage own files" ON user_files
  FOR ALL USING (auth.uid() = user_id);

-- Les fichiers publics sont visibles par tous
CREATE POLICY "Public files are viewable by all" ON user_files
  FOR SELECT USING (is_public = true);

-- Les médias d'invitation suivent les permissions de l'invitation
CREATE POLICY "Invitation media follows invitation permissions" ON invitation_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE i.id = invitation_media.invitation_id
      AND (
        e.owner_id = auth.uid() OR
        i.is_public = true OR
        EXISTS (
          SELECT 1 FROM event_collaborators ec
          WHERE ec.event_id = e.id AND ec.user_id = auth.uid()
        )
      )
    )
  );

-- =====================================================
-- POLITIQUES RLS - STRIPE ET PAIEMENTS
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres données Stripe
CREATE POLICY "Users can view own Stripe data" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stripe_customers sc
      WHERE sc.customer_id = stripe_subscriptions.customer_id
      AND sc.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLITIQUES RLS - AUDIT ET LOGS
-- =====================================================

-- Seuls les admins peuvent voir les logs d'audit
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les utilisateurs peuvent voir leurs propres logs d'email
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Les admins peuvent voir tous les logs d'email
CREATE POLICY "Admins can view all email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FONCTIONS DE SÉCURITÉ SUPPLÉMENTAIRES
-- =====================================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les permissions sur un événement
CREATE OR REPLACE FUNCTION has_event_permission(event_uuid UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM events e
    LEFT JOIN event_collaborators ec ON e.id = ec.event_id
    WHERE e.id = event_uuid
    AND (
      e.owner_id = auth.uid() OR
      (ec.user_id = auth.uid() AND (ec.permissions->>permission_type)::boolean = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🔒 Politiques RLS configurées avec succès !';
  RAISE NOTICE '✅ Sécurité granulaire par rôle et contexte';
  RAISE NOTICE '✅ Protection des données sensibles';
  RAISE NOTICE '✅ Accès temporaire sécurisé pour les invités';
END $$;