/*
  # Vues pour les modèles d'invitation et tables connexes

  1. Vues créées
    - `template_details` - Modèles avec catégories et statistiques
    - `invitation_details` - Invitations avec statistiques d'invités
    - `table_details` - Tables avec nombre d'invités
    - `user_template_stats` - Statistiques utilisateur par modèle
    - `guest_details` - Invités avec informations étendues
    - `media_details` - Médias d'invitation avec informations sur les fichiers

  2. Sécurité
    - Permissions accordées pour les vues
*/

-- Vue des modèles avec catégories et statistiques
CREATE OR REPLACE VIEW template_details AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.description,
  t.is_premium,
  t.is_active,
  t.preview_image_url,
  t.thumbnail_url,
  t.color_palette,
  t.font_pairs,
  t.layout_options,
  t.default_settings,
  t.created_at,
  t.updated_at,
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  c.icon as category_icon,
  COUNT(DISTINCT i.id) as usage_count,
  COUNT(DISTINCT i.user_id) as unique_users
FROM invitation_templates t
LEFT JOIN template_categories c ON t.category_id = c.id
LEFT JOIN invitations i ON i.template_id = t.slug
GROUP BY t.id, t.name, t.slug, t.description, t.is_premium, t.is_active, 
         t.preview_image_url, t.thumbnail_url, t.color_palette, t.font_pairs, 
         t.layout_options, t.default_settings, t.created_at, t.updated_at,
         c.id, c.name, c.slug, c.icon;

