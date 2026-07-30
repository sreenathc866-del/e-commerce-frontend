-- Add Razorpay Account ID for vendors (Linked Accounts for Route)
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT;
