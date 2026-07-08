import { createClient } from "npm:@supabase/supabase-js@2.44.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRODUCT_SELECT =
  "id, name, price, mrp, stock, image_url, slug, description, tags, status, brands:brand_id ( name ), categories:category_id ( name )";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: body } = await req.json().catch(() => ({ data: {} }));
    const action = body?.action || 'list';

    if (action === 'get_by_id') {
      const idOrSlug = body.id;
      if (!idOrSlug) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      let q = supabaseClient.from("products").select(PRODUCT_SELECT).eq("status", "active");
      q = isUuid ? q.eq("id", idOrSlug) : q.eq("slug", idOrSlug);
      
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Default 'list' action
    const { data, error } = await supabaseClient
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .order('name');
      
    if (error) throw error;
    
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
