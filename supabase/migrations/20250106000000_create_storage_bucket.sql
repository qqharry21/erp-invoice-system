-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for invoices bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload invoice files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read files
CREATE POLICY "Users can read invoice files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
