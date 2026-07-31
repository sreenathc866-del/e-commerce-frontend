-- 1. Helper functions (SECURITY DEFINER to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.customer_owns_order(order_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND customer_id = user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.vendor_owns_order(order_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE oi.order_id = order_id AND s.vendor_id = user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.vendor_owns_customer_profile(profile_id UUID, vendor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE o.customer_id = profile_id AND s.vendor_id = vendor_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.vendor_owns_customer_address(address_id UUID, vendor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.shops s ON oi.shop_id = s.id
    WHERE o.shipping_address_id = address_id AND s.vendor_id = vendor_id
  );
END;
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Vendors view own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors update own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors view customer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Vendors view customer addresses" ON public.addresses;
DROP POLICY IF EXISTS "Customers manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Customers view own order items" ON public.order_items;

-- 3. Create clean, recursion-free policies using the helper functions
CREATE POLICY "Vendors view own orders" ON public.orders FOR SELECT USING (
  public.vendor_owns_order(id, auth.uid())
);

CREATE POLICY "Vendors update own orders" ON public.orders FOR UPDATE USING (
  public.vendor_owns_order(id, auth.uid())
) WITH CHECK (
  public.vendor_owns_order(id, auth.uid())
);

CREATE POLICY "Vendors view customer profiles" ON public.profiles FOR SELECT USING (
  public.vendor_owns_customer_profile(id, auth.uid())
);

CREATE POLICY "Vendors view customer addresses" ON public.addresses FOR SELECT USING (
  public.vendor_owns_customer_address(id, auth.uid())
);

CREATE POLICY "Customers manage own addresses" ON public.addresses FOR ALL USING (
  auth.uid() = user_id
);

CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT USING (
  public.customer_owns_order(order_id, auth.uid())
);
