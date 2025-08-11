-- =====================================================
-- CONTRAINTES, INDEXES, POLICIES RLS ET VUES LOVENTY
-- =====================================================
-- Ce script complète la structure de base avec :
-- - Contraintes additionnelles (CHECK, UNIQUE, etc.)
-- - Indexes (simples, composites, partiels, textuels)
-- - Policies RLS (sécurité)
-- - Vues utiles (admin, analytics, etc.)

-- =========================
-- 1. CONTRAINTES ADDITIONNELLES
-- =========================
-- (Déjà incluses dans la structure de base, rien à ajouter ici)

-- =========================
-- 2. INDEXES
-- =========================
-- Index utilisateurs
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_profiles_search ON profiles USING gin(to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || email));
CREATE INDEX idx_profiles_active ON profiles(id) WHERE is_active = true;

-- Index événements
CREATE INDEX idx_events_owner_id ON events(owner_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_public ON events(is_public);
CREATE INDEX idx_events_owner_date ON events(owner_id, event_date);
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_events_public ON events(id, event_date) WHERE is_public = true;

-- Index collaborateurs
CREATE INDEX idx_event_collaborators_event_id ON event_collaborators(event_id);
CREATE INDEX idx_event_collaborators_user_id ON event_collaborators(user_id);

-- Index invitations
CREATE INDEX idx_invitations_event_id ON invitations(event_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_access_code ON invitations(access_code);
CREATE INDEX idx_invitations_event_status ON invitations(event_id, status);
CREATE INDEX idx_invitations_published ON invitations(id, event_id) WHERE status = 'published';

-- Index invités
CREATE INDEX idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX idx_guests_access_token ON guests(access_token);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_invitation_status ON guests(invitation_id, status);
-- Index composite sur le jeton et sa date d'expiration
CREATE INDEX idx_guests_token_and_expiry ON guests(access_token, access_expires_at);


-- Index fichiers
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_file_type ON user_files(file_type);
CREATE INDEX idx_invitation_media_invitation_id ON invitation_media(invitation_id);

-- Index business
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);

-- Index système
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- Index SEO
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_path ON public.seo_metadata(page_path) WHERE page_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_id ON public.seo_metadata(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_composite ON public.seo_metadata(entity_id, entity_type) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seo_metadata_updated_at ON public.seo_metadata(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_language ON public.seo_metadata(language_code);

-- =========================
-- 3. POLICIES RLS
-- =========================
-- (Inclure les policies optimisées, d'insertion, et pour les nouvelles tables)

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow profile creation during registration" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));
CREATE POLICY "Admins can update user profiles" ON profiles FOR UPDATE USING (has_user_role('super_admin') OR has_user_role('admin'));

-- User sessions
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow session creation during registration" ON user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all sessions" ON user_sessions FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Events
CREATE POLICY "Owners can manage own events" ON events FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Collaborators can view events" ON events FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT event_id FROM event_collaborators WHERE user_id = auth.uid()));
CREATE POLICY "Collaborators can update events" ON events FOR UPDATE USING (owner_id = auth.uid() OR id IN (SELECT event_id FROM event_collaborators WHERE user_id = auth.uid() AND (permissions->>'write')::boolean = true));
CREATE POLICY "Public events are viewable by all" ON events FOR SELECT USING (is_public = true);

-- Event collaborators
CREATE POLICY "Event owners can manage collaborators" ON event_collaborators FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE id = event_collaborators.event_id AND owner_id = auth.uid()));
CREATE POLICY "Collaborators can view other collaborators" ON event_collaborators FOR SELECT USING (EXISTS (SELECT 1 FROM events WHERE id = event_collaborators.event_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM event_collaborators ec2 WHERE ec2.event_id = event_collaborators.event_id AND ec2.user_id = auth.uid()))));

-- Template categories
CREATE POLICY "Template categories are public" ON template_categories FOR SELECT USING (is_active = true);