-- Vue des invitations avec statistiques d'invités
CREATE OR REPLACE VIEW invitation_details AS
SELECT 
  i.id,
  i.user_id,
  i.title,
  i.template_id,
  t.name as template_name,
  COALESCE(t.is_premium, false) as is_premium_template,
  i.bride_name,
  i.groom_name,
  i.event_date,
  i.event_time,
  i.venue,
  i.address,
  i.message,
  i.dress_code,
  i.rsvp_deadline,
  i.status,
  i.created_at,
  i.updated_at,
  COUNT(g.id) as total_guests,
  SUM(CASE WHEN g.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_guests,
  SUM(CASE WHEN g.status = 'pending' THEN 1 ELSE 0 END) as pending_guests,
  SUM(CASE WHEN g.status = 'declined' THEN 1 ELSE 0 END) as declined_guests,
  CASE 
    WHEN COUNT(g.id) > 0 THEN 
      ROUND((SUM(CASE WHEN g.status = 'confirmed' THEN 1 ELSE 0 END)::numeric / COUNT(g.id)::numeric) * 100)
    ELSE 0
  END as confirmation_rate,
  COUNT(DISTINCT it.id) as table_count,
  COUNT(DISTINCT im.id) as media_count,
  COUNT(DISTINCT ity.id) as thank_you_count,
  COUNT(DISTINCT irq.id) as rsvp_question_count
FROM invitations i
LEFT JOIN invitation_templates t ON i.template_id = t.slug
LEFT JOIN guests g ON i.id = g.invitation_id
LEFT JOIN invitation_tables it ON i.id = it.invitation_id
LEFT JOIN invitation_media im ON i.id = im.invitation_id
LEFT JOIN invitation_thank_you ity ON i.id = ity.invitation_id
LEFT JOIN invitation_rsvp_questions irq ON i.id = irq.invitation_id
GROUP BY i.id, i.user_id, i.title, i.template_id, t.name, t.is_premium, 
         i.bride_name, i.groom_name, i.event_date, i.event_time, i.venue, 
         i.address, i.message, i.dress_code, i.rsvp_deadline, i.status, 
         i.created_at, i.updated_at;

-- Vue des tables avec nombre d'invités
CREATE OR REPLACE VIEW table_details AS
SELECT 
  it.id,
  it.invitation_id,
  i.title as invitation_title,
  it.name,
  it.description,
  it.capacity,
  it.is_vip,
  it.location_description,
  it.notes,
  it.created_at,
  it.updated_at,
  COUNT(ge.guest_id) as assigned_guests,
  GREATEST(0, it.capacity - COUNT(ge.guest_id)) as available_seats,
  SUM(CASE WHEN g.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_guests,
  SUM(CASE WHEN g.status = 'pending' THEN 1 ELSE 0 END) as pending_guests,
  SUM(CASE WHEN g.status = 'declined' THEN 1 ELSE 0 END) as declined_guests
FROM invitation_tables it
LEFT JOIN invitations i ON it.invitation_id = i.id
LEFT JOIN invitation_guests_extended ge ON it.id = ge.table_id
LEFT JOIN guests g ON ge.guest_id = g.id
GROUP BY it.id, it.invitation_id, i.title, it.name, it.description, 
         it.capacity, it.is_vip, it.location_description, it.notes,
         it.created_at, it.updated_at;

-- Vue des statistiques utilisateur par modèle
CREATE OR REPLACE VIEW user_template_stats AS
SELECT 
  u.id as user_id,
  u.email,
  t.id as template_id,
  t.name as template_name,
  t.is_premium,
  COUNT(i.id) as invitation_count,
  COUNT(DISTINCT g.id) as total_guests,
  SUM(CASE WHEN g.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_guests,
  MAX(i.created_at) as last_used_at
FROM users u
JOIN invitations i ON u.id = i.user_id
LEFT JOIN invitation_templates t ON i.template_id = t.slug
LEFT JOIN guests g ON i.id = g.invitation_id
GROUP BY u.id, u.email, t.id, t.name, t.is_premium;

-- Vue des invités avec informations étendues
CREATE OR REPLACE VIEW guest_details AS
SELECT 
  g.id,
  g.invitation_id,
  i.title as invitation_title,
  g.user_id,
  g.name,
  g.email,
  g.phone,
  g.status,
  g.response_message,
  g.responded_at,
  g.created_at,
  g.updated_at,
  ge.table_id,
  it.name as table_name,
  ge.guest_type,
  ge.dietary_restrictions,
  ge.plus_one,
  ge.plus_one_name,
  ge.plus_one_email,
  ge.plus_one_phone,
  ge.whatsapp_number,
  ge.telegram_username,
  ge.age_group,
  ge.relationship,
  ge.side,
  ge.gift_registry_contribution,
  ge.gift_description,
  ge.additional_notes,
  COUNT(ira.id) as answered_questions
FROM guests g
LEFT JOIN invitations i ON g.invitation_id = i.id
LEFT JOIN invitation_guests_extended ge ON g.id = ge.guest_id
LEFT JOIN invitation_tables it ON ge.table_id = it.id
LEFT JOIN invitation_rsvp_answers ira ON g.id = ira.guest_id
GROUP BY g.id, g.invitation_id, i.title, g.user_id, g.name, g.email, g.phone, 
         g.status, g.response_message, g.responded_at, g.created_at, g.updated_at,
         ge.table_id, it.name, ge.guest_type, ge.dietary_restrictions, ge.plus_one, 
         ge.plus_one_name, ge.plus_one_email, ge.plus_one_phone, ge.whatsapp_number, 
         ge.telegram_username, ge.age_group, ge.relationship, ge.side, 
         ge.gift_registry_contribution, ge.gift_description, ge.additional_notes;

-- Vue des médias d'invitation avec informations sur les fichiers
CREATE OR REPLACE VIEW media_details AS
SELECT 
  im.id,
  im.invitation_id,
  i.title as invitation_title,
  im.user_id,
  im.media_type,
  im.file_id,
  uf.file_name,
  uf.file_type,
  uf.file_size,
  uf.file_url,
  im.title,
  im.description,
  im.display_order,
  im.is_featured,
  im.created_at,
  im.updated_at
FROM invitation_media im
LEFT JOIN invitations i ON im.invitation_id = i.id
LEFT JOIN user_files uf ON im.file_id = uf.id;

-- Accorder les permissions pour les vues
GRANT SELECT ON template_details TO authenticated;
GRANT SELECT ON template_details TO anon;
GRANT SELECT ON invitation_details TO authenticated;
GRANT SELECT ON table_details TO authenticated;
GRANT SELECT ON user_template_stats TO authenticated;
GRANT SELECT ON guest_details TO authenticated;
GRANT SELECT ON media_details TO authenticated;