-- Migration pour données locales Loventy (provisoire)

CREATE TABLE IF NOT EXISTS local_wedding_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Activer le RLS et autoriser lecture/écriture pour tous sur local_wedding_data
ALTER TABLE public.local_wedding_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read local_wedding_data" ON public.local_wedding_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert local_wedding_data" ON public.local_wedding_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update local_wedding_data" ON public.local_wedding_data FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete local_wedding_data" ON public.local_wedding_data FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS local_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid REFERENCES local_wedding_data(id),
  name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT,
  invitation_link TEXT,
  message_sender TEXT
);

-- Activer le RLS et autoriser lecture/écriture pour tous sur local_guests
ALTER TABLE public.local_guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read local_guests" ON public.local_guests FOR SELECT USING (true);
CREATE POLICY "Allow anon insert local_guests" ON public.local_guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update local_guests" ON public.local_guests FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete local_guests" ON public.local_guests FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS local_guest_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES local_guests(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Activer le RLS et autoriser lecture/écriture pour tous sur local_guest_messages
ALTER TABLE public.local_guest_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read local_guest_messages" ON public.local_guest_messages FOR SELECT USING (true);
CREATE POLICY "Allow anon insert local_guest_messages" ON public.local_guest_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update local_guest_messages" ON public.local_guest_messages FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete local_guest_messages" ON public.local_guest_messages FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS local_guest_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES local_guests(id),
  alcoholic_drinks TEXT,
  non_alcoholic_drinks TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Activer le RLS et autoriser lecture/écriture pour tous sur local_guest_preferences
ALTER TABLE public.local_guest_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read local_guest_preferences" ON public.local_guest_preferences FOR SELECT USING (true);
CREATE POLICY "Allow anon insert local_guest_preferences" ON public.local_guest_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update local_guest_preferences" ON public.local_guest_preferences FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete local_guest_preferences" ON public.local_guest_preferences FOR DELETE USING (true); 