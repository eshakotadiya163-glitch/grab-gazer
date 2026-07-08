import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const badSlugs = [
  'mae-cr-illuminate', 'mae-cr-undereye', 'mae-moist-rice', 'mae-sun-aloe', 'mae-mask-ubtan', 
  'mae-mask-c3', 'mae-bl-vitc', 'mae-bb-coco', 'mae-mask-argan', 'mae-mkp-lipcrayon', 'mae-mkp-lipbalm',
  'twc-teen-pad', 'twc-bamboo-razors', 'twc-menstrual-cups', 'twc-stand-pee', 'twc-tampons',
  'kim-mist-plum', 'kim-love-yogurt', 'kim-silver-duo'
];

async function run() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, image_url')
    .in('slug', badSlugs);
  
  console.log(JSON.stringify(products, null, 2));
}

run();
