const fs = require('fs');

const lines = fs.readFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/image_fix_report.md', 'utf-8').split('\n');
let inManual = false;
const candidates = [];

for (const line of lines) {
  if (line.startsWith('## 2. Manual Review')) inManual = true;
  else if (line.startsWith('## 3. No Match')) inManual = false;
  else if (inManual && line.startsWith('|') && !line.includes('Product Name') && !line.includes('---|')) {
    const cols = line.split('|').map(s => s.trim());
    if (cols.length >= 5) {
      candidates.push({ name: cols[1], brand: cols[2], proposed: cols[3], score: cols[4] });
    }
  }
}

const outputLines = [];

candidates.forEach(c => {
  const pTokens = c.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);
  const fname = c.proposed.split('/').pop().replace('.jpg', '').replace('.png', '').replace(/-/g, ' ');
  const fTokens = fname.toLowerCase().split(' ').filter(Boolean);
  
  const missingInFile = pTokens.filter(t => !fTokens.includes(t));
  const extraInFile = fTokens.filter(t => !pTokens.includes(t));
  
  outputLines.push(`### ${c.name}`);
  outputLines.push(`- **Brand**: ${c.brand}`);
  outputLines.push(`- **Proposed Image**: \`${c.proposed}\``);
  outputLines.push(`- **Matched Filename**: \`${c.proposed.split('/').pop()}\``);
  outputLines.push(`- **Confidence Score**: ${c.score}`);
  outputLines.push(`- **Reason (< 0.75)**: The product name contains [${missingInFile.join(', ')}] which are missing from the filename, and the filename contains [${extraInFile.join(', ')}] which are not in the product name.`);
  outputLines.push('');
});

fs.writeFileSync('C:/Users/eshak/.gemini/antigravity/brain/c33e25a4-cea1-439c-a41f-1b3c1c0de9da/manual_candidates_review.md', outputLines.join('\n'));
console.log('done');
