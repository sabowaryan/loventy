/*
  # Seed template data

  1. New Data
    - Template categories (Classique, Moderne, Nature, Romantique)
    - Invitation templates with sample data
    - Template images for the first 4 templates
  
  2. Purpose
    - Provide initial data for the templates page
    - Allow users to browse and select templates
*/

-- Insert template categories if they don't exist
INSERT INTO template_categories (id, name, slug, description, icon, display_order, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Classique', 'classique', 'Designs intemporels et élégants', 'Crown', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Moderne', 'moderne', 'Designs contemporains et minimalistes', 'Sparkles', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Nature', 'nature', 'Designs inspirés par la nature', 'Leaf', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Romantique', 'romantique', 'Designs romantiques et poétiques', 'Heart', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert invitation templates
INSERT INTO invitation_templates (id, name, slug, description, category_id, is_premium, is_active, preview_image_url, thumbnail_url, color_palette, font_pairs, layout_options, default_settings)
VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'Élégance Dorée',
    'elegance-doree',
    'Design intemporel avec touches dorées',
    '11111111-1111-1111-1111-111111111111',
    false,
    true,
    'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#D4A5A5", "secondary": "#F5E6D3", "accent": "#E8B86D"}',
    '{"heading": "Playfair Display", "body": "Lato"}',
    '{"layouts": ["centered", "split"]}',
    '{"layout": "centered", "animation": "fade", "showRSVP": true}'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Jardin Secret',
    'jardin-secret',
    'Motifs floraux délicats et verdure',
    '33333333-3333-3333-3333-333333333333',
    true,
    true,
    'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#C5D2C2", "secondary": "#E8F5E8", "accent": "#7FB069"}',
    '{"heading": "Cormorant Garamond", "body": "Montserrat"}',
    '{"layouts": ["centered", "split", "asymmetric"]}',
    '{"layout": "centered", "animation": "slide", "showRSVP": true}'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Minimaliste Chic',
    'minimaliste-chic',
    'Simplicité raffinée et moderne',
    '22222222-2222-2222-2222-222222222222',
    false,
    true,
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#131837", "secondary": "#F8F9FA", "accent": "#6C757D"}',
    '{"heading": "Montserrat", "body": "Open Sans"}',
    '{"layouts": ["centered", "grid"]}',
    '{"layout": "centered", "animation": "none", "showRSVP": true}'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Romance Vintage',
    'romance-vintage',
    'Charme rétro et romantique',
    '44444444-4444-4444-4444-444444444444',
    true,
    true,
    'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#E16939", "secondary": "#FDF2E9", "accent": "#D4A574"}',
    '{"heading": "Dancing Script", "body": "Raleway"}',
    '{"layouts": ["centered", "split", "stacked"]}',
    '{"layout": "centered", "animation": "fade", "showRSVP": true}'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Aquarelle Bleue',
    'aquarelle-bleue',
    E'Touches d\'aquarelle et tons bleutés',
    '11111111-1111-1111-1111-111111111111',
    false,
    true,
    'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#4A6D8C", "secondary": "#E8F1F5", "accent": "#91C4F2"}',
    '{"heading": "Playfair Display", "body": "Source Sans Pro"}',
    '{"layouts": ["centered", "watercolor"]}',
    '{"layout": "centered", "animation": "fade", "showRSVP": true}'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Bohème Rustique',
    'boheme-rustique',
    'Style bohème avec touches rustiques',
    '33333333-3333-3333-3333-333333333333',
    true,
    true,
    'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#A67C52", "secondary": "#F8F4E3", "accent": "#D4B483"}',
    '{"heading": "Amatic SC", "body": "Poppins"}',
    '{"layouts": ["centered", "rustic"]}',
    '{"layout": "centered", "animation": "slide", "showRSVP": true}'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Géométrique Moderne',
    'geometrique-moderne',
    'Formes géométriques et design épuré',
    '22222222-2222-2222-2222-222222222222',
    false,
    true,
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#2D3142", "secondary": "#FFFFFF", "accent": "#EF8354"}',
    '{"heading": "Roboto", "body": "Roboto"}',
    '{"layouts": ["grid", "geometric"]}',
    '{"layout": "grid", "animation": "none", "showRSVP": true}'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Rêve Pastel',
    'reve-pastel',
    'Couleurs pastel douces et romantiques',
    '44444444-4444-4444-4444-444444444444',
    true,
    true,
    'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1684149/pexels-photo-1684149.jpeg?auto=compress&cs=tinysrgb&w=300',
    '{"primary": "#F8C8DC", "secondary": "#F4F9F9", "accent": "#98D4BB"}',
    '{"heading": "Great Vibes", "body": "Quicksand"}',
    '{"layouts": ["centered", "pastel"]}',
    '{"layout": "centered", "animation": "fade", "showRSVP": true}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert template images
INSERT INTO template_images (id, template_id, image_url, image_type, display_order)
VALUES
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', '66666666-6666-6666-6666-666666666666', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '66666666-6666-6666-6666-666666666666', 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d5d5d5d5-d5d5-d5d5-d5d5-d5d5d5d5d5d5', '77777777-7777-7777-7777-777777777777', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d6d6d6d6-d6d6-d6d6-d6d6-d6d6d6d6d6d6', '77777777-7777-7777-7777-777777777777', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2),
  ('d7d7d7d7-d7d7-d7d7-d7d7-d7d7d7d7d7d7', '88888888-8888-8888-8888-888888888888', 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800', 'preview', 1),
  ('d8d8d8d8-d8d8-d8d8-d8d8-d8d8d8d8d8d8', '88888888-8888-8888-8888-888888888888', 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=800&h=600', 'background', 2)
ON CONFLICT (id) DO NOTHING;