-- Invitation templates
CREATE POLICY "Active templates are viewable by authenticated users" ON invitation_templates FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');
CREATE POLICY "Only admins can modify templates" ON invitation_templates FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Invitations
CREATE POLICY "Event owners can manage invitations" ON invitations FOR ALL USING (EXISTS (SELECT 1 FROM events WHERE id = invitations.event_id AND owner_id = auth.uid()));
CREATE POLICY "Collaborators can access invitations" ON invitations FOR SELECT USING (event_id IN (SELECT id FROM events WHERE owner_id = auth.uid()) OR event_id IN (SELECT event_id FROM event_collaborators WHERE user_id = auth.uid()));
CREATE POLICY "Collaborators can update invitations" ON invitations FOR UPDATE USING (event_id IN (SELECT id FROM events WHERE owner_id = auth.uid()) OR event_id IN (SELECT event_id FROM event_collaborators WHERE user_id = auth.uid() AND (permissions->>'write')::boolean = true));
CREATE POLICY "Public invitations are viewable by all" ON invitations FOR SELECT USING (is_public = true);

-- Guests
CREATE POLICY "Event owners can manage all guests" ON guests FOR ALL USING (invitation_id IN (SELECT i.id FROM invitations i JOIN events e ON i.event_id = e.id WHERE e.owner_id = auth.uid()));
CREATE POLICY "Guests can access own data via token" ON guests FOR SELECT USING (access_token = current_setting('request.headers')::json->>'x-guest-token' AND access_expires_at > CURRENT_TIMESTAMP);
CREATE POLICY "Guests can update own data via token" ON guests FOR UPDATE USING (access_token = current_setting('request.headers')::json->>'x-guest-token' AND access_expires_at > CURRENT_TIMESTAMP);

-- RSVP questions
CREATE POLICY "Event owners can manage RSVP questions" ON rsvp_questions FOR ALL USING (EXISTS (SELECT 1 FROM invitations i JOIN events e ON i.event_id = e.id WHERE i.id = rsvp_questions.invitation_id AND e.owner_id = auth.uid()));
CREATE POLICY "Guests can view RSVP questions" ON rsvp_questions FOR SELECT USING (EXISTS (SELECT 1 FROM guests g WHERE g.invitation_id = rsvp_questions.invitation_id AND g.access_token = current_setting('request.headers')::json->>'x-guest-token' AND g.access_expires_at > CURRENT_TIMESTAMP));

-- RSVP answers
CREATE POLICY "Event owners can view all RSVP answers" ON rsvp_answers FOR SELECT USING (EXISTS (SELECT 1 FROM rsvp_questions rq JOIN invitations i ON rq.invitation_id = i.id JOIN events e ON i.event_id = e.id WHERE rq.id = rsvp_answers.question_id AND e.owner_id = auth.uid()));
CREATE POLICY "Guests can manage own RSVP answers" ON rsvp_answers FOR ALL USING (EXISTS (SELECT 1 FROM guests g WHERE g.id = rsvp_answers.guest_id AND g.access_token = current_setting('request.headers')::json->>'x-guest-token' AND g.access_expires_at > CURRENT_TIMESTAMP));

-- User files
CREATE POLICY "Users can manage own files" ON user_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public files are viewable by all" ON user_files FOR SELECT USING (is_public = true);

-- Invitation media
CREATE POLICY "Invitation media follows invitation permissions" ON invitation_media FOR SELECT USING (EXISTS (SELECT 1 FROM invitations i JOIN events e ON i.event_id = e.id WHERE i.id = invitation_media.invitation_id AND (e.owner_id = auth.uid() OR i.is_public = true OR EXISTS (SELECT 1 FROM event_collaborators ec WHERE ec.event_id = e.id AND ec.user_id = auth.uid()))));

-- Stripe customers
CREATE POLICY "Users can view own Stripe data" ON stripe_customers FOR SELECT USING (auth.uid() = user_id);

-- Stripe subscriptions
CREATE POLICY "Users can view own subscriptions" ON stripe_subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM stripe_customers sc WHERE sc.customer_id = stripe_subscriptions.customer_id AND sc.user_id = auth.uid()));

-- Audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Email logs
CREATE POLICY "Users can view own email logs" ON email_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all email logs" ON email_logs FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));

-- User roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow role assignment during registration" ON user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- User subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow subscription creation during registration" ON user_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions FOR ALL USING (has_user_role('super_admin') OR has_user_role('admin'));

-- Role permissions
CREATE POLICY "Authenticated users can view permissions" ON role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only super_admin can manage permissions" ON role_permissions FOR ALL USING (has_user_role('super_admin'));

