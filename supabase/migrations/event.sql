-- ⚙️ Activer l'extension pgcrypto pour UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 📌 Création de la table `event`
CREATE TABLE public.event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  rsvp_deadline TIMESTAMPTZ,
  is_private BOOLEAN DEFAULT TRUE,
  access_code VARCHAR(20) UNIQUE,
  password TEXT,
  image_url TEXT,
  cover_color VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔁 Déclencheur pour mettre à jour `updated_at`
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_updated
BEFORE UPDATE ON public.event
FOR EACH ROW EXECUTE FUNCTION update_event_updated_at();

-- 🔐 Activer la sécurité RLS
ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;

-- 👁️‍🗨️ Politiques RLS
CREATE POLICY "Read own events"
  ON public.event FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own events"
  ON public.event FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own events"
  ON public.event FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own events"
  ON public.event FOR DELETE
  USING (auth.uid() = user_id);

-- 🪟 Vue publique filtrée
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
  cover_color
FROM public.event
WHERE is_private = false OR user_id = auth.uid();

-- 🧩 Fonction RPC : créer un événement
CREATE OR REPLACE FUNCTION public.create_event(
  p_title TEXT,
  p_description TEXT,
  p_type TEXT,
  p_location TEXT,
  p_event_date TIMESTAMPTZ,
  p_rsvp_deadline TIMESTAMPTZ,
  p_is_private BOOLEAN,
  p_access_code TEXT,
  p_password TEXT,
  p_image_url TEXT,
  p_cover_color TEXT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.event (
    user_id, title, description, type, location, event_date, rsvp_deadline,
    is_private, access_code, password, image_url, cover_color
  )
  VALUES (
    auth.uid(), p_title, p_description, p_type, p_location, p_event_date, p_rsvp_deadline,
    p_is_private, p_access_code, crypt(p_password, gen_salt('bf')),
    p_image_url, p_cover_color
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔍 Fonction RPC : récupérer les événements de l’utilisateur
CREATE OR REPLACE FUNCTION public.get_my_events()
RETURNS SETOF public.event AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.event
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🗑️ Fonction RPC : supprimer un événement
CREATE OR REPLACE FUNCTION public.delete_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.event
  WHERE id = p_event_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;