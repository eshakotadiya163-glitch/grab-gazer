const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://bgsgkmzwenjbgtexinfp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU'

const products = [
  // The Woman Company - Direct Image URLs
  { name: 'Coffee Body Scrub', slug: 'coffee-body-scrub', base: 'https://thewomancompany.in/products/' },
  { name: 'Deodorant Lightening Roll On', slug: 'deodorant-lightening-roll-on', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Bawsy', slug: 'eau-de-parfum-bawsy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Classy', slug: 'eau-de-parfum-classy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Gutsy', slug: 'eau-de-parfum-gutsy', base: 'https://thewomancompany.in/products/' },
  { name: 'EDP Sassy', slug: 'eau-de-parfum-sassy', base: 'https://thewomancompany.in/products/' },
  { name: 'Lip Lightening Scrub', slug: 'lip-lightening-scrub', base: 'https://thewomancompany.in/products/' },
  { name: 'Skin Brightening Cream', slug: 'skin-brightening-cream', base: 'https://thewomancompany.in/products/' },
  { name: 'Under Eye Cream', slug: 'under-eye-cream', base: 'https://thewomancompany.in/products/' },
  { name: 'Vibe Tribe Gift Set', slug: 'vibe-tribe', base: 'https://thewomancompany.in/products/' },
  { name: 'Bamboo Razors', slug: 'bamboo-razors', base: 'https://thewomancompany.in/products/' },
  { name: 'Menstrual Cups', slug: 'menstrual-cups', base: 'https://thewomancompany.in/products/' },
  { name: 'Tampons Without Applicator', slug: 'tampons-without-applicator', base: 'https://thewomancompany.in/products/' },
  { name: 'Teen Pad', slug: 'teen-pad-240-mm', base: 'https://thewomancompany.in/products/' },
  // Kimirica
  { name: 'Love Story Body Lotion', slug: 'kimirica-love-story-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Five Elements Body Lotion', slug: 'kimirica-five-elements-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The French Note Body Lotion', slug: 'kimirica-the-french-note-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Earth Body Lotion', slug: 'kimirica-earth-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Herbalist Body Lotion', slug: 'the-herbalist-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Vivah Body Lotion', slug: 'vivah-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gulistan Body Lotion', slug: 'the-gulistan-hand-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Indian Apothecary Body Lotion', slug: 'the-indian-apothecary-hand-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Pharmacopia Body Lotion', slug: 'pharmacopia-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Ignis Body Lotion', slug: 'kimirica-ignis-body-lotion', base: 'https://www.kimirica.shop/products/' },
  { name: 'Vivah Body Cream 100gm', slug: 'vivah-turmeric-body-cream', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gentleman Niacinamide Body Cream', slug: 'the-gentleman-niacinamide-body-cream', base: 'https://www.kimirica.shop/products/' },
  { name: 'The French Note Body Cream 100gm', slug: 'the-french-note-body-cream', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gulistan Body Cream 100gm', slug: 'the-gulistan-body-cream', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Indian Apothecary Body Wash', slug: 'the-indian-apothecary-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Moisturizing Body Wash', slug: 'around-the-world-moisturizing-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Clarifying Body Wash', slug: 'around-the-world-clarifying-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Renewing Body Wash', slug: 'around-the-world-renewing-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Souq Body & Hand Wash', slug: 'the-souq-hand-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Figure It Out Body & Hand Wash', slug: 'figure-it-out-hand-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Bella Amalfi Body & Hand Wash', slug: 'bella-amalfi-hand-body-wash', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Plum & Violet', slug: 'around-the-world-body-mist', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Rose & Peach', slug: 'around-the-world-body-mist-rose-and-peach', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Vanilla & Coconut', slug: 'around-the-world-body-mist-vanilla-and-coconut', base: 'https://www.kimirica.shop/products/' },
  { name: 'Love Story Body Yogurt', slug: 'love-story-body-yogurt', base: 'https://www.kimirica.shop/products/' },
  { name: 'Lady In Silver Bath & Body Duo', slug: 'lady-in-silver-bath-body-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Midnight Masquerade Bath & Body Duo', slug: 'midnight-masquerade-bath-body-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Love Story Body Wash & Lotion Duo', slug: 'love-story-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Earth Shower Gel & Body Lotion Duo', slug: 'earth-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Five Elements Body Care Duo', slug: 'five-elements-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Herbalist Body Care Duo', slug: 'herbalist-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gulistan Shower Gel & Body Lotion Duo', slug: 'gulistan-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Indian Apothecary Body Care Duo', slug: 'indian-apothecary-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'The French Note Body Care Duo', slug: 'french-note-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'The Gentleman Body Wash & Lotion Duo', slug: 'gentleman-body-care-duo', base: 'https://www.kimirica.shop/products/' },
  { name: 'Around The World Body Mist Gift Set 3-in-1', slug: 'around-the-world-body-mist-gift-set', base: 'https://www.kimirica.shop/products/' },
  // Mamaearth
  { name: 'Vitamin C Daily Glow Face Wash', slug: 'vitamin-c-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Ubtan Face Wash', slug: 'ubtan-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Rice Face Wash', slug: 'rice-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Tea Tree Face Wash', slug: 'tea-tree-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Multani Mitti Face Wash', slug: 'multani-mitti-face-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Vitamin C Face Serum', slug: 'vitamin-c-serum', base: 'https://mamaearth.in/products/' },
  { name: 'Bye Bye Blemishes Face Cream', slug: 'bye-bye-blemishes-cream', base: 'https://mamaearth.in/products/' },
  { name: 'Under Eye Cream', slug: 'under-eye-cream', base: 'https://mamaearth.in/products/' },
  { name: 'Aloe Vera Gel', slug: 'aloe-vera-gel', base: 'https://mamaearth.in/products/' },
  { name: 'Vitamin C Sunscreen SPF 50', slug: 'vitamin-c-sunscreen-spf-50-pa', base: 'https://mamaearth.in/products/' },
  { name: 'Ubtan Body Wash', slug: 'ubtan-body-wash', base: 'https://mamaearth.in/products/' },
  { name: 'Vitamin C Body Lotion', slug: 'vitamin-c-body-lotion', base: 'https://mamaearth.in/products/' },
  { name: 'Ubtan Body Lotion', slug: 'ubtan-body-lotion', base: 'https://mamaearth.in/products/' },
  { name: 'Coco Body Butter', slug: 'coco-body-butter', base: 'https://mamaearth.in/products/' },
  { name: 'Aloe Vera Body Lotion', slug: 'aloe-vera-body-lotion', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Hair Oil', slug: 'onion-hair-oil', base: 'https://mamaearth.in/products/' },
  { name: 'Rosemary Hair Growth Oil', slug: 'rosemary-hair-growth-oil', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Shampoo', slug: 'onion-shampoo', base: 'https://mamaearth.in/products/' },
  { name: 'Tea Tree Shampoo', slug: 'tea-tree-shampoo', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Conditioner', slug: 'onion-conditioner', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Hair Mask', slug: 'onion-hair-mask', base: 'https://mamaearth.in/products/' },
  { name: 'Onion Hair Serum', slug: 'onion-hair-serum', base: 'https://mamaearth.in/products/' },
  { name: 'Argan Hair Mask', slug: 'argan-hair-mask', base: 'https://mamaearth.in/products/' },
  { name: 'Charcoal Kajal', slug: 'charcoal-kajal', base: 'https://mamaearth.in/products/' },
  { name: 'Lip Crayon Pink Burst', slug: 'lip-crayon', base: 'https://mamaearth.in/products/' },
  { name: 'Strawberry Lip Balm', slug: 'strawberry-lip-balm', base: 'https://mamaearth.in/products/' },
]

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }
    client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject)
      }
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
    const client = url.startsWith('https') ? https : http
    const options = { headers: { 'User-Agent': 'Mozilla/5.0' } }
    const file = fs.createWriteStream(filepath)
    client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(filepath)
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject)
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', (err) => {
      file.close()
      reject(err)
    })
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