-- Run this script in your Supabase SQL Editor to update the profiles table

-- 1. Add the new roles array column
ALTER TABLE public.profiles ADD COLUMN roles TEXT[] NOT NULL DEFAULT '{customer}';

-- 2. Migrate existing data from the old 'role' column to the new 'roles' array
UPDATE public.profiles SET roles = ARRAY[role];

-- 3. Drop the old 'role' column
ALTER TABLE public.profiles DROP COLUMN role;

-- 4. Update the trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, roles)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    ARRAY[COALESCE(new.raw_user_meta_data->>'role', 'customer')]
  );
  
  -- Create a shop automatically if they signed up as a vendor
  IF COALESCE(new.raw_user_meta_data->>'role', 'customer') = 'vendor' THEN
    INSERT INTO public.shops (vendor_id, name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'My Shop') || '''s Shop');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add missing RLS policies for product_images
CREATE POLICY "Public product images viewable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Vendors manage own product images" ON public.product_images FOR ALL USING (
  product_id IN (
    SELECT id FROM public.products 
    WHERE shop_id IN (SELECT id FROM public.shops WHERE vendor_id = auth.uid())
  )
);
