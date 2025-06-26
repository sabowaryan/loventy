-- Optimisation des politiques pour la table users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Allow anon to read users during auth" ON users;

-- Recréation des politiques optimisées pour users
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can manage all profiles"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

CREATE POLICY "Allow anon to read users during auth"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Optimisation des politiques pour la table user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can update roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can delete roles" ON user_roles;

-- Recréation des politiques optimisées pour user_roles
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

CREATE POLICY "Service role can manage roles"
  ON user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optimisation des politiques pour la table invitations
DROP POLICY IF EXISTS "Users can manage own invitations" ON invitations;

CREATE POLICY "Users can manage own invitations"
  ON invitations
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table guests
DROP POLICY IF EXISTS "Users can manage own guests" ON guests;

CREATE POLICY "Users can manage own guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table email_logs
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON email_logs;

CREATE POLICY "Users can view own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table user_files
DROP POLICY IF EXISTS "Users can manage own files" ON user_files;

CREATE POLICY "Users can manage own files"
  ON user_files
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table plan_usage
DROP POLICY IF EXISTS "Users can view own usage" ON plan_usage;
DROP POLICY IF EXISTS "System can manage usage stats" ON plan_usage;

CREATE POLICY "Users can manage own usage"
  ON plan_usage
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table stripe_customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) AND deleted_at IS NULL);

-- Optimisation des politiques pour la table stripe_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (SELECT auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Optimisation des politiques pour la table stripe_orders
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (SELECT auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Optimisation des politiques pour la table invitation_media
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs médias" ON invitation_media;

CREATE POLICY "Les utilisateurs peuvent gérer leurs médias"
  ON invitation_media
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimisation des politiques pour la table invitation_guests_extended
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs invités étendus" ON invitation_guests_extended;

CREATE POLICY "Les utilisateurs peuvent gérer leurs invités étendus"
  ON invitation_guests_extended
  FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN invitations i ON g.invitation_id = i.id
      WHERE i.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN invitations i ON g.invitation_id = i.id
      WHERE i.user_id = (SELECT auth.uid())
    )
  );

-- Optimisation des politiques pour la table invitation_thank_you
DROP POLICY IF EXISTS "Les utilisateurs peuvent lire les remerciements" ON invitation_thank_you;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer les remerciements" ON invitation_thank_you;
DROP POLICY IF EXISTS "Les invités peuvent ajouter des remerciements" ON invitation_thank_you;

CREATE POLICY "Les utilisateurs peuvent lire les remerciements"
  ON invitation_thank_you
  FOR SELECT
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = (SELECT auth.uid())
    )
    OR
    (is_public = true AND is_approved = true)
  );

CREATE POLICY "Les utilisateurs peuvent gérer les remerciements"
  ON invitation_thank_you
  FOR UPDATE
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Les invités peuvent ajouter des remerciements"
  ON invitation_thank_you
  FOR INSERT
  TO public
  WITH CHECK (is_public = true);

-- Optimisation des politiques pour la table invitation_rsvp_questions
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs questions RSVP" ON invitation_rsvp_questions;

CREATE POLICY "Les utilisateurs peuvent gérer leurs questions RSVP"
  ON invitation_rsvp_questions
  FOR ALL
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM invitations WHERE user_id = (SELECT auth.uid())
    )
  );

-- Optimisation des politiques pour la table invitation_rsvp_answers
DROP POLICY IF EXISTS "Les utilisateurs peuvent lire les réponses RSVP" ON invitation_rsvp_answers;
DROP POLICY IF EXISTS "Les invités peuvent répondre aux questions RSVP" ON invitation_rsvp_answers;

CREATE POLICY "Les utilisateurs peuvent lire les réponses RSVP"
  ON invitation_rsvp_answers
  FOR SELECT
  TO authenticated
  USING (
    question_id IN (
      SELECT q.id FROM invitation_rsvp_questions q
      JOIN invitations i ON q.invitation_id = i.id
      WHERE i.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Les invités peuvent répondre aux questions RSVP"
  ON invitation_rsvp_answers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Consolidation des politiques pour les tables avec des politiques multiples
-- template_categories
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les catégories" ON template_categories;
DROP POLICY IF EXISTS "Tous peuvent lire les catégories de modèles" ON template_categories;

CREATE POLICY "Tous peuvent lire les catégories de modèles"
  ON template_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les catégories"
  ON template_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- invitation_templates
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les modèles" ON invitation_templates;
DROP POLICY IF EXISTS "Tous peuvent lire les modèles actifs" ON invitation_templates;

CREATE POLICY "Tous peuvent lire les modèles actifs"
  ON invitation_templates
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les modèles"
  ON invitation_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- template_images
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les images des modèles" ON template_images;
DROP POLICY IF EXISTS "Tous peuvent lire les images des modèles" ON template_images;

CREATE POLICY "Tous peuvent lire les images des modèles"
  ON template_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les images des modèles"
  ON template_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- roles
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON roles;
DROP POLICY IF EXISTS "Allow public read of non-system roles" ON roles;
DROP POLICY IF EXISTS "Allow admin to manage roles" ON roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON roles;

CREATE POLICY "Allow authenticated users to read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read of non-system roles"
  ON roles
  FOR SELECT
  TO public
  USING (is_system = false OR is_system IS NULL);

CREATE POLICY "Allow admin to manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- permissions
DROP POLICY IF EXISTS "Allow admin to manage permissions" ON permissions;
DROP POLICY IF EXISTS "Allow read access to permissions" ON permissions;

CREATE POLICY "Allow read access to permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- role_permissions
DROP POLICY IF EXISTS "Allow admin to manage role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Allow read access to role permissions" ON role_permissions;

CREATE POLICY "Allow read access to role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid())
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );