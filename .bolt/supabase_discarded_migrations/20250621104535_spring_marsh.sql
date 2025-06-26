-- First, update the invitations table to remove foreign key constraint temporarily
ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_template_id_fkey;

-- Clear existing template data (in correct order to respect foreign keys)
DELETE FROM template_images;
DELETE FROM invitation_templates;
DELETE FROM template_categories;

-- Insert template categories
INSERT INTO template_categories (id, name, slug, description, icon, display_order, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Classique', 'classique', 'Designs intemporels et élégants', 'Crown', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Moderne', 'moderne', 'Designs contemporains et minimalistes', 'Sparkles', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Nature', 'nature', 'Designs inspirés par la nature et éléments organiques', 'Leaf', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Romantique', 'romantique', 'Designs romantiques et poétiques', 'Heart', 4, true);

-- Insert invitation templates (3 free, 10 premium)
INSERT INTO invitation_templates (id, name, slug, description, category_id, is_premium, is_active, preview_image_url, thumbnail_url, color_palette, font_pairs, layout_options, default_settings)
VALUES
  -- FREE TEMPLATES
  (
    '55555555-5555-5555-5555-555555555555',
    'Élégance Dorée',
    'elegance-doree',
    'Design intemporel avec touches dorées et typographie raffinée. Parfait pour un mariage classique et sophistiqué.',
    '11111111-1111-1111-1111-111111111111', -- Classique
    false, -- Free
    true,
    'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#D4A5A5", "secondary": "#F5E6D3", "accent": "#E8B86D", "textColor": "#131837"}',
    '{"heading": "Playfair Display", "body": "Lato"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "classic", "backgroundPattern": "subtle-dots"}, "details": {"style": "classic"}, "rsvp": {"style": "classic"}}}'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Minimaliste Chic',
    'minimaliste-chic',
    'Design épuré aux lignes modernes et à la typographie minimaliste. Idéal pour un mariage contemporain et élégant.',
    '22222222-2222-2222-2222-222222222222', -- Moderne
    false, -- Free
    true,
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#131837", "secondary": "#F8F9FA", "accent": "#6C757D", "textColor": "#131837"}',
    '{"heading": "Montserrat", "body": "Open Sans"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "slide"}, "spacing": "spacious", "sections": {"hero": {"style": "modern", "backgroundPattern": "elegant-grid"}, "details": {"style": "modern"}, "rsvp": {"style": "modern"}}}'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Aquarelle Bleue',
    'aquarelle-bleue',
    'Design frais et apaisant avec des touches d''aquarelle et des tons bleutés. Parfait pour un mariage en bord de mer ou au printemps.',
    '11111111-1111-1111-1111-111111111111', -- Classique
    false, -- Free
    true,
    'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#4A6D8C", "secondary": "#E8F1F5", "accent": "#91C4F2", "textColor": "#2D3E4F"}',
    '{"heading": "Playfair Display", "body": "Source Sans Pro"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "classic", "backgroundPattern": "waves-pattern"}, "details": {"style": "classic"}, "rsvp": {"style": "classic"}}}'
  ),

  -- PREMIUM TEMPLATES
  (
    '66666666-6666-6666-6666-666666666666',
    'Jardin Secret',
    'jardin-secret',
    'Design luxuriant avec motifs floraux délicats et verdure. Idéal pour un mariage en plein air ou sur le thème de la nature.',
    '33333333-3333-3333-3333-333333333333', -- Nature
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#C5D2C2", "secondary": "#E8F5E8", "accent": "#7FB069", "textColor": "#3C4A44"}',
    '{"heading": "Cormorant Garamond", "body": "Montserrat"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "slide"}, "spacing": "normal", "sections": {"hero": {"style": "rustic", "backgroundPattern": "floral-pattern"}, "details": {"style": "rustic"}, "rsvp": {"style": "rustic"}}}'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Romance Vintage',
    'romance-vintage',
    'Design romantique aux teintes chaudes et à la typographie élégante. Parfait pour un mariage vintage ou rétro.',
    '44444444-4444-4444-4444-444444444444', -- Romantique
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#E16939", "secondary": "#FDF2E9", "accent": "#D4A574", "textColor": "#3D3B3C"}',
    '{"heading": "Dancing Script", "body": "Raleway"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "romantic", "backgroundPattern": "hearts-pattern"}, "details": {"style": "romantic"}, "rsvp": {"style": "romantic"}}}'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Bohème Rustique',
    'boheme-rustique',
    'Design bohème avec touches rustiques et palette terreuse. Idéal pour un mariage champêtre ou festival.',
    '33333333-3333-3333-3333-333333333333', -- Nature
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#A67C52", "secondary": "#F8F4E3", "accent": "#D4B483", "textColor": "#3C2F2F"}',
    '{"heading": "Petit Formal Script", "body": "Raleway"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "slide"}, "spacing": "normal", "sections": {"hero": {"style": "rustic", "backgroundPattern": "bamboo-pattern"}, "details": {"style": "rustic"}, "rsvp": {"style": "rustic"}}}'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Géométrique Moderne',
    'geometrique-moderne',
    'Design audacieux avec formes géométriques et lignes épurées. Parfait pour un mariage urbain ou industriel.',
    '22222222-2222-2222-2222-222222222222', -- Moderne
    true, -- Premium
    true,
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#2D3142", "secondary": "#FFFFFF", "accent": "#EF8354", "textColor": "#2D3142"}',
    '{"heading": "Raleway", "body": "Raleway"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "zoom"}, "spacing": "compact", "sections": {"hero": {"style": "modern", "backgroundPattern": "circuit-pattern"}, "details": {"style": "modern"}, "rsvp": {"style": "modern"}}}'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Rêve Pastel',
    'reve-pastel',
    'Design doux aux couleurs pastel et à la typographie légère. Idéal pour un mariage printanier ou romantique.',
    '44444444-4444-4444-4444-444444444444', -- Romantique
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#F8C8DC", "secondary": "#F4F9F9", "accent": "#98D4BB", "textColor": "#3A3042"}',
    '{"heading": "Great Vibes", "body": "Montserrat"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "romantic", "backgroundPattern": "bubbles-pattern"}, "details": {"style": "romantic"}, "rsvp": {"style": "romantic"}}}'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Élégance Marbrée',
    'elegance-marbree',
    'Design sophistiqué avec textures de marbre et accents dorés. Parfait pour un mariage luxueux et élégant.',
    '11111111-1111-1111-1111-111111111111', -- Classique
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#B28B5D", "secondary": "#F5F1E9", "accent": "#7D5A3C", "textColor": "#2F2F2F"}',
    '{"heading": "Bodoni Moda", "body": "Karla"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "classic", "backgroundPattern": "marble-subtle"}, "details": {"style": "classic"}, "rsvp": {"style": "classic"}}}'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Céleste Étoilé',
    'celeste-etoile',
    'Design enchanteur avec motifs célestes et palette nocturne. Idéal pour un mariage en soirée ou sur le thème des étoiles.',
    '22222222-2222-2222-2222-222222222222', -- Moderne
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1694000/pexels-photo-1694000.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1694000/pexels-photo-1694000.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#7B9EA8", "secondary": "#EDF6F9", "accent": "#F9C784", "textColor": "#2F3E46"}',
    '{"heading": "Cinzel", "body": "Lato"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "modern", "backgroundPattern": "overlapping-circles"}, "details": {"style": "modern"}, "rsvp": {"style": "modern"}}}'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Lavande & Olivier',
    'lavande-olivier',
    'Design méditerranéen avec palette inspirée de la Provence. Parfait pour un mariage champêtre ou en plein air.',
    '33333333-3333-3333-3333-333333333333', -- Nature
    true, -- Premium
    true,
    'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#9D8EC7", "secondary": "#F5F1FF", "accent": "#D4AF37", "textColor": "#3A3042"}',
    '{"heading": "Lora", "body": "Source Sans Pro"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "slide"}, "spacing": "normal", "sections": {"hero": {"style": "rustic", "backgroundPattern": "leaves-pattern"}, "details": {"style": "rustic"}, "rsvp": {"style": "rustic"}}}'
  ),
  (
    'gggggggg-gggg-gggg-gggg-gggggggggggg',
    'Art Déco Doré',
    'art-deco-dore',
    'Design inspiré des années 20 avec motifs géométriques et accents dorés. Idéal pour un mariage glamour et sophistiqué.',
    '11111111-1111-1111-1111-111111111111', -- Classique
    true, -- Premium
    true,
    'https://images.pexels.com/photos/3094341/pexels-photo-3094341.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3094341/pexels-photo-3094341.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#D4AF37", "secondary": "#F5F5F5", "accent": "#000000", "textColor": "#1A1A1A"}',
    '{"heading": "Bodoni Moda", "body": "Poppins"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "classic", "backgroundPattern": "geometric-elegant"}, "details": {"style": "classic"}, "rsvp": {"style": "classic"}}}'
  ),
  (
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
    'Tropical Élégant',
    'tropical-elegant',
    'Design exotique avec motifs tropicaux et palette vibrante. Parfait pour un mariage destination ou sur le thème de la plage.',
    '33333333-3333-3333-3333-333333333333', -- Nature
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#26A69A", "secondary": "#E0F2F1", "accent": "#FF8A65", "textColor": "#004D40"}',
    '{"heading": "Playfair Display", "body": "Raleway"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "slide"}, "spacing": "normal", "sections": {"hero": {"style": "rustic", "backgroundPattern": "palm-leaves"}, "details": {"style": "rustic"}, "rsvp": {"style": "rustic"}}}'
  ),
  (
    'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
    'Calligraphie Moderne',
    'calligraphie-moderne',
    'Design minimaliste avec typographie calligraphique et mise en page aérée. Idéal pour un mariage contemporain et élégant.',
    '22222222-2222-2222-2222-222222222222', -- Moderne
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#5C6BC0", "secondary": "#E8EAF6", "accent": "#EC407A", "textColor": "#263238"}',
    '{"heading": "Alex Brush", "body": "Montserrat"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "spacious", "sections": {"hero": {"style": "modern", "backgroundPattern": "subtle-dots"}, "details": {"style": "modern"}, "rsvp": {"style": "modern"}}}'
  ),
  (
    'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
    'Aquarelle Florale',
    'aquarelle-florale',
    'Design délicat avec illustrations florales à l''aquarelle et palette douce. Parfait pour un mariage printanier ou champêtre.',
    '44444444-4444-4444-4444-444444444444', -- Romantique
    true, -- Premium
    true,
    'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#D8A7B1", "secondary": "#F7EEF2", "accent": "#90323D", "textColor": "#3D3B3C"}',
    '{"heading": "Great Vibes", "body": "Lato"}',
    '{"layouts": ["vertical", "horizontal"]}',
    '{"layout": "vertical", "animation": {"enabled": true, "type": "fade"}, "spacing": "normal", "sections": {"hero": {"style": "romantic", "backgroundPattern": "floral-elegant"}, "details": {"style": "romantic"}, "rsvp": {"style": "romantic"}}}'
  );

-- Insert template images for each template
INSERT INTO template_images (id, template_id, image_url, image_type, display_order)
VALUES
  -- Élégance Dorée (Free)
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/265730/pexels-photo-265730.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Minimaliste Chic (Free)
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '77777777-7777-7777-7777-777777777777', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d5d5d5d5-d5d5-d5d5-d5d5-d5d5d5d5d5d5', '77777777-7777-7777-7777-777777777777', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d6d6d6d6-d6d6-d6d6-d6d6-d6d6d6d6d6d6', '77777777-7777-7777-7777-777777777777', 'https://images.pexels.com/photos/1420709/pexels-photo-1420709.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Aquarelle Bleue (Free)
  ('d7d7d7d7-d7d7-d7d7-d7d7-d7d7d7d7d7d7', '99999999-9999-9999-9999-999999999999', 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d8d8d8d8-d8d8-d8d8-d8d8-d8d8d8d8d8d8', '99999999-9999-9999-9999-999999999999', 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d9d9d9d9-d9d9-d9d9-d9d9-d9d9d9d9d9d9', '99999999-9999-9999-9999-999999999999', 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Jardin Secret (Premium)
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', '66666666-6666-6666-6666-666666666666', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', '66666666-6666-6666-6666-666666666666', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', '66666666-6666-6666-6666-666666666666', 'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Romance Vintage (Premium)
  ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', '88888888-8888-8888-8888-888888888888', 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '88888888-8888-8888-8888-888888888888', 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6', '88888888-8888-8888-8888-888888888888', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Bohème Rustique (Premium)
  ('e7e7e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Géométrique Moderne (Premium)
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.pexels.com/photos/3094341/pexels-photo-3094341.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Rêve Pastel (Premium)
  ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Élégance Marbrée (Premium)
  ('f7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('f9f9f9f9-f9f9-f9f9-f9f9-f9f9f9f9f9f9', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.pexels.com/photos/2341290/pexels-photo-2341290.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Céleste Étoilé (Premium)
  ('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.pexels.com/photos/1694000/pexels-photo-1694000.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.pexels.com/photos/1694000/pexels-photo-1694000.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('g3g3g3g3-g3g3-g3g3-g3g3-g3g3g3g3g3g3', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Lavande & Olivier (Premium)
  ('g4g4g4g4-g4g4-g4g4-g4g4-g4g4g4g4g4g4', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('g5g5g5g5-g5g5-g5g5-g5g5-g5g5g5g5g5g5', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('g6g6g6g6-g6g6-g6g6-g6g6-g6g6g6g6g6g6', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Art Déco Doré (Premium)
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'https://images.pexels.com/photos/3094341/pexels-photo-3094341.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('g8g8g8g8-g8g8-g8g8-g8g8-g8g8g8g8g8g8', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'https://images.pexels.com/photos/3094341/pexels-photo-3094341.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('g9g9g9g9-g9g9-g9g9-g9g9-g9g9g9g9g9g9', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Tropical Élégant (Premium)
  ('h1h1h1h1-h1h1-h1h1-h1h1-h1h1h1h1h1h1', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('h2h2h2h2-h2h2-h2h2-h2h2-h2h2h2h2h2h2', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('h3h3h3h3-h3h3-h3h3-h3h3-h3h3h3h3h3h3', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Calligraphie Moderne (Premium)
  ('h4h4h4h4-h4h4-h4h4-h4h4-h4h4h4h4h4h4', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('h5h5h5h5-h5h5-h5h5-h5h5-h5h5h5h5h5h5', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('h6h6h6h6-h6h6-h6h6-h6h6-h6h6h6h6h6h6', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'https://images.pexels.com/photos/1910236/pexels-photo-1910236.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3),
  
  -- Aquarelle Florale (Premium)
  ('h7h7h7h7-h7h7-h7h7-h7h7-h7h7h7h7h7h7', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('h9h9h9h9-h9h9-h9h9-h9h9-h9h9h9h9h9h9', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800', 'detail', 3);

-- Add additional background patterns for templates
INSERT INTO template_images (id, template_id, image_url, image_type, display_order)
VALUES
  -- Additional backgrounds for premium templates
  ('i1i1i1i1-i1i1-i1i1-i1i1-i1i1i1i1i1i1', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.pexels.com/photos/4505467/pexels-photo-4505467.jpeg?auto=compress&cs=tinysrgb&w=800', 'background_alt', 4),
  ('i2i2i2i2-i2i2-i2i2-i2i2-i2i2i2i2i2i2', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?auto=compress&cs=tinysrgb&w=800', 'background_alt', 4),
  ('i3i3i3i3-i3i3-i3i3-i3i3-i3i3i3i3i3i3', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&w=800', 'background_alt', 4),
  ('i4i4i4i4-i4i4-i4i4-i4i4-i4i4i4i4i4i4', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800', 'background_alt', 4),
  ('i5i5i5i5-i5i5-i5i5-i5i5-i5i5i5i5i5i5', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=800', 'background_alt', 4);

-- Add couple photos for templates
INSERT INTO template_images (id, template_id, image_url, image_type, display_order)
VALUES
  -- Couple photos for premium templates
  ('j1j1j1j1-j1j1-j1j1-j1j1-j1j1j1j1j1j1', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800', 'couple', 5),
  ('j2j2j2j2-j2j2-j2j2-j2j2-j2j2j2j2j2j2', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'https://images.pexels.com/photos/1247756/pexels-photo-1247756.jpeg?auto=compress&cs=tinysrgb&w=800', 'couple', 5),
  ('j3j3j3j3-j3j3-j3j3-j3j3-j3j3j3j3j3j3', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg?auto=compress&cs=tinysrgb&w=800', 'couple', 5),
  ('j4j4j4j4-j4j4-j4j4-j4j4-j4j4j4j4j4j4', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'https://images.pexels.com/photos/1439261/pexels-photo-1439261.jpeg?auto=compress&cs=tinysrgb&w=800', 'couple', 5),
  ('j5j5j5j5-j5j5-j5j5-j5j5-j5j5j5j5j5j5', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800', 'couple', 5);

-- Now restore the foreign key constraint
ALTER TABLE public.invitations ADD CONSTRAINT invitations_template_id_fkey 
  FOREIGN KEY (template_id) 
  REFERENCES public.invitation_templates(id);