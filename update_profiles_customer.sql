-- Run this in your Supabase SQL Editor to add the required customer profile fields:
-- 1. Add phone, dob, and gender columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. Add an index on profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING gin (roles);
