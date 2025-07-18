/*
  # Données de base et configuration initiale
  
  Insertion des données essentielles pour le fonctionnement du système :
  - Catégories de templates
  - Templates de base
  - Configuration système
*/

-- =====================================================
-- DONNÉES DE BASE - CATÉGORIES DE TEMPLATES
-- =====================================================

INSERT INTO template_categories (name, slug, description, icon, display_order) VALUES
  ('Classique', 'classic', 'Templates élégants et intemporels', 'crown', 1),
  ('Moderne', 'modern', 'Designs contemporains et épurés', 'sparkles', 2),
  ('Romantique', 'romantic', 'Templates doux et romantiques', 'heart', 3),
  ('Bohème', 'bohemian', 'Style libre et naturel', 'flower', 4),
  ('Minimaliste', 'minimal', 'Designs simples et raffinés', 'circle', 5),
  ('Vintage', 'vintage', 'Charme rétro et nostalgique', 'camera', 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DONNÉES DE BASE - TEMPLATES D'INVITATION
-- =====================================================

INSERT INTO invitation_templates (name, slug, description, category_id, is_premium, preview_image_url, design_config) VALUES
  (
    'Élégance Dorée',
    'elegance-doree',
    'Template classique avec ornements dorés',
    (SELECT id FROM template_categories WHERE slug = 'classic'),
    false,
    '/templates/elegance-doree-preview.jpg',
    '{
      "colors": {"primary": "#D4AF37", "secondary": "#FFFFFF", "accent": "#F5F5DC"},
      "fonts": {"heading": "Playfair Display", "body": "Lato"},
      "layout": "centered"
    }'
  ),
  (
    'Simplicité Pure',
    'simplicite-pure',
    'Design minimaliste et épuré',
    (SELECT id FROM template_categories WHERE slug = 'minimal'),
    false,
    '/templates/simplicite-pure-preview.jpg',
    '{
      "colors": {"primary": "#2C3E50", "secondary": "#FFFFFF", "accent": "#ECF0F1"},
      "fonts": {"heading": "Montserrat", "body": "Open Sans"},
      "layout": "minimal"
    }'
  ),
  (
    'Jardin Secret',
    'jardin-secret',
    'Template romantique avec motifs floraux',
    (SELECT id FROM template_categories WHERE slug = 'romantic'),
    true,
    '/templates/jardin-secret-preview.jpg',
    '{
      "colors": {"primary": "#E8B4CB", "secondary": "#FFFFFF", "accent": "#F7E7CE"},
      "fonts": {"heading": "Dancing Script", "body": "Crimson Text"},
      "layout": "floral"
    }'
  ),
  (
    'Modernité Urbaine',
    'modernite-urbaine',
    'Design contemporain et géométrique',
    (SELECT id FROM template_categories WHERE slug = 'modern'),
    true,
    '/templates/modernite-urbaine-preview.jpg',
    '{
      "colors": {"primary": "#34495E", "secondary": "#FFFFFF", "accent": "#3498DB"},
      "fonts": {"heading": "Roboto", "body": "Source Sans Pro"},
      "layout": "geometric"
    }'
  ),
  (
    'Esprit Bohème',
    'esprit-boheme',
    'Style libre avec éléments naturels',
    (SELECT id FROM template_categories WHERE slug = 'bohemian'),
    false,
    '/templates/esprit-boheme-preview.jpg',
    '{
      "colors": {"primary": "#8B4513", "secondary": "#F5DEB3", "accent": "#DEB887"},
      "fonts": {"heading": "Amatic SC", "body": "Nunito"},
      "layout": "organic"
    }'
  ),
  (
    'Charme Vintage',
    'charme-vintage',
    'Nostalgie et élégance d''antan',
    (SELECT id FROM template_categories WHERE slug = 'vintage'),
    true,
    '/templates/charme-vintage-preview.jpg',
    '{
      "colors": {"primary": "#8B0000", "secondary": "#F5F5DC", "accent": "#CD853F"},
      "fonts": {"heading": "Abril Fatface", "body": "Libre Baskerville"},
      "layout": "vintage"
    }'
  )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FONCTIONS UTILITAIRES MÉTIER
-- =====================================================

