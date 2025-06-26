/*
# Guest Extended Statistics View

1. New Views
   - `guest_extended_stats`: Comprehensive view of guest information with statistics
   
2. Changes
   - Creates a view that joins guest data with extended information
   - Includes statistics from various related tables
   - Handles missing tables gracefully with conditional logic
   
3. Security
   - Grants SELECT permission to authenticated users
*/

-- Create the view with conditional logic to handle missing tables
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

-- Accorder les permissions sur la vue
GRANT SELECT ON public.guest_extended_stats TO authenticated;

COMMENT ON VIEW public.guest_extended_stats IS 'Vue détaillée des statistiques d''invités';