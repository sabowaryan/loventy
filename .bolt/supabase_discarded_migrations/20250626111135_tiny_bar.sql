/*
  # Create redirects table for URL redirections

  1. New Tables
    - `redirects`
      - `id` (uuid, primary key)
      - `old_path` (text, unique) - The original path to redirect from
      - `new_path` (text) - The destination path to redirect to
      - `redirect_type` (text) - Type of redirect (301, 302)
      - `is_active` (boolean) - Whether the redirect is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `redirects` table
    - Add policy for public read access to active redirects
    - Add policy for admin management
*/

CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path text UNIQUE NOT NULL,
  new_path text NOT NULL,
  redirect_type text NOT NULL DEFAULT '301',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint for redirect_type
ALTER TABLE redirects ADD CONSTRAINT redirects_redirect_type_check 
  CHECK (redirect_type IN ('301', '302'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_redirects_old_path ON redirects(old_path) WHERE is_active = true;

-- Enable RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active redirects
CREATE POLICY "Public can read active redirects"
  ON redirects
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow admins to manage redirects
CREATE POLICY "Admins can manage redirects"
  ON redirects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND r.is_system = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_redirects_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();