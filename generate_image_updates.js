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

// Improved matching
function matchImage(product, allFiles) {
  let bestMatch = null;
  let bestScore = 0;

  let targetTokens = product.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
  if (product.brand) {
     targetTokens.push(...product.brand.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean));
  }
  
  // Custom heuristics for better matching based on project domain
  const productStr = targetTokens.join(' ');
  
  for (const filePath of allFiles) {
    let fileName = path.basename(filePath, path.extname(filePath)).toLowerCase().replace(/-/g, ' ');
    
    // Add specific brand prefixes to filename if implied
    if (filePath.includes('kim-') || filePath.includes('kimirica')) fileName += ' kimirica';
    if (filePath.includes('mae-') || filePath.includes('mamaearth')) fileName += ' mamaearth';
    if (filePath.includes('twc-') || filePath.includes('the-womans-company')) fileName += ' the womans company';

    let score = similarity(productStr, fileName);
    
    // If the filename contains major keywords of the product, boost score
    const importantWords = productStr.split(' ').filter(w => w.length > 3);
    const hasImportant = importantWords.some(w => fileName.includes(w));
    if (hasImportant) score += 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = filePath;
    }
  }

  if (bestScore >= 0.4) {
    return { path: bestMatch, score: bestScore };
  }
  return null;
}

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const assetDir = path.resolve('public/assets/images/products');
  const allFiles = getFiles(assetDir);

  let totalIncorrect = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let reportLines = [];
  let sqlLines = [];

  for (const p of products) {
    const currentUrl = p.image_url;
    let isIncorrect = false;

    if (!currentUrl || currentUrl.includes('dummyjson.com') || currentUrl.includes('placeholder') || currentUrl.includes('pexels') || currentUrl.includes('shopify')) {
      isIncorrect = true;
    } else if (currentUrl.startsWith('/assets/')) {
      const localPath = path.join('public', currentUrl);
      if (!fs.existsSync(localPath)) isIncorrect = true;
    } else {
      isIncorrect = true;
    }

    if (isIncorrect) {
      totalIncorrect++;
      const match = matchImage(p, allFiles);
      if (match) {
        let relativePath = match.path.replace(path.resolve('public'), '').replace(/\\/g, '/');
        totalUpdated++;
        reportLines.push(`| ${p.name} | ${currentUrl || 'null'} | ${relativePath} |`);
        sqlLines.push(`UPDATE products SET image_url = '${relativePath}' WHERE id = '${p.id}';`);
      } else {
        totalSkipped++;
      }
    }
  }

  const report = `# Product Image Fix Report

- **Total products scanned**: ${products.length}
- **Total incorrect images found**: ${totalIncorrect}
- **Total images updated**: ${totalUpdated}
- **Products skipped (no match)**: ${totalSkipped}

## Updates Made

| Product Name | Before (Incorrect) | After (Corrected) |
|---|---|---|
${reportLines.join('\n')}
`;

  fs.writeFileSync('image_fix_report.md', report);
  fs.writeFileSync('image_updates.sql', sqlLines.join('\n'));
  console.log("Done.");
}

run();
