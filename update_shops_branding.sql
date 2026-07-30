-- ====================================================================
-- MIGRATION: ADD VENDOR SHOP BRANDING COLUMNS AND STORAGE BUCKETS
-- ====================================================================

-- 1. Ensure all basic, address, social media, and visibility columns exist in public.shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- 2. Register storage buckets for shop logos and shop banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-banners', 'shop-banners', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up storage security policies (safe drop + recreate)
DROP POLICY IF EXISTS "Allow authenticated users to upload shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete shop logos" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload shop logos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'shop-logos');

CREATE POLICY "Allow public read access to shop logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'shop-logos');

CREATE POLICY "Allow owners to update shop logos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'shop-logos');

CREATE POLICY "Allow owners to delete shop logos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Allow authenticated users to upload shop banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to shop banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update shop banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete shop banners" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload shop banners" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'shop-banners');

CREATE POLICY "Allow public read access to shop banners" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'shop-banners');

CREATE POLICY "Allow owners to update shop banners" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'shop-banners');

CREATE POLICY "Allow owners to delete shop banners" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'shop-banners');
