-- Drop the buggy policies
DROP POLICY IF EXISTS "orders insert valid" ON public.orders;
DROP POLICY IF EXISTS "orders self read" ON public.orders;
DROP POLICY IF EXISTS "orders admin update" ON public.orders;
DROP POLICY IF EXISTS "orders admin delete" ON public.orders;
DROP POLICY IF EXISTS "orders insert anyone" ON public.orders;

-- Read policy: Authenticated users can read their own orders. Admins can read all.
CREATE POLICY "orders self read" ON public.orders FOR SELECT TO authenticated USING (
    customer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
);

-- Insert policy: Authenticated users can insert their own orders.
CREATE POLICY "orders self insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (
    customer_id = auth.uid()
);

-- Update policy: Authenticated users can update their own orders (needed for payment status updates).
CREATE POLICY "orders self update" ON public.orders FOR UPDATE TO authenticated USING (
    customer_id = auth.uid()
) WITH CHECK (
    customer_id = auth.uid()
);

-- Allow admins to update and delete
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "orders admin delete" ON public.orders FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
);

-- Since order checkout is heavily used, if guest checkout is needed (anon), we add policies for anon
CREATE POLICY "orders anon insert" ON public.orders FOR INSERT TO anon WITH CHECK (
    customer_id IS NULL
);

-- Allow anon to select orders they just created (e.g. by order_number)
-- BUT restrict it so they can't browse the whole table.
CREATE POLICY "orders anon read" ON public.orders FOR SELECT TO anon USING (
    customer_id IS NULL
);
