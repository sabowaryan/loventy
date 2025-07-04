-- Ajouter les colonnes manquantes pour les boissons
ALTER TABLE public.local_wedding_data 
ADD COLUMN IF NOT EXISTS alcoholic_drinks TEXT,
ADD COLUMN IF NOT EXISTS non_alcoholic_drinks TEXT; 