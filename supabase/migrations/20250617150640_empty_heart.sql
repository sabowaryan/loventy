-- Supprimer les vues qui dépendent de invitation_tables
DROP VIEW IF EXISTS table_details CASCADE;
DROP VIEW IF EXISTS guest_details CASCADE;
DROP VIEW IF EXISTS invitation_details CASCADE;

-- Recréer la vue invitation_details sans les références à invitation_tables
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

-- Recréer la vue guest_details sans les références à invitation_tables
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

-- Supprimer les contraintes de clé étrangère qui référencent invitation_tables
ALTER TABLE invitation_guests_extended DROP CONSTRAINT IF EXISTS invitation_guests_extended_table_id_fkey;

-- Supprimer la colonne table_id de invitation_guests_extended
ALTER TABLE invitation_guests_extended DROP COLUMN IF EXISTS table_id;

-- Supprimer les index qui référencent invitation_tables
DROP INDEX IF EXISTS idx_invitation_guests_extended_table;
DROP INDEX IF EXISTS idx_invitation_tables_invitation;

-- Supprimer les déclencheurs sur invitation_tables
DROP TRIGGER IF EXISTS update_invitation_tables_updated_at ON invitation_tables;

-- Supprimer la table invitation_tables
DROP TABLE IF EXISTS invitation_tables CASCADE;

-- Mettre à jour la fonction get_table_guests pour qu'elle retourne une table vide
CREATE OR REPLACE FUNCTION get_table_guests(table_uuid uuid)
RETURNS TABLE (
  guest_id uuid,
  guest_name text,
  guest_email text,
  guest_status text,
  guest_type text,
  plus_one boolean,
  plus_one_name text,
  relationship text,
  side text
) AS $$
BEGIN
  -- Cette fonction ne fait plus rien car la table invitation_tables a été supprimée
  RETURN QUERY SELECT 
    NULL::uuid as guest_id,
    NULL::text as guest_name,
    NULL::text as guest_email,
    NULL::text as guest_status,
    NULL::text as guest_type,
    NULL::boolean as plus_one,
    NULL::text as plus_one_name,
    NULL::text as relationship,
    NULL::text as side
  WHERE false;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions pour les vues mises à jour
GRANT SELECT ON guest_details TO authenticated;
GRANT SELECT ON invitation_details TO authenticated;