-- ============================================================
-- Migration: Complete Orders System Fix
-- Fixes: RLS policies, adds stock deduction trigger,
--        fixes order_items policies, fixes admin access
-- ============================================================

-- ── 1. Drop ALL old conflicting policies on orders ──────────
DROP POLICY IF EXISTS "orders insert valid"   ON public.orders;
DROP POLICY IF EXISTS "orders insert anyone"  ON public.orders;
DROP POLICY IF EXISTS "orders self read"      ON public.orders;
DROP POLICY IF EXISTS "orders admin update"   ON public.orders;
DROP POLICY IF EXISTS "orders admin delete"   ON public.orders;
DROP POLICY IF EXISTS "orders self insert"    ON public.orders;
DROP POLICY IF EXISTS "orders self update"    ON public.orders;
DROP POLICY IF EXISTS "orders anon insert"    ON public.orders;
DROP POLICY IF EXISTS "orders anon read"      ON public.orders;

-- ── 2. Clean order_items policies ──────────────────────────
DROP POLICY IF EXISTS "items insert anyone"   ON public.order_items;
DROP POLICY IF EXISTS "items insert valid"    ON public.order_items;
DROP POLICY IF EXISTS "items read"            ON public.order_items;
DROP POLICY IF EXISTS "items admin manage"    ON public.order_items;

-- ── 3. Create clean, correct policies on orders ─────────────

-- Authenticated users can read their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated
  USING ( customer_id = auth.uid() );

-- Admins can read all orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT TO authenticated
  USING ( public.has_role(auth.uid(), 'admin') );

-- Authenticated users can insert their own orders (customer_id must match their UID)
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK ( customer_id = auth.uid() );

-- Authenticated users can update their own orders (needed for Razorpay callback updating payment_status)
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE TO authenticated
  USING ( customer_id = auth.uid() )
  WITH CHECK ( customer_id = auth.uid() );

-- Admins can update any order
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE TO authenticated
  USING ( public.has_role(auth.uid(), 'admin') )
  WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- Admins can delete orders
CREATE POLICY "orders_delete_admin" ON public.orders
  FOR DELETE TO authenticated
  USING ( public.has_role(auth.uid(), 'admin') );

-- ── 4. Create clean policies on order_items ─────────────────

-- Users can read items for their own orders
CREATE POLICY "items_select_own" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "items_select_admin" ON public.order_items
  FOR SELECT TO authenticated
  USING ( public.has_role(auth.uid(), 'admin') );

-- Authenticated users can insert order items (order must belong to them)
CREATE POLICY "items_insert_own" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "items_manage_admin" ON public.order_items
  FOR ALL TO authenticated
  USING ( public.has_role(auth.uid(), 'admin') )
  WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- ── 5. Grant anon role INSERT on orders table for guest checkout ──
-- (anon users need this for the INSERT to reach RLS check level)
-- Note: No anon RLS policy, so anon inserts will be blocked by RLS (correct behavior for authenticated-only checkout)
REVOKE INSERT ON public.orders FROM anon;
REVOKE INSERT ON public.order_items FROM anon;

-- ── 6. Stock deduction trigger ───────────────────────────────
-- Decrement product stock when an order_item is inserted
CREATE OR REPLACE FUNCTION public.tg_decrement_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - NEW.quantity)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS order_items_decrement_stock ON public.order_items;

CREATE TRIGGER order_items_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  WHEN (NEW.product_id IS NOT NULL)
  EXECUTE FUNCTION public.tg_decrement_stock();
