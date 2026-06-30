
-- One-time admin bootstrap: anyone signed in can claim admin IFF no admin exists yet.
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;

-- Apply to be vendor: creates pending vendor row + adds vendor role (effective once approved by admin).
CREATE OR REPLACE FUNCTION public.apply_as_vendor(_store_name TEXT, _store_slug TEXT, _description TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID := auth.uid(); new_id UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.vendors(user_id, store_name, store_slug, description, status)
  VALUES (uid, _store_name, _store_slug, _description, 'pending')
  RETURNING id INTO new_id;
  INSERT INTO public.user_roles(user_id, role) VALUES (uid, 'vendor')
  ON CONFLICT DO NOTHING;
  RETURN new_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.apply_as_vendor(TEXT,TEXT,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_as_vendor(TEXT,TEXT,TEXT) TO authenticated;
