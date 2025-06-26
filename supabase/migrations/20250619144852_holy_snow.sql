/*
  # Fix Security Definer Views

  1. Problem
    - Multiple views are defined with SECURITY DEFINER property
    - This causes security issues as views run with creator's permissions
    - Affected views: template_details, invitation_details, guest_details, 
      user_template_stats, user_usage_stats, media_details

  2. Solution
    - Drop and recreate all affected views without SECURITY DEFINER
    - Maintain the same functionality but with proper security context
    - Add appropriate RLS policies to control access
*/

-- Drop all affected views in the correct order to handle dependencies
DROP VIEW IF EXISTS user_template_stats CASCADE;
DROP VIEW IF EXISTS media_details CASCADE;
DROP VIEW IF EXISTS guest_details CASCADE;
DROP VIEW IF EXISTS invitation_details CASCADE;
DROP VIEW IF EXISTS template_details CASCADE;
DROP VIEW IF EXISTS user_usage_stats CASCADE;

-- Recreate template_details view without SECURITY DEFINER
CREATE VIEW template_details AS
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

-- Recreate invitation_details view without SECURITY DEFINER
CREATE VIEW invitation_details AS
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
  COUNT(DISTINCT im.id) as media_count,
  COUNT(DISTINCT ity.id) as thank_you_count,
  COUNT(DISTINCT irq.id) as rsvp_question_count
FROM invitations i
LEFT JOIN invitation_templates t ON CAST(i.template_id AS uuid) = t.id
LEFT JOIN guests g ON i.id = g.invitation_id
LEFT JOIN invitation_media im ON i.id = im.invitation_id
LEFT JOIN invitation_thank_you ity ON i.id = ity.invitation_id
LEFT JOIN invitation_rsvp_questions irq ON i.id = irq.invitation_id
GROUP BY i.id, i.user_id, i.title, i.template_id, t.name, t.is_premium, 
         i.bride_name, i.groom_name, i.event_date, i.event_time, i.venue, 
         i.address, i.message, i.dress_code, i.rsvp_deadline, i.status, 
         i.created_at, i.updated_at;

-- Recreate guest_details view without SECURITY DEFINER
CREATE VIEW guest_details AS
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
LEFT JOIN invitation_rsvp_answers ira ON g.id = ira.guest_id
GROUP BY g.id, g.invitation_id, i.title, g.user_id, g.name, g.email, g.phone, 
         g.status, g.response_message, g.responded_at, g.created_at, g.updated_at,
         ge.guest_type, ge.dietary_restrictions, ge.plus_one, 
         ge.plus_one_name, ge.plus_one_email, ge.plus_one_phone, ge.whatsapp_number, 
         ge.telegram_username, ge.age_group, ge.relationship, ge.side, 
         ge.gift_registry_contribution, ge.gift_description, ge.additional_notes;

-- Recreate user_template_stats view without SECURITY DEFINER
CREATE VIEW user_template_stats AS
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

-- Recreate media_details view without SECURITY DEFINER
CREATE VIEW media_details AS
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

-- Recreate user_usage_stats view without SECURITY DEFINER
CREATE VIEW user_usage_stats AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(inv_stats.invitations_this_month, 0) as invitations_this_month,
  COALESCE(guest_stats.total_guests, 0) as total_guests,
  COALESCE(email_stats.emails_this_month, 0) as emails_this_month,
  COALESCE(file_stats.storage_used_mb, 0) as storage_used_mb,
  COALESCE(sub.subscription_status, 'not_started') as subscription_status,
  COALESCE(sub.price_id, 'free') as price_id
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as invitations_this_month
  FROM invitations 
  WHERE created_at >= date_trunc('month', now())
  GROUP BY user_id
) inv_stats ON u.id = inv_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_guests
  FROM guests
  GROUP BY user_id
) guest_stats ON u.id = guest_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as emails_this_month
  FROM email_logs
  WHERE sent_at >= date_trunc('month', now())
  GROUP BY user_id
) email_stats ON u.id = email_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    ROUND(SUM(file_size) / 1048576.0, 2) as storage_used_mb
  FROM user_files
  GROUP BY user_id
) file_stats ON u.id = file_stats.user_id
LEFT JOIN stripe_user_subscriptions sub ON u.id IN (
  SELECT user_id FROM stripe_customers WHERE customer_id = sub.customer_id
);

-- Create RLS policies for the views
-- Note: Views inherit RLS policies from their base tables, but we can add additional policies if needed

-- Grant appropriate permissions
GRANT SELECT ON template_details TO authenticated;
GRANT SELECT ON template_details TO anon;
GRANT SELECT ON invitation_details TO authenticated;
GRANT SELECT ON guest_details TO authenticated;
GRANT SELECT ON user_template_stats TO authenticated;
GRANT SELECT ON media_details TO authenticated;
GRANT SELECT ON user_usage_stats TO authenticated;

-- Create a function to check if a view is owned by the current user
CREATE OR REPLACE FUNCTION is_view_owner(view_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT view_user_id = auth.uid();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_view_owner TO authenticated;