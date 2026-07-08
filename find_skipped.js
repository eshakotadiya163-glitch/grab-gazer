import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envStr = fs.readFileSync(path.resolve('.env'), 'utf-8');
const env = {};
envStr.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const skipped = products.filter(p => !p.image_url || !p.image_url.startsWith('/assets/'));
  fs.writeFileSync('skipped.json', JSON.stringify(skipped.map(p => ({id: p.id, name: p.name, brand: p.brand, url: p.image_url})), null, 2));
  console.log('Skipped count:', skipped.length);
}
run();
