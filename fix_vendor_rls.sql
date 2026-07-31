-- RLS policies to allow vendors to view orders, customer profiles, and shipping addresses for items sold in their shop.
-- Run this script in your Supabase SQL Editor.

-- 1. Orders policies
DROP POLICY IF EXISTS "Vendors view own orders" ON public.orders;
CREATE POLICY "Vendors view own orders" ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE oi.order_id = public.orders.id AND s.vendor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Vendors update own orders" ON public.orders;
CREATE POLICY "Vendors update own orders" ON public.orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE oi.order_id = public.orders.id AND s.vendor_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE oi.order_id = public.orders.id AND s.vendor_id = auth.uid()
  )
);

-- 2. Profiles policies
DROP POLICY IF EXISTS "Vendors view customer profiles" ON public.profiles;
CREATE POLICY "Vendors view customer profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE o.customer_id = public.profiles.id AND s.vendor_id = auth.uid()
  )
);

-- 3. Addresses policies
DROP POLICY IF EXISTS "Vendors view customer addresses" ON public.addresses;
CREATE POLICY "Vendors view customer addresses" ON public.addresses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE o.shipping_address_id = public.addresses.id AND s.vendor_id = auth.uid()
  )
);
