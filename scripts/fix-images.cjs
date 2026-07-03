const https = require('https')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://bgsgkmzwenjbgtexinfp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU'

const products = [
  // The Woman Company
  { name: 'Lip Lightening Scrub', slug: 'lip-lightening-scrub', base: 'https://thewomancompany.in/products/' },
  { name: 'Skin Brightening Cream', slug: 'skin-brightening-cream', base: 'https://thewomancompany.in/products/' },
  { name: 'Under Eye Cream', slug: 'under-eye-cream', base: 'https://thewomancompany.in/products/' },
  { name: 'Coffee Body Scrub', slug: 'coffee-body-scrub', base: 'https://thewomancompany.in/products/' },
  { name: 'Deodorant Lightening Roll On', slug: 'deodorant-lightening-roll-on', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Bawsy', slug: 'eau-de-parfum-bawsy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Classy', slug: 'eau-de-parfum-classy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Gutsy', slug: 'eau-de-parfum-gutsy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Sassy', slug: 'eau-de-parfum-sassy', base: 'https://thewomancompany.in/products/' },
  { name: 'Vibe Tribe Gift Set', slug: 'vibe-tribe', base: 'https://thewomancompany.in/products/' },
  { name: 'Bamboo Razors', slug: 'bamboo-razors', base: 'https://thewomancompany.in/products/' },
  { name: 'Menstrual Cups', slug: 'menstrual-cups', base: 'https://thewomancompany.in/products/' },
  { name: 'Tampons Without Applicator', slug: 'tampons-without-applicator', base: 'https://thewomancompany.in/products/' },
  { name: 'Teen Pad', slug: 'teen-pad', base: 'https://thewomancompany.in/products/' },
  // Kimirica
  { name: 'Love Story Body Lotion', slug: 'kimirica-love-story-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Five Elements Body Lotion', slug: 'kimirica-five-elements-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The French Note Body Lotion', slug: 'kimirica-the-french-note-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Earth Body Lotion', slug: 'kimirica-earth-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Herbalist Body Lotion', slug: 'the-herbalist-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Vivah Body Lotion', slug: 'vivah-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gulistan Body Lotion', slug: 'the-gulistan-hand-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Indian Apothecary Body Lotion', slug: 'the-indian-apothecary-hand-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Souq Body & Hand Wash', slug: 'the-souq-hand-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Bella Amalfi Body & Hand Wash', slug: 'bella-amalfi-hand-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Lady In Silver Bath & Body Duo', slug: 'lady-in-silver-bath-body-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Midnight Masquerade Bath & Body Duo', slug: 'midnight-masquerade-bath-body-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Love Story Body Wash & Lotion Duo', slug: 'love-story-body-wash-lotion-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Plum & Violet', slug: 'around-the-world-body-mist-plum-violet', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Rose & Peach', slug: 'around-the-world-body-mist-rose-peach', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Vanilla & Coconut', slug: 'around-the-world-body-mist-vanilla-coconut', base: 'https://www.kimirica.shop/products/' },
  // Mamaearth
  { name: 'Vitamin C Daily Glow Face Wash', slug: 'vitamin-c-daily-glow-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Ubtan Face Wash', slug: 'ubtan-face-wash-with-turmeric-saffron', base: 'https://mamaearth.in/products/' },
  { name: 'Rice Face Wash', slug: 'rice-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Tea Tree Face Wash', slug: 'tea-tree-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Hair Oil', slug: 'onion-hair-oil-for-hair-fall-control', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Shampoo', slug: 'onion-shampoo-for-hair-fall-control', base: 'https://mamaearth.in/products/' },
  { name: 'Vitamin C Body Lotion', slug: 'vitamin-c-body-lotion', base: 'https://mamaearth.in/products/' },
  { name: 'Charcoal Kajal', slug: 'charcoal-kajal', base: 'https://mamaearth.in/products/' },
]

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('JSON parse error')) }
      })
    }).on('error', reject)
  })
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject)
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

async function updateSupabase(productName, imagePath) {
  const url = `${SUPABASE_URL}/rest/v1/products?name=ilike.*${encodeURIComponent(productName)}*`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ image_url: imagePath })
  })
  return res.ok
}

async function main() {
  const outputDir = path.join('public', 'assets', 'images', 'products')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  for (const product of products) {
    try {
      console.log(`⏳ Fetching: ${product.name}`)
      const data = await fetchJSON(`${product.base}${product.slug}.json`)
      const imageUrl = data?.product?.images?.[0]?.src
      if (!imageUrl) { console.log(`  ❌ No image found`); continue }

      const filename = `${product.slug}.jpg`
      const filepath = path.join(outputDir, filename)
      await downloadImage(imageUrl, filepath)
      console.log(`  📥 Downloaded: ${filename}`)

      const localPath = `/assets/images/products/${filename}`
      const ok = await updateSupabase(product.name, localPath)
      console.log(`  ${ok ? '✅' : '❌'} DB updated: ${localPath}`)
    } catch (err) {
      console.log(`  ❌ Error for ${product.name}: ${err.message}`)
    }
  }
  console.log('\n🎉 All done!')
}

main()