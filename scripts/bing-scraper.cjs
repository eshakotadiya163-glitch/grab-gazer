const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bgsgkmzwenjbgtexinfp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const badProducts = [
  { name: 'Skin Illuminate Face Cream', slug: 'mae-cr-illuminate', brand: 'Mamaearth' },
  { name: 'Under Eye Cream', slug: 'mae-cr-undereye', brand: 'Mamaearth' },
  { name: 'Rice Oil-Free Face Moisturizer', slug: 'mae-moist-rice', brand: 'Mamaearth' },
  { name: 'Aloe Vera Sunscreen SPF 55', slug: 'mae-sun-aloe', brand: 'Mamaearth' },
  { name: 'Ubtan Face Mask', slug: 'mae-mask-ubtan', brand: 'Mamaearth' },
  { name: 'C3 Face Mask', slug: 'mae-mask-c3', brand: 'Mamaearth' },
  { name: 'Vitamin C Body Lotion', slug: 'mae-bl-vitc', brand: 'Mamaearth' },
  { name: 'Coco Body Butter', slug: 'mae-bb-coco', brand: 'Mamaearth' },
  { name: 'Argan Hair Mask', slug: 'mae-mask-argan', brand: 'Mamaearth' },
  { name: 'Lip Crayon Pink Burst', slug: 'mae-mkp-lipcrayon', brand: 'Mamaearth' },
  { name: 'Strawberry Lip Balm', slug: 'mae-mkp-lipbalm', brand: 'Mamaearth' },
  { name: 'Teen Pad 240MM', slug: 'twc-teen-pad', brand: 'The Woman Company' },
  { name: 'Bamboo Razors', slug: 'twc-bamboo-razors', brand: 'The Woman Company' },
  { name: 'Menstrual Cups', slug: 'twc-menstrual-cups', brand: 'The Woman Company' },
  { name: 'Stand And Pee Sticks', slug: 'twc-stand-pee', brand: 'The Woman Company' },
  { name: 'Tampons Without Applicator', slug: 'twc-tampons', brand: 'The Woman Company' }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const updates = [];
  
  for (const p of badProducts) {
    const query = `${p.brand} ${p.name} bigbasket nykaa amazon`;
    console.log(`Searching for: ${query}`);
    
    // Use Bing image search
    await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`);
    
    try {
      // Wait for images to load
      await page.waitForSelector('img.mimg', { timeout: 10000 });
      
      // Get the first few images and find a good one
      const imgSrc = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img.mimg');
        for (let img of imgs) {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || img.src;
          if (src && src.startsWith('http') && !src.includes('base64')) {
            return src;
          }
        }
        return null;
      });
      
      if (imgSrc) {
        console.log(`  -> Found: ${imgSrc}`);
        updates.push({ ...p, new_image: imgSrc });
      } else {
        console.log(`  -> Not found`);
      }
    } catch (e) {
      console.log(`  -> Error: ${e.message}`);
    }
  }
  
  await browser.close();
  
  // Generate SQL
  let sql = `-- Migration to fix product images using Bing visual search URLs\n\n`;
  for (const u of updates) {
    sql += `UPDATE public.products SET image_url = '${u.new_image}' WHERE slug = '${u.slug}';\n`;
  }
  
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const sqlPath = path.join('supabase', 'migrations', `${timestamp}_fix_product_images_bing.sql`);
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, sql);
  
  // Generate Report
  let report = '# Image Replacement Report (Visual Search)\n\n';
  report += '## Products Changed\n';
  for (const u of updates) {
    report += `- **${u.name}**: Found matching image.\n`;
  }
  report += '\n## Products Unmatched\n';
  for (const p of badProducts) {
    if (!updates.find(u => u.slug === p.slug)) {
      report += `- **${p.name}**\n`;
    }
  }
  fs.writeFileSync('image_replacement_report.md', report);
  
  console.log('Done!');
}

main();
