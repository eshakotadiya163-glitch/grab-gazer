
-- Helper: does a vendor (user) own any product in this order? SECURITY DEFINER avoids RLS recursion.
CREATE OR REPLACE FUNCTION public.user_is_order_vendor(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.vendors  v ON v.id = p.vendor_id
    WHERE oi.order_id = _order_id AND v.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.user_owns_order(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders WHERE id = _order_id AND customer_id = _user_id)
$$;

-- Reset orders policies
DROP POLICY IF EXISTS "orders self read"    ON public.orders;
DROP POLICY IF EXISTS "orders admin update" ON public.orders;
DROP POLICY IF EXISTS "orders admin delete" ON public.orders;
DROP POLICY IF EXISTS "orders insert valid" ON public.orders;

CREATE POLICY "orders select own or admin or vendor"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.user_is_order_vendor(id, auth.uid())
  );

CREATE POLICY "orders insert self"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_name IS NOT NULL AND length(customer_name) > 0
    AND customer_email IS NOT NULL AND customer_email ~ '@'
    AND address IS NOT NULL AND length(address) > 0
    AND (customer_id IS NULL OR customer_id = auth.uid())
  );

CREATE POLICY "orders update own or admin"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "orders delete admin"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Reset order_items policies (no cross-table subquery)
DROP POLICY IF EXISTS "items read"         ON public.order_items;
DROP POLICY IF EXISTS "items admin manage" ON public.order_items;
DROP POLICY IF EXISTS "items insert valid" ON public.order_items;

CREATE POLICY "order_items select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.user_owns_order(order_id, auth.uid())
    OR public.user_is_order_vendor(order_id, auth.uid())
  );

CREATE POLICY "order_items insert"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    product_name IS NOT NULL AND quantity > 0 AND unit_price >= 0
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.user_owns_order(order_id, auth.uid())
    )
  );

CREATE POLICY "order_items update admin"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "order_items delete admin"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
