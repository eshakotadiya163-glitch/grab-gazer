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

function extractImageBrand(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('kim-') || lower.includes('kimirica')) return 'Kimirica';
  if (lower.includes('mae-') || lower.includes('mae2-') || lower.includes('mamaearth')) return 'Mamaearth';
  if (lower.includes('twc-') || lower.includes('the-womans-company') || lower.includes('twc')) return "The Woman's Company";
  return null;
}

function getProductBrand(brand) {
  if (!brand) return null;
  const lower = brand.toLowerCase();
  if (lower.includes('kimirica')) return 'Kimirica';
  if (lower.includes('mamaearth')) return 'Mamaearth';
  if (lower.includes("the woman's company") || lower.includes('twc')) return "The Woman's Company";
  return brand;
}

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const assetDir = path.resolve('public/assets/images/products');
  const allFiles = getFiles(assetDir);

  let usedImages = new Set();
  
  let totalIncorrect = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let reportLines = [];
  let sqlLines = [];

  for (const p of products) {
    const currentUrl = p.image_url;
    let isIncorrect = false;

    // Check if currentUrl is valid local asset
    if (currentUrl && currentUrl.startsWith('/assets/')) {
      const localPath = path.resolve('public' + currentUrl);
      if (fs.existsSync(localPath)) {
        isIncorrect = false;
      } else {
        isIncorrect = true;
      }
    } else {
      isIncorrect = true;
    }

    if (isIncorrect) {
      totalIncorrect++;
      
      let bestMatch = null;
      let bestScore = 0;
      const productBrand = getProductBrand(p.brand);
      
      const targetTokens = p.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
      if (p.brand) {
         targetTokens.push(...p.brand.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean));
      }
      const productStr = targetTokens.join(' ');

      for (const filePath of allFiles) {
        if (usedImages.has(filePath)) continue; // One image file per product

        const fileName = path.basename(filePath, path.extname(filePath));
        const imageBrand = extractImageBrand(fileName);

        // Require exact brand match if the image has a recognizable brand
        // If image has no brand in filename, we might be more strict or allow it if score is extremely high.
        // The user says: "Require an exact brand match before assigning an image."
        if (productBrand && imageBrand && productBrand !== imageBrand) {
          continue;
        }
        if (productBrand && !imageBrand) {
           // Skip if image brand cannot be determined to avoid cross-brand assignments
           // But what if it's a generic name? Let's allow if the score is very high, or strict block?
           // "If the product brand and image brand do not match, skip the product."
           continue; 
        }

        let searchStr = fileName.toLowerCase().replace(/-/g, ' ');
        if (imageBrand) searchStr += ' ' + imageBrand.toLowerCase();

        let score = similarity(productStr, searchStr);
        
        // Exact substring match bonus
        const importantWords = productStr.split(' ').filter(w => w.length > 3);
        const hasImportant = importantWords.some(w => searchStr.includes(w));
        if (hasImportant) score += 0.2;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = filePath;
        }
      }

      if (bestScore >= 0.75 && bestMatch) {
        usedImages.add(bestMatch);
        let relativePath = bestMatch.replace(path.resolve('public'), '').replace(/\\/g, '/');
        totalUpdated++;
        reportLines.push(`| ${p.name} | ${p.brand || 'N/A'} | ${currentUrl || 'null'} | ${relativePath} | ${(bestScore).toFixed(2)} |`);
        sqlLines.push(`UPDATE products SET image_url = '${relativePath}' WHERE id = '${p.id}';`);
      } else {
        totalSkipped++;
        reportLines.push(`| ${p.name} | ${p.brand || 'N/A'} | ${currentUrl || 'null'} | **SKIPPED (Score: ${bestScore.toFixed(2)})** | - |`);
      }
    }
  }

  const report = `# Strict Product Image Fix Report

- **Total products scanned**: ${products.length}
- **Total incorrect images found**: ${totalIncorrect}
- **Total images updated**: ${totalUpdated}
- **Products skipped (no match or low confidence)**: ${totalSkipped}

## Preview Updates

| Product Name | Brand | Current Image | Proposed Image | Confidence Score |
|---|---|---|---|---|
${reportLines.join('\n')}
`;

  fs.writeFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/image_fix_report.md', report);
  fs.writeFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/image_updates.sql', sqlLines.join('\n'));
  console.log("Done. Check artifacts.");
}

run();
