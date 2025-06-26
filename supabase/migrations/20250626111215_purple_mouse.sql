/*
  # Create redirects table
  
  1. New Tables
    - `redirects` - Stores URL redirects for the application
      - `id` (uuid, primary key)
      - `old_path` (text, unique, not null)
      - `new_path` (text, not null)
      - `redirect_type` (text, not null, default '301')
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `redirects` table
    - Add policy for public to read active redirects
    - Add policy for admins to manage all redirects
*/

-- Create redirects table if it doesn't exist
CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path text UNIQUE NOT NULL,
  new_path text NOT NULL,
  redirect_type text NOT NULL DEFAULT '301',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint for redirect_type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'redirects_redirect_type_check' 
    AND conrelid = 'redirects'::regclass
  ) THEN
    ALTER TABLE redirects ADD CONSTRAINT redirects_redirect_type_check 
      CHECK (redirect_type IN ('301', '302'));
  END IF;
END $$;

-- Create index for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_redirects_old_path ON redirects(old_path) WHERE is_active = true;

-- Enable RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active redirects" ON redirects;
DROP POLICY IF EXISTS "Admins can manage redirects" ON redirects;

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

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_redirects_updated_at' 
    AND tgrelid = 'redirects'::regclass
  ) THEN
    CREATE TRIGGER update_redirects_updated_at
      BEFORE UPDATE ON redirects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;