-- Schema updates for Authentication Redesign

-- 1. Add status and additional address fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- 2. Update the handle_new_user function to handle vendor status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role TEXT;
  new_status TEXT;
BEGIN
  new_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  
  -- Vendors start as pending
  IF new_role = 'vendor' THEN
    new_status := 'pending';
  ELSE
    new_status := 'approved';
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, status, phone, business_name, address, state, district, pincode, gst_number
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new_role,
    new_status,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'district',
    new.raw_user_meta_data->>'pincode',
    new.raw_user_meta_data->>'gst_number'
  );
  
  -- Create a shop automatically if they signed up as a vendor
  IF new_role = 'vendor' THEN
    INSERT INTO public.shops (vendor_id, name, business_name, gst_number)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'shop_name', new.raw_user_meta_data->>'full_name' || '''s Shop'),
      new.raw_user_meta_data->>'business_name',
      new.raw_user_meta_data->>'gst_number'
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
