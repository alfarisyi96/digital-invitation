-- Create storage bucket for invitation images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-images',
  'invitation-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Public Access for Invitation Images" ON storage.objects
FOR SELECT USING (bucket_id = 'invitation-images');

CREATE POLICY "Authenticated users can upload invitation images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invitation-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their invitation images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'invitation-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their invitation images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'invitation-images' 
  AND auth.role() = 'authenticated'
);
