-- ==============================================================================
-- PHASE 6: DATABASE SCHEMA OVERHAUL
-- This script normalizes the database and adds robust auditing & accounting.
-- ==============================================================================

-- 1. Updates to existing orders and order_items tables
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none';

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';

-- 2. New vendor_accounts table for secure Razorpay details
CREATE TABLE IF NOT EXISTS public.vendor_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE UNIQUE NOT NULL,
  razorpay_account_id TEXT UNIQUE NOT NULL,
  onboarding_status TEXT DEFAULT 'pending',
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendor_accounts_shop_id ON public.vendor_accounts(shop_id);

-- Clean up older redundant columns on shops (optional, keeping them for now to avoid breaking existing queries that might use them before the backend migration is done, but they should be dropped later).
-- ALTER TABLE public.shops DROP COLUMN razorpay_account_id, DROP COLUMN razorpay_onboarding_status, DROP COLUMN razorpay_kyc_status;

-- 3. Upgrade transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS error_code TEXT,
ADD COLUMN IF NOT EXISTS error_description TEXT;

-- 4. transfers table (We already created razorpay_transfers, let's just make sure it exists or create an alias/view, or just stick to razorpay_transfers).
-- Ensure razorpay_transfers is robust.
ALTER TABLE public.razorpay_transfers
ADD COLUMN IF NOT EXISTS settlement_status TEXT DEFAULT 'pending';

-- 5. settlements table
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  settlement_id TEXT UNIQUE NOT NULL,    -- Razorpay setl_xxx
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  fees DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  utr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settlements_id ON public.settlements(settlement_id);

-- 6. commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_commissions_shop_id ON public.commissions(shop_id);

-- 7. payment_logs table (Auditing)
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs(order_id);

-- 8. webhook_logs table (Auditing)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  refund_id TEXT UNIQUE NOT NULL,        -- Razorpay rfnd_xxx
  payment_id TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
