-- Create vendor_wallet table
CREATE TABLE IF NOT EXISTS vendor_wallet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES auth.users(id),
    available_balance NUMERIC DEFAULT 0,
    pending_balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_wallet_transactions table
CREATE TABLE IF NOT EXISTS vendor_wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id),
    gross_amount NUMERIC NOT NULL,
    commission NUMERIC NOT NULL,
    net_amount NUMERIC NOT NULL,
    transaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC NOT NULL,
    bank_account_id UUID,
    status TEXT NOT NULL DEFAULT 'Pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create vendor_bank_accounts table
CREATE TABLE IF NOT EXISTS vendor_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES auth.users(id),
    account_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Also add razorpay_order_id to orders if it was dropped during PayU migration
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
