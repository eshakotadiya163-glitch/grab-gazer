import { JSDOM } from 'jsdom';
import https from 'https';

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
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

async function searchDuckDuckGo(query) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' nykaa or amazon product image')}`;
    const res = await fetchHTML(searchUrl);
    
    if (res.status === 200 && res.data) {
      // Look for any standard image URL in the raw HTML just in case
      const matches = res.data.match(/https:\/\/[^"'\s]+\.(?:jpg|png|jpeg)/ig);
      if (matches) {
        // filter out duckduckgo icons
        const valid = matches.filter(m => !m.includes('duckduckgo') && !m.includes('favicon'));
        if (valid.length > 0) return valid[0];
      }
    }
  } catch(e) {
    console.error("Error searching", e);
  }
  return null;
}

async function main() {
  const queries = [
    "Mamaearth Skin Illuminate Face Cream",
    "The Woman Company Teen Pad 240MM",
    "The Woman Company Bamboo Razors",
    "Mamaearth Lip Crayon Pink Burst"
  ];
  for (const q of queries) {
    const img = await searchDuckDuckGo(q);
    console.log(`[${q}] -> ${img}`);
  }
}
main();
