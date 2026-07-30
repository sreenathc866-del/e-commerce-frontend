-- fix_inventory_rls.sql

-- 1. Ensure RLS is enabled
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 2. Allow public to read inventory (so customers can see if items are in stock)
CREATE POLICY "Public inventory viewable" 
  ON public.inventory FOR SELECT 
  USING (true);

-- 3. Allow vendors to insert/update/delete their own products' inventory
CREATE POLICY "Vendors manage own inventory" 
  ON public.inventory FOR ALL 
  USING (
    product_id IN (
      SELECT id FROM public.products 
      WHERE shop_id IN (SELECT id FROM public.shops WHERE vendor_id = auth.uid())
    )
  ) 
  WITH CHECK (
    product_id IN (
      SELECT id FROM public.products 
      WHERE shop_id IN (SELECT id FROM public.shops WHERE vendor_id = auth.uid())
    )
  );

-- Explicitly refresh Schema Cache
NOTIFY pgrst, 'reload schema';
