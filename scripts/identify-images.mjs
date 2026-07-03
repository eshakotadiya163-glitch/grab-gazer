import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bgsgkmzwenjbgtexinfp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU";

// NOTE: We need the service role key to update the database or upload to storage, 
// or we can use the anon key if RLS allows it. Let's see if we have a service role key in .env.
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');
let serviceRoleKey = null;
for (const line of lines) {
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceRoleKey = line.split('=')[1].replace(/"/g, '').trim();
  }
}

console.log("Has service role key:", !!serviceRoleKey);

const supabase = createClient(SUPABASE_URL, serviceRoleKey || SUPABASE_KEY);

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, image_url, categories:category_id(name), brands:brand_id(name)');

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  const targetProducts = products.filter(p => {
    const brand = p.brands?.name;
    const category = p.categories?.name;
    return brand === 'Mamaearth' || brand === 'The Woman Company' || category === 'Pads';
  });

  console.log(`Found ${targetProducts.length} target products.`);

  for (const p of targetProducts) {
    console.log(`[${p.brands?.name || 'No Brand'}] [${p.categories?.name || 'No Cat'}] ${p.name}`);
    console.log(`  -> ${p.image_url}`);
  }
}

main().catch(console.error);
