-- =====================================================
-- Complete Event Management Database Schema
-- Secure implementation with proper cleanup and recreation
-- =====================================================

-- Step 1: Clean up existing objects to avoid conflicts
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS public.event_summary_view CASCADE;

-- Drop existing RPC functions
DROP FUNCTION IF EXISTS public.create_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_events() CASCADE;
DROP FUNCTION IF EXISTS public.delete_event(UUID) CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Read own events" ON public.event;
DROP POLICY IF EXISTS "Insert own events" ON public.event;
DROP POLICY IF EXISTS "Update own events" ON public.event;
DROP POLICY IF EXISTS "Delete own events" ON public.event;
DROP POLICY IF EXISTS "Access guests of own events" ON public.guest;
DROP POLICY IF EXISTS "Access invitations of own events" ON public.invitations;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS trg_event_updated ON public.event;
DROP FUNCTION IF EXISTS update_event_updated_at() CASCADE;

-- Drop existing foreign key constraints safely
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invitations_event') THEN
        ALTER TABLE public.invitations DROP CONSTRAINT fk_invitations_event;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_guest_event') THEN
        ALTER TABLE public.guest DROP CONSTRAINT fk_guest_event;
    END IF;
END $$;

-- Step 2: Create or ensure required extensions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create the main event table
-- =====================================================

-- Drop and recreate event table for clean state
DROP TABLE IF EXISTS public.event CASCADE;

CREATE TABLE public.event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('birthday', 'wedding', 'corporate', 'social', 'meeting', 'conference', 'other') OR type IS NULL),
    location TEXT,
    event_date TIMESTAMPTZ NOT NULL CHECK (event_date > NOW()),
    rsvp_deadline TIMESTAMPTZ CHECK (rsvp_deadline IS NULL OR rsvp_deadline <= event_date),
    is_private BOOLEAN DEFAULT TRUE NOT NULL,
    access_code VARCHAR(20) UNIQUE CHECK (access_code IS NULL OR length(trim(access_code)) >= 4),
    password TEXT,
    image_url TEXT CHECK (image_url IS NULL OR image_url ~* '^https?://'),
    cover_color VARCHAR(10) CHECK (cover_color IS NULL OR cover_color ~* '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Add foreign key constraint if auth.users exists
    CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_event_user_id ON public.event(user_id);
CREATE INDEX idx_event_date ON public.event(event_date);
CREATE INDEX idx_event_access_code ON public.event(access_code) WHERE access_code IS NOT NULL;
CREATE INDEX idx_event_is_private ON public.event(is_private);

-- Step 4: Create updated_at trigger function and trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_event_updated
    BEFORE UPDATE ON public.event
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- Step 5: Update related tables with event_id foreign keys
-- =====================================================

-- Add event_id to invitations table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') THEN
        -- Add event_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invitations' AND column_name = 'event_id') THEN
            ALTER TABLE public.invitations ADD COLUMN event_id UUID;
        END IF;
        
        -- Add foreign key constraint
        ALTER TABLE public.invitations
        ADD CONSTRAINT fk_invitations_event
        FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
    END IF;
END $$;

-- Add event_id to guest table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guest') THEN
        -- Add event_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'guest' AND column_name = 'event_id') THEN
            ALTER TABLE public.guest ADD COLUMN event_id UUID;
        END IF;
        
        -- Add foreign key constraint
        ALTER TABLE public.guest
        ADD CONSTRAINT fk_guest_event
        FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_guest_event_id ON public.guest(event_id);
    END IF;
END $$;

-- Step 6: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;

-- Enable RLS on related tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guest') THEN
        ALTER TABLE public.guest ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') THEN
        ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 7: Create RLS policies for event table
-- =====================================================

-- Policy for reading own events
CREATE POLICY "Read own events"
    ON public.event FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for inserting own events
CREATE POLICY "Insert own events"
    ON public.event FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating own events
CREATE POLICY "Update own events"
    ON public.event FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own events
CREATE POLICY "Delete own events"
    ON public.event FOR DELETE
    USING (auth.uid() = user_id);

-- Step 8: Create RLS policies for related tables
-- =====================================================

