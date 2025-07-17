/*
  # Insertion des modèles d'invitation magnifiques et professionnels
  
  Ce fichier insère :
  1. Les catégories de modèles (Classique, Moderne, Nature, Luxe)
  2. 12 modèles d'invitation professionnels (4 gratuits + 8 premium)
  
  Architecture :
  - 4 modèles gratuits pour attirer les utilisateurs
  - 8 modèles premium pour encourager les abonnements
  - Palettes de couleurs harmonieuses
  - Typographies soigneusement sélectionnées
  - Images haute qualité d'Unsplash
*/

-- Insertion des catégories de modèles
INSERT INTO template_categories (id, name, slug, description, icon, display_order, is_active) VALUES
  (gen_random_uuid(), 'Classique', 'classic', 'Designs intemporels et élégants', 'Crown', 1, true),
  (gen_random_uuid(), 'Moderne', 'modern', 'Designs contemporains et minimalistes', 'Zap', 2, true),
  (gen_random_uuid(), 'Nature', 'nature', 'Inspirés par la nature et les éléments organiques', 'Leaf', 3, true),
  (gen_random_uuid(), 'Luxe', 'luxury', 'Designs premium avec finitions luxueuses et éléments sophistiqués', 'Diamond', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Variables pour stocker les IDs des catégories
DO $$
DECLARE
  classic_category_id uuid;
  modern_category_id uuid;
  nature_category_id uuid;
  luxury_category_id uuid;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO classic_category_id FROM template_categories WHERE slug = 'classic';
  SELECT id INTO modern_category_id FROM template_categories WHERE slug = 'modern';
  SELECT id INTO nature_category_id FROM template_categories WHERE slug = 'nature';
  SELECT id INTO luxury_category_id FROM template_categories WHERE slug = 'luxury';

  -- Insertion des modèles d'invitation
  
  -- ========================================
  -- MODÈLES GRATUITS (4 templates)
  -- ========================================
  
  -- 1. Élégance Dorée (Gratuit - Classique)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Élégance Dorée',
    'elegance-doree',
    'Design intemporel avec touches dorées et élégance raffinée',
    classic_category_id,
    false,
    true,
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#D4A5A5", "secondary": "#F5E6D3", "accent": "#E8B86D"}',
    '{"heading": "Playfair Display", "body": "Inter"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "fade", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 2. Minimaliste Chic (Gratuit - Moderne)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Minimaliste Chic',
    'minimaliste-chic',
    'Simplicité raffinée et design contemporain épuré',
    modern_category_id,
    false,
    true,
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#2C3E50", "secondary": "#ECF0F1", "accent": "#3498DB"}',
    '{"heading": "Raleway", "body": "Raleway"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "horizontal", "animation": "slide", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 3. Bohème Naturel (Gratuit - Nature)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Bohème Naturel',
    'boheme-naturel',
    'Inspiration naturelle avec touches bohèmes et organiques',
    nature_category_id,
    false,
    true,
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#8B7355", "secondary": "#F4F1E8", "accent": "#A0522D"}',
    '{"heading": "Libre Baskerville", "body": "Open Sans"}',
    '{"layouts": ["vertical"]}',
    '{"layout": "vertical", "animation": "fade", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 4. Simplicité Pure (Gratuit - Moderne)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Simplicité Pure',
    'simplicite-pure',
    'Design ultra-minimaliste pour un mariage moderne et épuré',
    modern_category_id,
    false,
    true,
    'https://images.unsplash.com/photo-1544531586-fbd96ceaff1c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544531586-fbd96ceaff1c?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#34495E", "secondary": "#FFFFFF", "accent": "#E74C3C"}',
    '{"heading": "Poppins", "body": "Poppins"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "none", "showRSVP": false}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- ========================================
  -- MODÈLES PREMIUM (8 templates)
  -- ========================================

  -- 5. Jardin Secret Premium (Premium - Nature)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Jardin Secret Premium',
    'jardin-secret-premium',
    'Motifs floraux délicats avec animations sophistiquées et éléments interactifs',
    nature_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#2E8B57", "secondary": "#F0FFF0", "accent": "#228B22"}',
    '{"heading": "Cormorant Garamond", "body": "Montserrat"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "slide", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 6. Romance Vintage Luxe (Premium - Classique)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Romance Vintage Luxe',
    'romance-vintage-luxe',
    'Charme rétro avec ornements dorés et typographie élégante',
    classic_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#8B4513", "secondary": "#FDF5E6", "accent": "#DAA520"}',
    '{"heading": "Dancing Script", "body": "Crimson Pro"}',
    '{"layouts": ["vertical"]}',
    '{"layout": "vertical", "animation": "zoom", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 7. Majesté Royale (Premium - Luxe)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Majesté Royale',
    'majeste-royale',
    'Design luxueux avec dorures, motifs baroques et finitions premium',
    luxury_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#4B0082", "secondary": "#F8F8FF", "accent": "#FFD700"}',
    '{"heading": "Cinzel", "body": "Lato"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "fade", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 8. Océan Mystique (Premium - Nature)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Océan Mystique',
    'ocean-mystique',
    'Inspiré par les profondeurs marines avec effets aquatiques animés',
    nature_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#008B8B", "secondary": "#F0FFFF", "accent": "#20B2AA"}',
    '{"heading": "Merriweather", "body": "Merriweather Sans"}',
    '{"layouts": ["vertical"]}',
    '{"layout": "vertical", "animation": "slide", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 9. Art Déco Prestige (Premium - Classique)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Art Déco Prestige',
    'art-deco-prestige',
    'Style Art Déco avec géométries sophistiquées et métaux précieux',
    classic_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#2F4F4F", "secondary": "#F5F5DC", "accent": "#B8860B"}',
    '{"heading": "Bodoni Moda", "body": "Karla"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "horizontal", "animation": "zoom", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 10. Constellation Étoilée (Premium - Moderne)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Constellation Étoilée',
    'constellation-etoilee',
    'Design cosmique avec animations d''étoiles et effets de particules',
    modern_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#191970", "secondary": "#F8F8FF", "accent": "#FFD700"}',
    '{"heading": "Josefin Sans", "body": "Josefin Sans"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "fade", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 11. Jardin Japonais Zen (Premium - Nature)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Jardin Japonais Zen',
    'jardin-japonais-zen',
    'Sérénité japonaise avec bambous, cerisiers et calligraphie zen',
    nature_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#556B2F", "secondary": "#F5F5DC", "accent": "#DC143C"}',
    '{"heading": "Great Vibes", "body": "Lato"}',
    '{"layouts": ["vertical"]}',
    '{"layout": "vertical", "animation": "slide", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

  -- 12. Cristal de Bohème (Premium - Luxe)
  INSERT INTO invitation_templates (
    id, name, slug, description, category_id, is_premium, is_active,
    preview_image_url, thumbnail_url,
    color_palette, font_pairs, layout_options, default_settings
  ) VALUES (
    gen_random_uuid(),
    'Cristal de Bohème',
    'cristal-de-boheme',
    'Luxe bohème avec cristaux, plumes et textures précieuses',
    luxury_category_id,
    true,
    true,
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80',
    '{"primary": "#8B008B", "secondary": "#FFF8DC", "accent": "#FF69B4"}',
    '{"heading": "Tangerine", "body": "Montserrat"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": "zoom", "showRSVP": true}'
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image_url = EXCLUDED.preview_image_url,
    updated_at = now();

END $$;

-- Commentaire de fin
COMMENT ON TABLE template_categories IS 'Catégories de modèles d''invitation (Classique, Moderne, Nature, Luxe)';
COMMENT ON TABLE invitation_templates IS 'Collection de 12 modèles d''invitation professionnels (4 gratuits + 8 premium)';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée avec succès !';
  RAISE NOTICE '✅ 4 catégories de modèles créées';
  RAISE NOTICE '✅ 4 modèles gratuits ajoutés';
  RAISE NOTICE '✅ 8 modèles premium ajoutés';
  RAISE NOTICE '🎨 Collection complète de templates magnifiques disponible !';
END $$;