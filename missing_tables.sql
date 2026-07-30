-- missing_tables.sql

-- 1. vendor_accounts
CREATE TABLE IF NOT EXISTS public.vendor_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL UNIQUE,
  razorpay_account_id TEXT NOT NULL,
  onboarding_status TEXT DEFAULT 'created',
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendor_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own accounts"
  ON public.vendor_accounts FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE vendor_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to vendor_accounts"
  ON public.vendor_accounts FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. razorpay_transfers
CREATE TABLE IF NOT EXISTS public.razorpay_transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_id TEXT NOT NULL UNIQUE,
  recipient_account_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.razorpay_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to razorpay_transfers"
  ON public.razorpay_transfers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Vendors can view their own transfers"
  ON public.razorpay_transfers FOR SELECT
  USING (
    recipient_account_id IN (
      SELECT razorpay_account_id FROM public.vendor_accounts
      WHERE shop_id IN (SELECT id FROM public.shops WHERE vendor_id = auth.uid())
    )
  );

-- 3. refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  refund_id TEXT NOT NULL UNIQUE,
  payment_id TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to refunds"
  ON public.refunds FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. webhook_logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to webhook_logs"
  ON public.webhook_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Explicitly refresh Schema Cache
NOTIFY pgrst, 'reload schema';
