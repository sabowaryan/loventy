-- Créer le bucket pour les médias de mariage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'local_wedding_media',
  'local_wedding_media',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Politique pour permettre l'accès anonyme au téléversement d'images
CREATE POLICY "Anyone can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'local_wedding_media'
  );

-- Politique pour permettre l'accès anonyme à la visualisation des images
CREATE POLICY "Anyone can view wedding media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'local_wedding_media'
  );

-- Politique pour permettre l'accès anonyme à la suppression d'images
CREATE POLICY "Anyone can delete wedding media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'local_wedding_media'
  ); 