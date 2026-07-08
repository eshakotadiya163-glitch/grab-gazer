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

function extractImageBrand(filename, folderPath) {
  const lower = filename.toLowerCase() + ' ' + folderPath.toLowerCase();
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
  let sqlLines = [];
  
  let autoUpdates = [];
  let manualReviews = [];
  let noMatches = [];

  for (const p of products) {
    const currentUrl = p.image_url;
    let isIncorrect = false;

    if (currentUrl && currentUrl.startsWith('/assets/')) {
      const localPath = path.resolve('public' + currentUrl);
      if (!fs.existsSync(localPath)) isIncorrect = true;
    } else {
      isIncorrect = true;
    }

    if (!isIncorrect) {
      continue; // Skip products with already correct local images (though in our case all are dummy URLs currently)
    }

    let bestMatch = null;
    let bestScore = 0;
    const productBrand = getProductBrand(p.brand);
    
    const targetTokens = p.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
    if (p.brand) {
       targetTokens.push(...p.brand.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean));
    }
    const productStr = targetTokens.join(' ');

    for (const filePath of allFiles) {
      if (usedImages.has(filePath)) continue;

      const fileName = path.basename(filePath, path.extname(filePath));
      const imageBrand = extractImageBrand(fileName, filePath);

      if (productBrand && imageBrand && productBrand !== imageBrand) {
        continue;
      }

      let searchStr = fileName.toLowerCase().replace(/-/g, ' ');
      // Include folder names in search string for context
      const folderName = path.basename(path.dirname(filePath)).toLowerCase();
      searchStr += ' ' + folderName;
      
      if (imageBrand) searchStr += ' ' + imageBrand.toLowerCase();

      let score = similarity(productStr, searchStr);
      
      // Substring bonus
      const importantWords = productStr.split(' ').filter(w => w.length > 3);
      const hasImportant = importantWords.some(w => searchStr.includes(w));
      if (hasImportant) score += 0.2;

      // Partial keyword bonus (e.g. face wash vs facewash)
      if (productStr.includes(fileName.replace(/-/g, ''))) score += 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = filePath;
      }
    }

    if (bestMatch) {
      let relativePath = bestMatch.replace(path.resolve('public'), '').replace(/\\/g, '/');
      
      if (bestScore >= 0.75) {
        usedImages.add(bestMatch);
        autoUpdates.push(`| ${p.name} | ${p.brand || 'N/A'} | ${relativePath} | ${(bestScore).toFixed(2)} |`);
        sqlLines.push(`UPDATE products SET image_url = '${relativePath}' WHERE id = '${p.id}';`);
      } else if (bestScore >= 0.60) {
        manualReviews.push(`| ${p.name} | ${p.brand || 'N/A'} | ${relativePath} | ${(bestScore).toFixed(2)} | Score is below 0.75 threshold |`);
      } else {
        noMatches.push(`| ${p.name} | ${p.brand || 'N/A'} | Best score was ${(bestScore).toFixed(2)} (< 0.60) |`);
      }
    } else {
      noMatches.push(`| ${p.name} | ${p.brand || 'N/A'} | No match found (brand mismatch or no file) |`);
    }
  }

  const report = `# Refined Product Image Fix Report

- **Total incorrect images scanned**: ${autoUpdates.length + manualReviews.length + noMatches.length}
- **Automatic Updates (≥ 0.75)**: ${autoUpdates.length}
- **Manual Review Candidates (0.60 - 0.75)**: ${manualReviews.length}
- **No Match Found (< 0.60)**: ${noMatches.length}

## 1. Automatic Updates (≥ 0.75)

| Product Name | Brand | Proposed Image | Confidence Score |
|---|---|---|---|
${autoUpdates.join('\n')}

## 2. Manual Review Candidates (0.60–0.75)

| Product Name | Brand | Proposed Image | Confidence Score | Reason |
|---|---|---|---|---|
${manualReviews.join('\n')}

## 3. No Match Found (< 0.60)

| Product Name | Brand | Reason |
|---|---|---|
${noMatches.join('\n')}
`;

  fs.writeFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/image_fix_report.md', report);
  fs.writeFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/image_updates.sql', sqlLines.join('\n'));
  console.log("Done.");
}

run();
