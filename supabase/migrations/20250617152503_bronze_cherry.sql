/*
  # Fix search_templates function

  1. Changes
    - Fix parameter name conflict by renaming the parameter from "category_slug" to "category_slug_param"
    - Fix ambiguous column reference by properly qualifying columns with table aliases
    - Improve search relevance with better ordering
  
  2. Security
    - Maintain SECURITY DEFINER setting
    - Grant execute permissions to authenticated and anonymous users
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS search_templates(text, text, boolean, integer, integer);

-- Create the corrected search_templates function
CREATE OR REPLACE FUNCTION search_templates(
  search_term text DEFAULT NULL,
  category_slug_param text DEFAULT NULL,
  is_premium_only boolean DEFAULT false,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  is_premium boolean,
  is_active boolean,
  preview_image_url text,
  thumbnail_url text,
  color_palette jsonb,
  font_pairs jsonb,
  layout_options jsonb,
  default_settings jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  category_id uuid,
  category_name text,
  category_slug text,
  category_icon text,
  usage_count bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
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
    t.category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    COALESCE(stats.usage_count, 0) as usage_count,
    COALESCE(stats.unique_users, 0) as unique_users
  FROM invitation_templates t
  LEFT JOIN template_categories c ON t.category_id = c.id
  LEFT JOIN (
    SELECT 
      template_id,
      COUNT(*) as usage_count,
      COUNT(DISTINCT user_id) as unique_users
    FROM invitations
    WHERE template_id IS NOT NULL
    GROUP BY template_id
  ) stats ON t.id::text = stats.template_id
  WHERE 
    t.is_active = true
    AND (search_term IS NULL OR (
      t.name ILIKE '%' || search_term || '%' 
      OR t.description ILIKE '%' || search_term || '%'
      OR c.name ILIKE '%' || search_term || '%'
    ))
    AND (category_slug_param IS NULL OR c.slug = category_slug_param)
    AND (NOT is_premium_only OR t.is_premium = true)
  ORDER BY 
    CASE WHEN search_term IS NOT NULL THEN
      CASE 
        WHEN t.name ILIKE search_term || '%' THEN 1
        WHEN t.name ILIKE '%' || search_term || '%' THEN 2
        ELSE 3
      END
    ELSE 0
    END,
    usage_count DESC NULLS LAST,
    t.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_templates(text, text, boolean, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_templates(text, text, boolean, integer, integer) TO anon;