import fs from 'fs';

const badProducts = [
  { slug: "kim-love-yogurt", name: "Love Story Body Yogurt" },
  { slug: "kim-mist-plum", name: "Around The World Body Mist" },
  { slug: "kim-silver-duo", name: "Lady In Silver Bath & Body Duo" },
  { slug: "mae-bb-coco", name: "Coco Body Butter" },
  { slug: "mae-bl-vitc", name: "Vitamin C Body Lotion" },
  { slug: "mae-cr-illuminate", name: "Skin Illuminate Face Cream" },
  { slug: "mae-cr-undereye", name: "Under Eye Cream" },
  { slug: "mae-mask-argan", name: "Argan Hair Mask" },
  { slug: "mae-mask-c3", name: "C3 Face Mask" },
  { slug: "mae-mask-ubtan", name: "Ubtan Face Mask" },
  { slug: "mae-mkp-lipbalm", name: "Strawberry Lip Balm" },
  { slug: "mae-mkp-lipcrayon", name: "Lip Crayon Pink Burst" },
  { slug: "mae-moist-rice", name: "Rice Oil-Free Face Moisturizer" },
  { slug: "mae-sun-aloe", name: "Aloe Vera Sunscreen SPF 55" },
  { slug: "twc-bamboo-razors", name: "Bamboo Razors" },
  { slug: "twc-menstrual-cups", name: "Menstrual Cups" },
  { slug: "twc-stand-pee", name: "Stand And Pee Sticks" },
  { slug: "twc-tampons", name: "Tampons Without Applicator" },
  { slug: "twc-teen-pad", name: "Teen Pad 240MM" }
];

const files = fs.readdirSync('public/assets/images/products');

const mapping = {};
const missing = [];

for (const p of badProducts) {
  let found = files.find(f => f.replace('.jpg', '') === p.slug);
  if (!found) {
    if (p.slug === 'mae-cr-undereye') found = files.find(f => f.includes('under-eye-cream'));
    if (p.slug === 'mae-cr-illuminate') found = files.find(f => f.includes('illuminate'));
    if (p.slug === 'mae-mkp-lipbalm' || p.slug === 'mae-mkp-lipcrayon') found = files.find(f => f === 'lip.jpg');
    if (p.slug === 'kim-silver-duo') found = files.find(f => f.includes('lady-in-silver') || f === 'kim-duo-silver.jpg');
  }

  if (found) {
    mapping[p.slug] = `/assets/images/products/${found}`;
  } else {
    missing.push(p);
  }
}

console.log("Mapping:", mapping);
console.log("Missing:", missing);
