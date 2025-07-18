-- =====================================================
-- 1. FONCTIONS UTILITAIRES, MÉTIER, AUDIT, QUOTAS, NOTIFICATIONS
-- =====================================================
-- (Inclure toutes les fonctions utiles, auth, plans, SEO, nettoyage, test, audit, quotas, gestion avancée des fichiers, notifications, etc.)

-- Fonction d'audit détaillé (historique des changements)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, created_at)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_old_values, p_new_values, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de gestion des quotas utilisateurs (événements, stockage, etc.)
CREATE OR REPLACE FUNCTION check_user_quota(
  p_user_id UUID,
  p_resource TEXT,
  p_limit INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_resource = 'events' THEN
    SELECT COUNT(*) INTO v_count FROM events WHERE owner_id = p_user_id;
  ELSIF p_resource = 'storage' THEN
    SELECT COALESCE(SUM(file_size), 0) INTO v_count FROM user_files WHERE user_id = p_user_id;
  ELSE
    RETURN TRUE;
  END IF;
  RETURN v_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de notification (log simple)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_message TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO system_alerts (user_id, message, created_at) VALUES (p_user_id, p_message, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de soft-delete générique
CREATE OR REPLACE FUNCTION soft_delete_row(
  p_table TEXT,
  p_id UUID
) RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', p_table) USING p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de synchronisation automatique (exemple : statut global)
CREATE OR REPLACE FUNCTION sync_event_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Exemple : si tous les invités ont répondu, mettre à jour le statut de l'invitation
  IF (SELECT COUNT(*) FROM guests WHERE invitation_id = NEW.id AND status = 'pending') = 0 THEN
    UPDATE invitations SET status = 'archived' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. TRIGGERS ROBUSTES ET AMÉLIORÉS
-- =====================================================

-- Triggers pour updated_at (toutes les tables critiques)
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitation_templates BEFORE UPDATE ON invitation_templates FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invitations BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_guests BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_files BEFORE UPDATE ON user_files FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_customers BEFORE UPDATE ON stripe_customers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stripe_subscriptions BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger d'inscription utilisateur (robuste, version corrigée)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_with_plan();

-- Trigger de soft-delete générique (exemple sur guests)
DROP TRIGGER IF EXISTS soft_delete_guests ON guests;
CREATE TRIGGER soft_delete_guests
  BEFORE DELETE ON guests
  FOR EACH ROW EXECUTE FUNCTION soft_delete_row('guests', OLD.id);

-- Trigger de synchronisation automatique (exemple sur invitations)
DROP TRIGGER IF EXISTS sync_invitation_status ON guests;
CREATE TRIGGER sync_invitation_status
  AFTER UPDATE OF status ON guests
  FOR EACH ROW EXECUTE FUNCTION sync_event_status();

-- Triggers SEO (mise à jour et validation)
CREATE TRIGGER trigger_update_seo_metadata_updated_at
    BEFORE UPDATE ON public.seo_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_metadata_updated_at();
CREATE TRIGGER trigger_validate_seo_urls
    BEFORE INSERT OR UPDATE ON public.seo_metadata
    FOR EACH ROW
    EXECUTE FUNCTION validate_seo_urls();

-- =====================================================
-- 3. SEEDS SUPPLÉMENTAIRES ET TESTS
-- =====================================================

-- Plans personnalisés supplémentaires
INSERT INTO plans (name, stripe_product_id, stripe_price_id, description, price, mode, type, limits, features, popular, color, bg_color, border_color, button_color)
VALUES
  ('Loventy-Premium+', 'prod_SUPERPREMIUM', 'price_SUPERPREMIUM', 'Plan ultra premium', 99.99, 'subscription', 'pro', '{"events":100,"guests":1000,"storage":1000}', '["Support VIP","Statistiques avancées"]', true, 'text-gold', 'bg-gold', 'border-gold', 'bg-gold')
ON CONFLICT (name) DO NOTHING;

-- Rôles avancés/support
INSERT INTO role_permissions (role, resource, action) VALUES
  ('support', 'admin_panel', 'read'),
  ('support', 'admin_panel', 'manage')
ON CONFLICT DO NOTHING;

-- Buckets spécialisés (documentation CLI)
--
-- supabase storage create-bucket wedding-gallery --public
-- supabase storage create-bucket admin-uploads --public
-- supabase storage create-bucket guestbook-media --public

-- Seeds de buckets locaux (si besoin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('wedding-gallery', 'wedding-gallery', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('admin-uploads', 'admin-uploads', false, 5242880, ARRAY['application/pdf','image/jpeg','image/png']),
  ('guestbook-media', 'guestbook-media', true, 5242880, ARRAY['image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;

-- Tests de cohérence policies RLS (exemple)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'INSERT';
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Aucune policy INSERT sur profiles';
  END IF;
END $$;

-- =====================================================
-- 4. TESTS ET VALIDATION
-- =====================================================
-- (DO $$ ... $$ pour valider la bonne création des fonctions critiques)

DO $$
BEGIN
  PERFORM generate_secure_token();
  PERFORM get_plan_limits('free');
  PERFORM check_user_quota(gen_random_uuid(), 'events', 10);
  RAISE NOTICE '✅ Fonctions critiques testées avec succès';
END $$;

-- =====================================================
-- 5. BUCKETS DE STOCKAGE SUPABASE (CLI)
-- =====================================================
-- Les buckets doivent être créés via la CLI Supabase ou l'interface Studio.
-- Exemple de buckets recommandés pour l'application :
--   - user-uploads
--   - invitation-media
--   - event-assets
--   - wedding-gallery
--   - admin-uploads
--   - guestbook-media
--
-- Pour créer ces buckets via la CLI Supabase, exécutez :
--
-- supabase storage create-bucket user-uploads --public
-- supabase storage create-bucket invitation-media --public
-- supabase storage create-bucket event-assets --public
-- supabase storage create-bucket wedding-gallery --public
-- supabase storage create-bucket admin-uploads
-- supabase storage create-bucket guestbook-media --public
--
-- Ou créez-les manuellement dans l'interface Supabase Studio > Storage > New bucket
--
-- Note : Il n'est pas possible de créer des buckets directement en SQL, car cela dépend du service Storage de Supabase.
--
-- Pensez à configurer les règles d'accès (policies) pour chaque bucket selon vos besoins de sécurité.

-- =====================================================
-- FIN DU FICHIER
-- ===================================================== 