-- Policy for guest table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guest') THEN
        CREATE POLICY "Access guests of own events"
            ON public.guest FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.event
                    WHERE public.event.id = guest.event_id
                    AND public.event.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Policy for invitations table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') THEN
        CREATE POLICY "Access invitations of own events"
            ON public.invitations FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.event
                    WHERE public.event.id = invitations.event_id
                    AND public.event.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Step 9: Create views
-- =====================================================

CREATE OR REPLACE VIEW public.event_summary_view AS
SELECT
    id,
    user_id,
    title,
    event_date,
    type,
    location,
    is_private,
    access_code,
    image_url,
    cover_color,
    created_at
FROM public.event
WHERE 
    is_private = false 
    OR user_id = auth.uid();

-- Grant appropriate permissions on the view
GRANT SELECT ON public.event_summary_view TO authenticated;

-- Step 10: Create RPC functions
-- =====================================================

-- Function: create_event
CREATE OR REPLACE FUNCTION public.create_event(
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_event_date TIMESTAMPTZ DEFAULT NULL,
    p_rsvp_deadline TIMESTAMPTZ DEFAULT NULL,
    p_is_private BOOLEAN DEFAULT TRUE,
    p_access_code TEXT DEFAULT NULL,
    p_password TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_cover_color TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_event_id UUID;
    hashed_password TEXT;
BEGIN
    -- Validate required parameters
    IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
        RAISE EXCEPTION 'Title is required and cannot be empty';
    END IF;
    
    IF p_event_date IS NULL THEN
        RAISE EXCEPTION 'Event date is required';
    END IF;
    
    IF p_event_date <= NOW() THEN
        RAISE EXCEPTION 'Event date must be in the future';
    END IF;
    
    -- Hash password if provided
    IF p_password IS NOT NULL AND length(trim(p_password)) > 0 THEN
        hashed_password := crypt(p_password, gen_salt('bf'));
    END IF;
    
    -- Insert the new event
    INSERT INTO public.event (
        user_id, title, description, type, location, event_date, rsvp_deadline,
        is_private, access_code, password, image_url, cover_color
    )
    VALUES (
        auth.uid(), 
        trim(p_title), 
        p_description, 
        p_type, 
        p_location, 
        p_event_date, 
        p_rsvp_deadline,
        p_is_private, 
        p_access_code, 
        hashed_password,
        p_image_url, 
        p_cover_color
    )
    RETURNING id INTO new_event_id;
    
    RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_my_events
CREATE OR REPLACE FUNCTION public.get_my_events()
RETURNS SETOF public.event AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.event
    WHERE user_id = auth.uid()
    ORDER BY event_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: delete_event
CREATE OR REPLACE FUNCTION public.delete_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.event
    WHERE id = p_event_id AND user_id = auth.uid();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: verify_event_access (bonus security function)
CREATE OR REPLACE FUNCTION public.verify_event_access(
    p_event_id UUID,
    p_access_code TEXT DEFAULT NULL,
    p_password TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
BEGIN
    SELECT * INTO event_record
    FROM public.event
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If user owns the event, grant access
    IF event_record.user_id = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- If event is public, grant access
    IF NOT event_record.is_private THEN
        RETURN TRUE;
    END IF;
    
    -- Check access code if provided
    IF event_record.access_code IS NOT NULL AND p_access_code = event_record.access_code THEN
        -- If no password required, grant access
        IF event_record.password IS NULL THEN
            RETURN TRUE;
        END IF;
        
        -- Check password if provided
        IF p_password IS NOT NULL AND crypt(p_password, event_record.password) = event_record.password THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Grant permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_event_access TO authenticated;

-- Step 12: Add helpful comments
-- =====================================================

COMMENT ON TABLE public.event IS 'Main events table with user ownership and privacy controls';
COMMENT ON COLUMN public.event.access_code IS 'Optional access code for private events';
COMMENT ON COLUMN public.event.password IS 'Hashed password using bcrypt for additional security';
COMMENT ON FUNCTION public.create_event IS 'Creates a new event with proper validation and security';
COMMENT ON FUNCTION public.verify_event_access IS 'Verifies if a user can access a specific event';

-- =====================================================
-- Schema creation completed successfully
-- =====================================================