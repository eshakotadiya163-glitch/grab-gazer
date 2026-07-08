import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand_id, category_id, image_url, status, slug, brands (name), categories (name)');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log(`Fetched ${products.length} products`);
  const suspicious = products.filter(p => {
    const brand = p.brands?.name || '';
    const cat = p.categories?.name || '';
    
    // Check Mamaearth, The Woman Company, Kimirica, and Pads
    if (['Mamaearth', 'The Woman Company', 'Kimirica'].includes(brand) || cat === 'Pads') {
      const img = p.image_url;
      if (!img) return true;
      if (img.includes('placeholder')) return true;
      if (img.includes('images.unsplash.com')) return true;
      if (img.includes('plus.unsplash.com')) return true;
      // Let's just list all products from these brands/categories to review manually.
      return true;
    }
    return false;
  });

  console.log(`Found ${suspicious.length} products to check for those brands/categories.`);
  for (const p of suspicious) {
    console.log(`[${p.brands?.name || 'No Brand'}] [${p.categories?.name || 'No Cat'}] ${p.name} -> ${p.image_url}`);
  }
}

run();
