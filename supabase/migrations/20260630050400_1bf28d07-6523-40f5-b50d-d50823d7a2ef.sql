
-- Fix search_path on trigger function
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten the always-true INSERT policies (still allow guest checkout, but require fields)
DROP POLICY IF EXISTS "orders insert anyone" ON public.orders;
CREATE POLICY "orders insert valid" ON public.orders FOR INSERT
  WITH CHECK (
    customer_name IS NOT NULL AND length(customer_name) > 0
    AND customer_email IS NOT NULL AND customer_email ~ '@'
    AND address IS NOT NULL AND length(address) > 0
    AND (customer_id IS NULL OR customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "items insert anyone" ON public.order_items;
CREATE POLICY "items insert valid" ON public.order_items FOR INSERT
  WITH CHECK (
    product_name IS NOT NULL AND quantity > 0 AND unit_price >= 0
  );
