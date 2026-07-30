-- 1. Rename columns in the orders table
ALTER TABLE public.orders 
  RENAME COLUMN razorpay_order_id TO payu_txnid;

ALTER TABLE public.orders 
  RENAME COLUMN razorpay_payment_id TO payu_mihpayid;

-- 2. Drop the old index and create a new one
DROP INDEX IF EXISTS idx_orders_razorpay_order_id;
CREATE INDEX IF NOT EXISTS idx_orders_payu_txnid ON public.orders(payu_txnid);

-- 3. Rename columns in vendor_accounts
ALTER TABLE public.vendor_accounts 
  RENAME COLUMN razorpay_account_id TO payu_account_id;

-- 4. Rename razorpay_transfers table if it exists
ALTER TABLE IF EXISTS public.razorpay_transfers 
  RENAME TO payu_transfers;
