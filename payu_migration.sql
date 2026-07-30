-- Add PayU specific columns to vendor_accounts
ALTER TABLE vendor_accounts 
ADD COLUMN IF NOT EXISTS payu_account_id TEXT;

-- Add PayU specific columns to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payu_txnid TEXT,
ADD COLUMN IF NOT EXISTS payu_mihpayid TEXT;

-- Create payu_transfers table for payouts tracking
CREATE TABLE IF NOT EXISTS payu_transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transfer_id TEXT NOT NULL,
    recipient_account_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We are keeping the old razorpay columns for historical data, 
-- but you can drop them in the future if they are no longer needed.
