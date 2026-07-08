import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env
const envStr = fs.readFileSync(path.resolve('.env'), 'utf-8');
const env = {};
envStr.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all files from the assets directory
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

// Simple string similarity (Jaccard on tokens)
function similarity(s1, s2) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
  const t1 = new Set(normalize(s1));
  const t2 = new Set(normalize(s2));
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersection = 0;
  for (const item of t1) {
    if (t2.has(item)) intersection++;
  }
  return intersection / Math.max(t1.size, t2.size); // using overlap or max to ensure high matching
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

  // Set a confidence threshold
  if (bestScore >= 0.5) { // 50% token overlap
    return { path: bestMatch, score: bestScore };
  }
  return null;
}

async function run() {
  console.log("Fetching products...");
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log(`Fetched ${products.length} products.`);

  const assetDir = path.resolve('public/assets/images/products');
  const allFiles = getFiles(assetDir);
  console.log(`Found ${allFiles.length} image files.`);

  let totalIncorrect = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let reportLines = [];

  for (const p of products) {
    const currentUrl = p.image_url;
    let isIncorrect = false;

    // Check if current URL is likely incorrect (e.g. from dummyjson or a generic placeholder)
    if (!currentUrl || currentUrl.includes('dummyjson.com') || currentUrl.includes('placeholder')) {
      isIncorrect = true;
    } else if (currentUrl.startsWith('/assets/')) {
      // It has a local path, let's verify if the file exists and is highly relevant
      const localPath = path.join('public', currentUrl);
      if (!fs.existsSync(localPath)) {
        isIncorrect = true;
      }
    } else {
      isIncorrect = true;
    }

    if (!isIncorrect) {
      // It might be correct, let's see if we have a better local match in 'real' directory anyway
      const currentFileName = path.basename(currentUrl, path.extname(currentUrl));
      const currentScore = similarity(`${p.name} ${p.brand || ''}`, currentFileName);
      if (currentScore < 0.4) {
        isIncorrect = true; // filename doesn't match product very well
      }
    }

    if (isIncorrect) {
      totalIncorrect++;
      const match = matchImage(p, allFiles);
      if (match) {
        // Convert to public URL
        let relativePath = match.path.replace(path.resolve('public'), '').replace(/\\/g, '/');
        
        // Update DB
        const { error: updateError } = await supabase.from('products').update({ image_url: relativePath }).eq('id', p.id);
        if (updateError) {
          console.error(`Failed to update ${p.name}:`, updateError);
        } else {
          totalUpdated++;
          reportLines.push(`| ${p.name} | ${currentUrl} | ${relativePath} |`);
        }
      } else {
        totalSkipped++;
        // console.log(`Skipped ${p.name} - no confident match`);
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
  console.log("Done. Check image_fix_report.md");
}

run();
