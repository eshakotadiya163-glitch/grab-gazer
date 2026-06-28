import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

const TWC = [
  { url: 'https://thewomancompany.in/products/coffee-body-scrub', name: 'twc-coffee-body-scrub.jpg' },
  { url: 'https://thewomancompany.in/products/skin-brightening-cream', name: 'twc-skin-brightening-cream.jpg' },
  { url: 'https://thewomancompany.in/products/lip-lightening-scrub', name: 'twc-lip-lightening-scrub.jpg' },
  { url: 'https://thewomancompany.in/products/under-eye-cream', name: 'twc-under-eye-cream.jpg' },
  { url: 'https://thewomancompany.in/products/deodorant-lightening-roll-on', name: 'twc-deodorant-lightening-roll-on.jpg' },
  { url: 'https://thewomancompany.in/products/vibe-tribe', name: 'twc-vibe-tribe.jpg' },
  { url: 'https://thewomancompany.in/products/eau-de-parfum-bawsy', name: 'twc-eau-de-parfum-bawsy.jpg' },
  { url: 'https://thewomancompany.in/products/eau-de-parfum-classy', name: 'twc-eau-de-parfum-classy.jpg' },
  { url: 'https://thewomancompany.in/products/eau-de-parfum-gutsy', name: 'twc-eau-de-parfum-gutsy.jpg' },
  { url: 'https://thewomancompany.in/products/eau-de-parfum-sassy', name: 'twc-eau-de-parfum-sassy.jpg' },
];

const KIM = [
  { url: 'https://www.kimirica.shop/products/kimirica-love-story-body-lotion', name: 'kim-love-story-body-lotion.jpg' },
  { url: 'https://www.kimirica.shop/products/vivah-turmeric-body-cream', name: 'kim-vivah-turmeric-body-cream.jpg' },
  { url: 'https://www.kimirica.shop/products/kimirica-five-elements-body-lotion', name: 'kim-five-elements-body-lotion.jpg' },
  { url: 'https://www.kimirica.shop/products/the-herbalist-body-lotion', name: 'kim-the-herbalist-body-lotion.jpg' },
  { url: 'https://www.kimirica.shop/products/kimirica-earth-body-lotion', name: 'kim-earth-body-lotion.jpg' },
  { url: 'https://www.kimirica.shop/products/kimirica-the-french-note-body-lotion', name: 'kim-the-french-note-body-lotion.jpg' },
  { url: 'https://www.kimirica.shop/products/the-souq-hand-body-wash', name: 'kim-the-souq-hand-body-wash.jpg' },
  { url: 'https://www.kimirica.shop/products/bella-amalfi-hand-body-wash', name: 'kim-bella-amalfi-hand-body-wash.jpg' },
  { url: 'https://www.kimirica.shop/products/lady-in-silver-bath-body-duo', name: 'kim-lady-in-silver-bath-body-duo.jpg' },
  { url: 'https://www.kimirica.shop/products/midnight-masquerade-bath-body-duo', name: 'kim-midnight-masquerade-bath-body-duo.jpg' },
];

const MAE = [
  { url: 'https://mamaearth.in/product/vitamin-c-face-wash/', name: 'mae-vitamin-c-face-wash.jpg' },
  { url: 'https://mamaearth.in/product/ubtan-face-wash/', name: 'mae-ubtan-face-wash.jpg' },
  { url: 'https://mamaearth.in/product/rice-face-wash/', name: 'mae-rice-face-wash.jpg' },
  { url: 'https://mamaearth.in/product/tea-tree-face-wash/', name: 'mae-tea-tree-face-wash.jpg' },
  { url: 'https://mamaearth.in/product/onion-hair-oil/', name: 'mae-onion-hair-oil.jpg' },
  { url: 'https://mamaearth.in/product/onion-shampoo/', name: 'mae-onion-shampoo.jpg' },
  { url: 'https://mamaearth.in/product/vitamin-c-body-lotion/', name: 'mae-vitamin-c-body-lotion.jpg' },
  { url: 'https://mamaearth.in/product/ubtan-body-wash/', name: 'mae-ubtan-body-wash.jpg' },
];

const ALL = [...TWC, ...KIM, ...MAE];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      let chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(filepath, buffer);
        resolve();
      });
    }).on('error', reject);
  });
};

const getOgImage = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const html = await res.text();
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || 
                       html.match(/<meta\s+name="og:image"\s+content="([^"]+)"/i) ||
                       html.match(/<img[^>]+src="([^"]+)"[^>]*>/i); // fallback to first image if no og
  if (ogImageMatch && ogImageMatch[1]) {
    let imgUrl = ogImageMatch[1];
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    return imgUrl;
  }
  throw new Error('No og:image found');
};

async function main() {
  const dir = path.join(process.cwd(), 'public', 'assets', 'images', 'products', 'real');
  await fs.mkdir(dir, { recursive: true });

  for (const item of ALL) {
    try {
      console.log(`Fetching ${item.url}...`);
      let imgUrl = await getOgImage(item.url);
      
      // Fix for some kimirica URLs that have query params
      if (imgUrl.includes('?')) imgUrl = imgUrl.split('?')[0];

      console.log(`Found image: ${imgUrl}`);
      const outPath = path.join(dir, item.name);
      await downloadImage(imgUrl, outPath);
      console.log(`Saved ${item.name}`);
    } catch (e) {
      console.error(`Failed ${item.name}: ${e.message}`);
    }
  }
}

main().catch(console.error);
