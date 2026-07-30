-- Add Razorpay Onboarding and KYC tracking fields
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS razorpay_onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS razorpay_kyc_status TEXT DEFAULT 'pending';
