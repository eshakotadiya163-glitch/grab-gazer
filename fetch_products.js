import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('products').select('id, name, brand, image_url, category');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} products`);
  fs.writeFileSync('product_audit.json', JSON.stringify(data, null, 2));
}

run();
