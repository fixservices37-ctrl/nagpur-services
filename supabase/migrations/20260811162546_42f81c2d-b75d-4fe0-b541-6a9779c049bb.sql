CREATE POLICY "Anyone can upload service request photos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'request-photos');