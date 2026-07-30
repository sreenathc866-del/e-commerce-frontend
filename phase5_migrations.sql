-- Create the razorpay_transfers table to store all vendor payouts securely
CREATE TABLE IF NOT EXISTS public.razorpay_transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_id TEXT UNIQUE NOT NULL,       -- Razorpay transfer ID (trf_xxx)
  payment_id TEXT NOT NULL,               -- Razorpay payment ID (pay_xxx)
  recipient_account_id TEXT NOT NULL,     -- Razorpay linked account ID (acc_xxx)
  amount DECIMAL(10, 2) NOT NULL,         -- Amount in INR (not paise)
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for fast lookups by payment or account
CREATE INDEX IF NOT EXISTS idx_razorpay_transfers_payment_id ON public.razorpay_transfers(payment_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_transfers_recipient ON public.razorpay_transfers(recipient_account_id);
