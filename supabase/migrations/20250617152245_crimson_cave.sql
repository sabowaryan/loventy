/*
  # Fix search_templates function

  1. Changes
    - Drop existing function with all parameter combinations
    - Create new search_templates function with updated parameters and return type
    - Grant appropriate permissions

  2. Security
    - Maintain SECURITY DEFINER setting
    - Grant execute permissions to authenticated and anon roles
*/

-- Drop all versions of the existing function to avoid conflicts
DROP FUNCTION IF EXISTS search_templates(text, text, boolean, boolean);
DROP FUNCTION IF EXISTS search_templates(text, text, boolean, integer, integer);

-- Create the corrected search_templates function
CREATE OR REPLACE FUNCTION search_templates(
  search_term text DEFAULT NULL,
  category_slug text DEFAULT NULL,
  is_premium_only boolean DEFAULT false,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  category_id uuid,
  category_name text,
  is_premium boolean,
  preview_image_url text,
  thumbnail_url text,
  color_palette jsonb,
  usage_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    td.id,
    td.name,
    td.slug,
    td.description,
    td.category_id,
    td.category_name,
    td.is_premium,
    td.preview_image_url,
    td.thumbnail_url,
    td.color_palette,
    td.usage_count
  FROM template_details td
  WHERE 
    td.is_active = true
    AND (NOT is_premium_only OR td.is_premium = true)
    AND (search_term IS NULL OR (
      td.name ILIKE '%' || search_term || '%' 
      OR td.description ILIKE '%' || search_term || '%'
      OR td.category_name ILIKE '%' || search_term || '%'
    ))
    AND (category_slug IS NULL OR td.category_slug = category_slug)
  ORDER BY 
    td.usage_count DESC NULLS LAST,
    td.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_templates(text, text, boolean, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_templates(text, text, boolean, integer, integer) TO anon;