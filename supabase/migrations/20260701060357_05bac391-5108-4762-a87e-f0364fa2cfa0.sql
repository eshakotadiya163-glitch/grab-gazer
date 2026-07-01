-- Ensure public catalog tables are reachable by anon/authenticated via PostgREST
GRANT SELECT ON public.brands     TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products   TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT ON public.banners    TO anon, authenticated;
GRANT SELECT ON public.vendors    TO anon, authenticated;
GRANT SELECT ON public.reviews    TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.brands, public.categories, public.products,
      public.blog_posts, public.banners, public.coupons, public.vendors,
      public.reviews, public.orders, public.order_items, public.addresses,
      public.profiles, public.user_roles
  TO authenticated;

GRANT INSERT ON public.orders, public.order_items TO anon;

GRANT ALL ON public.brands, public.categories, public.products, public.blog_posts,
      public.banners, public.coupons, public.vendors, public.reviews,
      public.orders, public.order_items, public.addresses, public.profiles,
      public.user_roles
  TO service_role;