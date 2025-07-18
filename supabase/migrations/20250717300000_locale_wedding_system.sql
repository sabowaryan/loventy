-- Migration consolidée pour le système de mariage local
-- Combine les tables locales et le bucket de médias

-- Supprime les tables dans l'ordre pour respecter les contraintes FK
DROP TABLE IF EXISTS public.local_guest_preferences CASCADE;
DROP TABLE IF EXISTS public.local_guest_messages CASCADE;
DROP TABLE IF EXISTS public.local_guests CASCADE;
DROP TABLE IF EXISTS public.local_wedding_data CASCADE;

-- Supprime le bucket s'il existe
DELETE FROM storage.objects WHERE bucket_id = 'local_wedding_media';
DELETE FROM storage.buckets WHERE id = 'local_wedding_media';

-- Création des tables principales

CREATE TABLE public.local_wedding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  couple_photo TEXT,
  wedding_day TEXT,
  wedding_month TEXT,
  wedding_year TEXT,
  wedding_day_of_week TEXT,
  wedding_time TEXT,
  ceremony_time TEXT,
  ceremony_venue TEXT,
  ceremony_address TEXT,
  reception_time TEXT,
  reception_venue TEXT,
  reception_address TEXT,
  welcome_message TEXT,
  invitation_title TEXT,
  invitation_love_quote TEXT,
  invitation_main_message TEXT,
  invitation_date_message TEXT,
  program_title TEXT,
  ceremony_title TEXT,
  reception_title TEXT,
  program_welcome_message TEXT,
  guestbook_title TEXT,
  guestbook_subtitle TEXT,
  guestbook_placeholder TEXT,
  guestbook_save_button TEXT,
  preferences_title TEXT,
  preferences_subtitle TEXT,
  preferences_description TEXT,
  preferences_limitation TEXT,
  preferences_alcoholic_title TEXT,
  preferences_non_alcoholic_title TEXT,
  cancellation_title TEXT,
  cancellation_description TEXT,
  cancellation_time_limit TEXT,
  cancellation_cancel_button TEXT,
  cancellation_modal_title TEXT,
  cancellation_modal_message TEXT,
  cancellation_keep_button TEXT,
  cancellation_confirm_button TEXT,
  cancellation_success_message TEXT,
  alcoholic_drinks TEXT,
  non_alcoholic_drinks TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.local_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.local_wedding_data(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT,
  invitation_link TEXT,
  message_sender TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_local_guests_wedding_id ON public.local_guests(wedding_id);

CREATE TABLE public.local_guest_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.local_guests(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_local_guest_messages_guest_id ON public.local_guest_messages(guest_id);

CREATE TABLE public.local_guest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.local_guests(id) ON DELETE CASCADE,
  alcoholic_drinks TEXT,
  non_alcoholic_drinks TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_local_guest_preferences_guest_id ON public.local_guest_preferences(guest_id);

-- Création du bucket pour les médias de mariage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'local_wedding_media',
  'local_wedding_media',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Trigger fonction pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.local_wedding_data;
CREATE TRIGGER update_updated_at_trigger
BEFORE UPDATE ON public.local_wedding_data
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.local_guests;
CREATE TRIGGER update_updated_at_trigger
BEFORE UPDATE ON public.local_guests
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_updated_at_trigger ON public.local_guest_preferences;
CREATE TRIGGER update_updated_at_trigger
BEFORE UPDATE ON public.local_guest_preferences
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Activer Row Level Security
ALTER TABLE public.local_wedding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_guest_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_guest_preferences ENABLE ROW LEVEL SECURITY;

-- Policies RLS pour local_wedding_data
DROP POLICY IF EXISTS "Allow anon select local_wedding_data" ON public.local_wedding_data;
CREATE POLICY "Allow anon select local_wedding_data" ON public.local_wedding_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert local_wedding_data" ON public.local_wedding_data;
CREATE POLICY "Allow anon insert local_wedding_data" ON public.local_wedding_data FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update local_wedding_data" ON public.local_wedding_data;
CREATE POLICY "Allow anon update local_wedding_data" ON public.local_wedding_data FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete local_wedding_data" ON public.local_wedding_data;
CREATE POLICY "Allow anon delete local_wedding_data" ON public.local_wedding_data FOR DELETE USING (true);

-- Policies RLS pour local_guests
DROP POLICY IF EXISTS "Allow anon select local_guests" ON public.local_guests;
CREATE POLICY "Allow anon select local_guests" ON public.local_guests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert local_guests" ON public.local_guests;
CREATE POLICY "Allow anon insert local_guests" ON public.local_guests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update local_guests" ON public.local_guests;
CREATE POLICY "Allow anon update local_guests" ON public.local_guests FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete local_guests" ON public.local_guests;
CREATE POLICY "Allow anon delete local_guests" ON public.local_guests FOR DELETE USING (true);

-- Policies RLS pour local_guest_messages
DROP POLICY IF EXISTS "Allow anon select local_guest_messages" ON public.local_guest_messages;
CREATE POLICY "Allow anon select local_guest_messages" ON public.local_guest_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert local_guest_messages" ON public.local_guest_messages;
CREATE POLICY "Allow anon insert local_guest_messages" ON public.local_guest_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update local_guest_messages" ON public.local_guest_messages;
CREATE POLICY "Allow anon update local_guest_messages" ON public.local_guest_messages FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete local_guest_messages" ON public.local_guest_messages;
CREATE POLICY "Allow anon delete local_guest_messages" ON public.local_guest_messages FOR DELETE USING (true);

-- Policies RLS pour local_guest_preferences
DROP POLICY IF EXISTS "Allow anon select local_guest_preferences" ON public.local_guest_preferences;
CREATE POLICY "Allow anon select local_guest_preferences" ON public.local_guest_preferences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert local_guest_preferences" ON public.local_guest_preferences;
CREATE POLICY "Allow anon insert local_guest_preferences" ON public.local_guest_preferences FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update local_guest_preferences" ON public.local_guest_preferences;
CREATE POLICY "Allow anon update local_guest_preferences" ON public.local_guest_preferences FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete local_guest_preferences" ON public.local_guest_preferences;
CREATE POLICY "Allow anon delete local_guest_preferences" ON public.local_guest_preferences FOR DELETE USING (true);

-- Policies pour le bucket de médias
CREATE POLICY "Anyone can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'local_wedding_media'
  );

CREATE POLICY "Anyone can view wedding media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'local_wedding_media'
  );

CREATE POLICY "Anyone can delete wedding media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'local_wedding_media'
  );