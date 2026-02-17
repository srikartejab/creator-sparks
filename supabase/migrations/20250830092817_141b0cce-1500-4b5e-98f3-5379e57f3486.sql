-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Create storage policies for thumbnails
CREATE POLICY "Thumbnail images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'thumbnails' AND auth.uid() IS NOT NULL);
-- Seed data moved to supabase/seed.sql
