import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function similarity(s1, s2) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
  const t1 = new Set(normalize(s1));
  const t2 = new Set(normalize(s2));
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersection = 0;
  for (const item of t1) {
    if (t2.has(item)) intersection++;
  }
  return intersection / Math.max(t1.size, t2.size);
}

function matchImage(product, allFiles) {
  let bestMatch = null;
  let bestScore = 0;
  const targetTokens = product.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
  if (product.brand) {
     targetTokens.push(...product.brand.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean));
  }
  const targetStr = targetTokens.join(' ');

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const score = similarity(targetStr, fileName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = filePath;
    }
  }
  if (bestScore >= 0.6) {
    return { path: bestMatch, score: bestScore };
  }
  return null;
}

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const assetDir = path.resolve('public/assets/images/products');
  const allFiles = getFiles(assetDir);

  let totalChecked = products.length;
  let totalFixed = 0;
  let totalSkipped = 0;

  for (const p of products) {
    const currentUrl = p.image_url;
    let isValidLocally = false;
    
    if (currentUrl) {
       // Convert URL like /assets/images/products/file.png to local path
       const localPath = path.join(process.cwd(), 'public', currentUrl.replace(/^\//, '').replace(/\//g, path.sep));
       if (fs.existsSync(localPath)) {
         isValidLocally = true;
       }
    }

    if (!isValidLocally || currentUrl.includes('dummyjson')) {
      const match = matchImage(p, allFiles);
      if (match) {
        let relativeUrl = match.path.replace(path.resolve('public'), '').replace(/\\/g, '/');
        if (!relativeUrl.startsWith('/')) relativeUrl = '/' + relativeUrl;
        
        await supabase.from('products').update({ image_url: relativeUrl }).eq('id', p.id);
        totalFixed++;
      } else {
        totalSkipped++;
      }
    }
  }

  console.log(JSON.stringify({ totalChecked, totalFixed, totalSkipped }));
}

run();
