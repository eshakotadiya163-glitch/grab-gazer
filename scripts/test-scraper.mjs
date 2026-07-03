import { JSDOM } from 'jsdom';
import https from 'https';

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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

async function searchImage(query) {
  try {
    // Try Yahoo Image Search
    const searchUrl = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
    const res = await fetchHTML(searchUrl);
    
    if (res.status === 200 && res.data) {
      const dom = new JSDOM(res.data);
      const imgs = dom.window.document.querySelectorAll('img');
      for (const img of imgs) {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && src.startsWith('http') && !src.includes('yimg.com/a/i/')) {
          return src;
        }
      }
    }
  } catch(e) {
    console.error("Error searching", e);
  }
  return null;
}

async function main() {
  const queries = [
    "Mamaearth Skin Illuminate Face Cream pack",
    "The Woman Company Teen Pad 240MM"
  ];
  for (const q of queries) {
    const img = await searchImage(q);
    console.log(`[${q}] -> ${img}`);
  }
}
main();