-- Fonction pour créer un événement avec invitation par défaut
CREATE OR REPLACE FUNCTION create_event_with_invitation(
  p_title TEXT,
  p_event_date DATE,
  p_venue_name TEXT DEFAULT NULL,
  p_template_slug TEXT DEFAULT 'simplicite-pure'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_invitation_id UUID;
  v_template_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est connecté
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Créer l'événement
  INSERT INTO events (owner_id, title, event_date, venue_name)
  VALUES (auth.uid(), p_title, p_event_date, p_venue_name)
  RETURNING id INTO v_event_id;
  
  -- Récupérer l'ID du template
  SELECT id INTO v_template_id 
  FROM invitation_templates 
  WHERE slug = p_template_slug AND is_active = true;
  
  -- Créer l'invitation par défaut
  INSERT INTO invitations (event_id, template_id, title)
  VALUES (v_event_id, v_template_id, p_title)
  RETURNING id INTO v_invitation_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un invité avec token d'accès
CREATE OR REPLACE FUNCTION add_guest_to_invitation(
  p_invitation_id UUID,
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_plus_one_allowed BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_guest_id UUID;
  v_access_token TEXT;
BEGIN
  -- Vérifier les permissions sur l'invitation
  IF NOT has_event_permission(
    (SELECT event_id FROM invitations WHERE id = p_invitation_id),
    'write'
  ) THEN
    RAISE EXCEPTION 'Permission insuffisante pour ajouter des invités';
  END IF;
  
  -- Générer un token d'accès unique
  v_access_token := generate_secure_token(32);
  
  -- Créer l'invité
  INSERT INTO guests (
    invitation_id, 
    name, 
    email, 
    phone, 
    plus_one_allowed,
    access_token
  )
  VALUES (
    p_invitation_id, 
    p_name, 
    p_email, 
    p_phone, 
    p_plus_one_allowed,
    v_access_token
  )
  RETURNING id INTO v_guest_id;
  
  RETURN v_guest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le statut RSVP d'un invité
CREATE OR REPLACE FUNCTION update_guest_rsvp(
  p_access_token TEXT,
  p_status rsvp_status_type,
  p_response_message TEXT DEFAULT NULL,
  p_dietary_restrictions TEXT DEFAULT NULL,
  p_plus_one_name TEXT DEFAULT NULL,
  p_plus_one_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_guest_id UUID;
BEGIN
  -- Vérifier le token et récupérer l'ID de l'invité
  SELECT id INTO v_guest_id
  FROM guests
  WHERE access_token = p_access_token
    AND access_expires_at > CURRENT_TIMESTAMP;
  
  IF v_guest_id IS NULL THEN
    RAISE EXCEPTION 'Token d''accès invalide ou expiré';
  END IF;
  
  -- Mettre à jour les informations de l'invité
  UPDATE guests SET
    status = p_status,
    response_message = p_response_message,
    dietary_restrictions = p_dietary_restrictions,
    plus_one_name = p_plus_one_name,
    plus_one_email = p_plus_one_email,
    responded_at = CURRENT_TIMESTAMP
  WHERE id = v_guest_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques d'un événement
CREATE OR REPLACE FUNCTION get_event_stats(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  -- Vérifier les permissions
  IF NOT has_event_permission(p_event_id, 'read') THEN
    RAISE EXCEPTION 'Permission insuffisante pour consulter les statistiques';
  END IF;
  
  SELECT json_build_object(
    'total_invitations', COUNT(DISTINCT i.id),
    'total_guests', COUNT(DISTINCT g.id),
    'confirmed_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'confirmed'),
    'declined_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'declined'),
    'pending_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'pending'),
    'maybe_guests', COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'maybe'),
    'plus_ones', COUNT(DISTINCT g.id) FILTER (WHERE g.plus_one_name IS NOT NULL),
    'response_rate', ROUND(
      (COUNT(DISTINCT g.id) FILTER (WHERE g.status != 'pending')::DECIMAL / 
       NULLIF(COUNT(DISTINCT g.id), 0)) * 100, 2
    )
  ) INTO v_stats
  FROM events e
  LEFT JOIN invitations i ON e.id = i.event_id
  LEFT JOIN guests g ON i.id = g.invitation_id
  WHERE e.id = p_event_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUES UTILES POUR L'APPLICATION
-- =====================================================

-- Vue pour les événements avec statistiques
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

-- Vue pour les invitations avec détails de l'événement
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

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '🌱 Données de base insérées avec succès !';
  RAISE NOTICE '✅ ' || (SELECT COUNT(*) FROM template_categories) || ' catégories de templates';
  RAISE NOTICE '✅ ' || (SELECT COUNT(*) FROM invitation_templates) || ' templates d''invitation';
  RAISE NOTICE '✅ Fonctions utilitaires créées';
  RAISE NOTICE '✅ Vues optimisées disponibles';
END $$;