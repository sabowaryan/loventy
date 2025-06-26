-- First, drop all views that depend on the invitations table
DROP VIEW IF EXISTS template_details CASCADE;
DROP VIEW IF EXISTS invitation_details CASCADE;
DROP VIEW IF EXISTS guest_details CASCADE;
DROP VIEW IF EXISTS user_template_stats CASCADE;
DROP VIEW IF EXISTS guest_extended_stats CASCADE;

-- Add a temporary column to hold the UUID values
ALTER TABLE public.invitations ADD COLUMN template_id_uuid uuid;

-- Update the temporary column with converted values
-- For existing records, try to convert the text to UUID if possible
UPDATE public.invitations
SET template_id_uuid = 
  CASE 
    WHEN template_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 
      template_id::uuid
    ELSE
      -- For non-UUID values, try to find the template by slug
      (SELECT id FROM public.invitation_templates WHERE slug = template_id)
  END
WHERE template_id IS NOT NULL;

-- Drop the old column and rename the new one
ALTER TABLE public.invitations DROP COLUMN template_id;
ALTER TABLE public.invitations RENAME COLUMN template_id_uuid TO template_id;

-- Make the column NOT NULL and add a default value
ALTER TABLE public.invitations ALTER COLUMN template_id SET NOT NULL;

-- Add a foreign key constraint
ALTER TABLE public.invitations 
  ADD CONSTRAINT invitations_template_id_fkey 
  FOREIGN KEY (template_id) 
  REFERENCES public.invitation_templates(id);

-- Recreate the views with the updated column type
CREATE OR REPLACE VIEW template_details WITH (security_invoker = true) AS
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
LEFT JOIN invitations i ON i.template_id = t.id
GROUP BY t.id, t.name, t.slug, t.description, t.is_premium, t.is_active, 
         t.preview_image_url, t.thumbnail_url, t.color_palette, t.font_pairs, 
         t.layout_options, t.default_settings, t.created_at, t.updated_at,
         c.id, c.name, c.slug, c.icon;

CREATE OR REPLACE VIEW invitation_details WITH (security_invoker = true) AS
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
LEFT JOIN invitation_templates t ON i.template_id = t.id
LEFT JOIN guests g ON i.id = g.invitation_id
LEFT JOIN invitation_media im ON i.id = im.invitation_id
LEFT JOIN invitation_thank_you ity ON i.id = ity.invitation_id
LEFT JOIN invitation_rsvp_questions irq ON i.id = irq.invitation_id
GROUP BY i.id, i.user_id, i.title, i.template_id, t.name, t.is_premium, 
         i.bride_name, i.groom_name, i.event_date, i.event_time, i.venue, 
         i.address, i.message, i.dress_code, i.rsvp_deadline, i.status, 
         i.created_at, i.updated_at;

CREATE OR REPLACE VIEW guest_details WITH (security_invoker = true) AS
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
  ge.guest_group,
  ge.is_vip,
  ge.special_access_code,
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
         ge.gift_registry_contribution, ge.gift_description, ge.additional_notes,
         ge.guest_group, ge.is_vip, ge.special_access_code;

CREATE OR REPLACE VIEW user_template_stats WITH (security_invoker = true) AS
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
LEFT JOIN invitation_templates t ON i.template_id = t.id
LEFT JOIN guests g ON i.id = g.invitation_id
GROUP BY u.id, u.email, t.id, t.name, t.is_premium;

-- Recreate guest_extended_stats view
CREATE OR REPLACE VIEW public.guest_extended_stats AS
SELECT
  g.id,
  g.invitation_id,
  i.title AS invitation_title,
  g.user_id,
  g.name,
  g.email,
  g.phone,
  g.status,
  g.response_message,
  g.responded_at,
  g.created_at,
  g.updated_at,
  
  -- Informations étendues
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
  ge.guest_group,
  ge.is_vip,
  ge.special_access_code,
  
  -- Statistiques des réponses aux questions RSVP
  COALESCE(rsvp_stats.answered_questions, 0) AS answered_questions
  
FROM public.guests g
JOIN public.invitations i ON g.invitation_id = i.id
LEFT JOIN public.invitation_guests_extended ge ON g.id = ge.guest_id

-- Statistiques des réponses aux questions RSVP
LEFT JOIN (
  SELECT
    guest_id,
    COUNT(*) AS answered_questions
  FROM public.invitation_rsvp_answers
  GROUP BY guest_id
) rsvp_stats ON g.id = rsvp_stats.guest_id;

-- Update the create_invitation_from_template function to use UUID
CREATE OR REPLACE FUNCTION create_invitation_from_template(
  user_uuid uuid,
  template_uuid uuid,
  invitation_title text,
  bride_name text DEFAULT NULL,
  groom_name text DEFAULT NULL,
  event_date date DEFAULT NULL,
  event_time time DEFAULT NULL,
  venue text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_invitation_id uuid;
  template_settings jsonb;
BEGIN
  -- Vérifier si l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Vérifier si le modèle existe
  IF NOT EXISTS (SELECT 1 FROM invitation_templates WHERE id = template_uuid) THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Récupérer les paramètres par défaut du modèle
  SELECT default_settings INTO template_settings FROM invitation_templates WHERE id = template_uuid;
  
  -- Créer la nouvelle invitation
  INSERT INTO invitations (
    user_id,
    template_id,
    title,
    bride_name,
    groom_name,
    event_date,
    event_time,
    venue,
    status,
    settings,
    design_settings
  )
  VALUES (
    user_uuid,
    template_uuid,
    invitation_title,
    COALESCE(bride_name, ''),
    COALESCE(groom_name, ''),
    event_date,
    event_time,
    COALESCE(venue, ''),
    'draft',
    template_settings,
    (SELECT color_palette FROM invitation_templates WHERE id = template_uuid)
  )
  RETURNING id INTO new_invitation_id;
  
  -- Retourner l'ID de la nouvelle invitation
  RETURN new_invitation_id;
END;
$$;

-- Grant permissions
GRANT SELECT ON template_details TO authenticated;
GRANT SELECT ON invitation_details TO authenticated;
GRANT SELECT ON guest_details TO authenticated;
GRANT SELECT ON user_template_stats TO authenticated;
GRANT SELECT ON guest_extended_stats TO authenticated;