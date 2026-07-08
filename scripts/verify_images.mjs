import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const targetProducts = [
  'Aloe Vera Sunscreen SPF 55', 'Argan Hair Mask', 'Around The World Body Mist',
  'Around The World Clarifying Body Wash', 'Around The World Moisturizing Body Wash',
  'Around The World Renewing Body Wash', 'Bamboo Razors', 'C3 Face Mask',
  'Coco Body Butter', 'Herbalist Body Care Duo', 'Indian Apothecary Body Care Duo',
  'Lip Crayon Pink Burst', 'Menstrual Cups', 'Rice Oil-Free Face Moisturizer',
  'Skin Illuminate Face Cream', 'Stand And Pee Sticks', 'Strawberry Lip Balm',
  'Tampons Without Applicator', 'Teen Pad 240MM', 'The Gentleman Niacinamide Body Cream',
  'The Gulistan Body Cream 100gm', 'Ubtan Face Mask', 'Under Eye Cream', 'Vitamin C Body Lotion'
];

async function verify() {
  const { data } = await supabase.from('products').select('name, image_url').in('name', targetProducts);
  console.log(`Verified ${data.length} products.`);
  for (const p of data) {
    if (!p.image_url.startsWith('/assets/images/products/')) {
      console.log(`❌ FAILED: ${p.name} -> ${p.image_url}`);
    } else {
      console.log(`✅ FIXED: ${p.name} -> ${p.image_url}`);
    }
  }
}
verify();