-- SEO metadata
CREATE POLICY "Lecture publique des métadonnées SEO" ON public.seo_metadata FOR SELECT TO public USING (true);
CREATE POLICY "Administrateurs peuvent tout faire sur SEO" ON public.seo_metadata FOR ALL TO authenticated USING (has_user_role('super_admin') OR has_user_role('admin'));
CREATE POLICY "Propriétaires peuvent gérer leurs métadonnées SEO" ON public.seo_metadata FOR ALL TO authenticated USING ((entity_type = 'event' AND EXISTS (SELECT 1 FROM public.events WHERE events.id = seo_metadata.entity_id AND events.owner_id = auth.uid())) OR (entity_type = 'invitation' AND EXISTS (SELECT 1 FROM public.invitations i JOIN public.events e ON i.event_id = e.id WHERE i.id = seo_metadata.entity_id AND e.owner_id = auth.uid())) OR (entity_type = 'profile' AND entity_id::text = auth.uid()::text) OR created_by = auth.uid());

-- Login attempts
CREATE POLICY "Admins can view all login attempts" ON login_attempts FOR SELECT USING (has_user_role('super_admin') OR has_user_role('admin'));
CREATE POLICY "System can insert login attempts" ON login_attempts FOR INSERT WITH CHECK (true);

-- =========================
-- 4. VUES
-- =========================

-- Vue admin_user_overview (optimisée, sans récursion)
CREATE OR REPLACE VIEW admin_user_overview AS
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

-- Vue users_with_roles_and_plans
CREATE OR REPLACE VIEW users_with_roles_and_plans AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.is_active,
  p.created_at,
  p.updated_at,
  roles.primary_role,
  roles.all_roles,
  sub.plan as current_plan,
  sub.status as plan_status,
  sub.expires_at as plan_expires_at,
  sub.features as plan_features
FROM profiles p
LEFT JOIN (
  SELECT 
    ur.user_id,
    (array_agg(ur.role ORDER BY 
      CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'moderator' THEN 3
        WHEN 'host' THEN 4
        WHEN 'support' THEN 5
        WHEN 'guest' THEN 6
      END
    ))[1] as primary_role,
    array_agg(ur.role) as all_roles
  FROM user_roles ur
  WHERE ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
  GROUP BY ur.user_id
) roles ON p.id = roles.user_id
LEFT JOIN (
  SELECT DISTINCT ON (user_id)
    user_id,
    plan,
    status,
    expires_at,
    features
  FROM user_subscriptions
  WHERE status IN ('active', 'trial')
  ORDER BY user_id, created_at DESC
) sub ON p.id = sub.user_id;

-- Vue events_with_stats
CREATE OR REPLACE VIEW events_with_stats AS
SELECT 
  e.*,
  COUNT(DISTINCT i.id) as invitation_count,
  COUNT(DISTINCT g.id) as guest_count,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'confirmed') as confirmed_count,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'declined') as declined_count,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'pending') as pending_count
FROM events e
LEFT JOIN invitations i ON e.id = i.event_id
LEFT JOIN guests g ON i.id = g.invitation_id
GROUP BY e.id;

-- Vue invitations_with_event_details
CREATE OR REPLACE VIEW invitations_with_event_details AS
SELECT 
  i.*,
  e.title as event_title,
  e.event_date,
  e.event_time,
  e.venue_name,
  e.venue_address,
  e.owner_id as event_owner_id,
  t.name as template_name,
  t.design_config as template_config
FROM invitations i
JOIN events e ON i.event_id = e.id
LEFT JOIN invitation_templates t ON i.template_id = t.id;

-- =========================
-- 5. COMMENTAIRES SEO
-- =========================

COMMENT ON TABLE public.seo_metadata IS 'Table de gestion des métadonnées SEO pour toutes les pages et entités du site';
COMMENT ON COLUMN public.seo_metadata.page_path IS 'Chemin de la page (ex: /, /pricing, /about)';
COMMENT ON COLUMN public.seo_metadata.entity_id IS 'ID de l''entité associée (event, invitation, profile)';
COMMENT ON COLUMN public.seo_metadata.entity_type IS 'Type d''entité (event, invitation, profile, page)';
COMMENT ON COLUMN public.seo_metadata.meta_title IS 'Titre SEO (max 60 caractères)';
COMMENT ON COLUMN public.seo_metadata.meta_description IS 'Description SEO (max 160 caractères)';
COMMENT ON COLUMN public.seo_metadata.priority IS 'Priorité pour le sitemap (0.0 à 1.0)';
COMMENT ON COLUMN public.seo_metadata.change_frequency IS 'Fréquence de changement pour le sitemap';

-- =========================
-- FIN DU SCRIPT
-- ========================= 