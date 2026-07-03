-- Ensure unauthenticated shop visitors can read the public catalog.
-- Idempotent: safe to re-run if policies already exist.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "brands public read" ON public.brands;
CREATE POLICY "brands public read"
  ON public.brands
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "categories public read" ON public.categories;
CREATE POLICY "categories public read"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);
