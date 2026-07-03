import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://bgsgkmzwenjbgtexinfp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAPPING = {
  // TWC
  'twc-teen-pad': 'teen-pad-240-mm',
  'twc-bamboo-razors': 'bamboo-razors',
  'twc-menstrual-cups': 'menstrual-cups',
  'twc-stand-pee': 'stand-and-pee-sticks', // Was missing in previous script, try to guess
  'twc-tampons': 'tampons-without-applicator',
  // Mamaearth
  'mae-cr-illuminate': 'skin-illuminate-face-cream', // Guessing
  'mae-cr-undereye': 'under-eye-cream',
  'mae-moist-rice': 'rice-oil-free-face-moisturizer', // Guessing
  'mae-sun-aloe': 'aloe-vera-sunscreen-spf-50', // Guessing
  'mae-mask-ubtan': 'ubtan-face-mask', // Guessing
  'mae-mask-c3': 'c3-face-mask', // Guessing
  'mae-bl-vitc': 'vitamin-c-body-lotion',
  'mae-bb-coco': 'coco-body-butter',
  'mae-mask-argan': 'argan-hair-mask', // Guessing
  'mae-mkp-lipcrayon': 'lip-crayon',
  'mae-mkp-lipbalm': 'strawberry-lip-balm'
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          resolve(null);
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return fetchHTML(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function findImage(brand, slug, originalName) {
  const realSlug = MAPPING[slug] || originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const base = brand === 'Mamaearth' ? 'https://mamaearth.in' : 'https://thewomancompany.in';
  
  // 1. Try JSON API
  const data = await fetchJSON(`${base}/products/${realSlug}.json`);
  if (data && data.product && data.product.images && data.product.images[0]) {
    return data.product.images[0].src;
  }
  
  // 2. Try HTML scraping
  const res = await fetchHTML(`${base}/products/${realSlug}`);
  if (res.status === 200 && res.data) {
    const match = res.data.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) {
      let img = match[1];
      if (img.startsWith('//')) img = 'https:' + img;
      return img;
    }
  }
  return null;
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, image_url, categories:category_id(name), brands:brand_id(name)');

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  const badProducts = products.filter(p => {
    const brand = p.brands?.name;
    const category = p.categories?.name;
    const isTarget = brand === 'Mamaearth' || brand === 'The Woman Company' || category === 'Menstrual & Intimate Care' || category === 'Pads';
    const isBad = !p.image_url || p.image_url.includes('pexels.com') || p.image_url.includes('placeholder');
    return isTarget && isBad;
  });

  const updates = [];
  const manualUploads = [];

  for (const p of badProducts) {
    let newImageUrl = await findImage(p.brands?.name, p.slug, p.name);

    if (newImageUrl) {
      if (newImageUrl.startsWith('http://')) newImageUrl = newImageUrl.replace('http://', 'https://');
      newImageUrl = newImageUrl.split('?')[0]; // Remove query params
      updates.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        old_image: p.image_url,
        new_image: newImageUrl
      });
    } else {
      manualUploads.push({ name: p.name, slug: p.slug, brand: p.brands?.name });
    }
  }

  // Generate SQL
  let sql = `-- Migration to fix product images using official HTTPS URLs\n`;
  sql += `-- Auto-generated script\n\n`;
  for (const u of updates) {
    sql += `UPDATE public.products SET image_url = '${u.new_image}' WHERE slug = '${u.slug}';\n`;
  }
  
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const sqlPath = path.join('supabase', 'migrations', `${timestamp}_fix_product_images.sql`);
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, sql);

  // Generate CSV
  let csv = 'Product Name,Slug,Current Image URL,New Image URL\n';
  for (const u of updates) {
    csv += `"${u.name.replace(/"/g, '""')}","${u.slug}","${u.old_image || ''}","${u.new_image}"\n`;
  }
  const csvPath = 'bad_images_mapping.csv';
  fs.writeFileSync(csvPath, csv);

  // Print Summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total Mamaearth products checked: ${badProducts.filter(p => p.brands?.name === 'Mamaearth').length}`);
  console.log(`Total The Woman Company products checked: ${badProducts.filter(p => p.brands?.name === 'The Woman Company' || p.categories?.name === 'Menstrual & Intimate Care').length}`);
  console.log(`Images updated successfully (SQL/CSV generated): ${updates.length}`);
  console.log(`Failed updates (Need manual upload): ${manualUploads.length}`);
}

main().catch(console.error);
