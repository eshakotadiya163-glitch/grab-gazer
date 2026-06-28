import type { Product } from "@/components/ProductCard";
import type { BlogPost } from "@/components/BlogCard";

import catFace from "@/assets/cat-face.jpg";
import catFragrance from "@/assets/cat-fragrance.jpg";
import catLotion from "@/assets/cat-lotion.jpg";
import catCream from "@/assets/cat-cream.jpg";
import catWash from "@/assets/cat-wash.jpg";
import catMist from "@/assets/cat-mist.jpg";
import catBody from "@/assets/cat-body.jpg";
import catDuo from "@/assets/cat-duo.jpg";

export const BRANDS = ["The Woman Company", "Kimirica"] as const;
export type Brand = (typeof BRANDS)[number];

export const CATEGORIES = [
  "Face",
  "Fragrance",
  "Body",
  "Body Lotion",
  "Body Cream",
  "Body Wash",
  "Body Mist",
  "Duos",
] as const;
export type Category = (typeof CATEGORIES)[number];

const inr = (n: number) => `₹${n}`;

const twc = (id: string, name: string, price: number, category: Category, variant?: string, image = catFace, tag?: string): Product => ({
  id,
  name,
  price,
  priceLabel: inr(price),
  brand: "The Woman Company",
  category,
  variant,
  image,
  tag,
});

const kim = (id: string, name: string, price: number, category: Category, variant?: string, image = catLotion): Product => ({
  id,
  name,
  price,
  priceLabel: inr(price),
  brand: "Kimirica",
  category,
  variant,
  image,
});

export const products: Product[] = [
  // The Woman Company — Face
  twc("twc-lip-scrub", "Lip Lightening Scrub", 399, "Face", "Sugar & Rose", catFace),
  twc("twc-skin-bright", "Skin Brightening Cream", 599, "Face", "Vitamin C", catFace, "Bestseller"),
  twc("twc-under-eye", "Under Eye Cream", 549, "Face", "Caffeine & Cucumber", catFace),
  // The Woman Company — Fragrance
  twc("twc-edp-bawsy", "EDP Bawsy", 999, "Fragrance", "Eau de Parfum 50ml", catFragrance),
  twc("twc-edp-classy", "EDP Classy", 999, "Fragrance", "Eau de Parfum 50ml", catFragrance),
  twc("twc-edp-gutsy", "EDP Gutsy", 999, "Fragrance", "Eau de Parfum 50ml", catFragrance),
  twc("twc-edp-sassy", "EDP Sassy", 999, "Fragrance", "Eau de Parfum 50ml", catFragrance),
  twc("twc-vibe-tribe", "Vibe Tribe Gift Set", 2499, "Fragrance", "4-piece EDP set", catDuo, "Gift"),
  // The Woman Company — Body
  twc("twc-coffee-scrub", "Coffee Body Scrub", 449, "Body", "Coffee & Cocoa", catBody),
  twc("twc-deo-rollon", "Deodorant Lightening Roll On", 299, "Body", "Aluminium-free", catBody),

  // Kimirica — Body Lotions
  kim("kim-love-lotion", "Love Story Body Lotion", 449, "Body Lotion", "Jasmine & Gardenia", catLotion),
  kim("kim-five-lotion", "Five Elements Body Lotion 300ml", 337, "Body Lotion", "Mimosa & Orange", catLotion),
  kim("kim-french-lotion", "The French Note Hand & Body Lotion", 449, "Body Lotion", "French Lavender", catLotion),
  kim("kim-earth-lotion", "Earth Body Lotion", 337, "Body Lotion", "Persian Sweet Lime", catLotion),
  kim("kim-herbalist-lotion", "Herbalist Body Lotion", 449, "Body Lotion", "Bergamot & Patchouli", catLotion),
  kim("kim-vivah-lotion", "Vivah Body Lotion 300ml", 487, "Body Lotion", "Marigold & Turmeric", catLotion),
  kim("kim-gulistan-lotion", "The Gulistan Hand & Body Lotion", 487, "Body Lotion", "Rose Absolute & Iris", catLotion),
  kim("kim-apothecary-lotion", "The Indian Apothecary Hand & Body Lotion", 449, "Body Lotion", "Ashwagandha", catLotion),
  kim("kim-pharma-lotion", "Pharmacopia Body Lotion 250ml", 412, "Body Lotion", "Argan Oil", catLotion),
  kim("kim-ignis-lotion", "Ignis Body Lotion 300ml", 224, "Body Lotion", "Bergamot & Tea Tree", catLotion),

  // Kimirica — Body Creams
  kim("kim-vivah-cream", "Vivah Body Cream 100gm", 674, "Body Cream", "Marigold & Turmeric", catCream),
  kim("kim-gentleman-cream", "The Gentleman Niacinamide Body Cream", 449, "Body Cream", "Musk & Amber", catCream),
  kim("kim-french-cream", "The French Note Body Cream 100gm", 674, "Body Cream", "French Lavender", catCream),
  kim("kim-gulistan-cream", "The Gulistan Body Cream 100gm", 637, "Body Cream", "Rose Absolute & Iris", catCream),

  // Kimirica — Body Washes
  kim("kim-apothecary-wash", "The Indian Apothecary Body Wash", 374, "Body Wash", "Ashwagandha", catWash),
  kim("kim-atw-moist-wash", "Around The World Moisturizing Body Wash", 337, "Body Wash", "Vanilla & Coconut", catWash),
  kim("kim-atw-clarify-wash", "Around The World Clarifying Body Wash", 337, "Body Wash", "Plum & Violet", catWash),
  kim("kim-atw-renew-wash", "Around The World Renewing Body Wash", 337, "Body Wash", "Rose & Peach", catWash),
  kim("kim-souq-wash", "The Souq Body & Hand Wash", 524, "Body Wash", "Saffron & Sandalwood", catWash),
  kim("kim-fig-wash", "Figure It Out Body & Hand Wash", 524, "Body Wash", "Fig & Cedar", catWash),
  kim("kim-amalfi-wash", "Bella Amalfi Body & Hand Wash", 524, "Body Wash", "Sea Water & Vetiver", catWash),

  // Kimirica — Body Mists
  kim("kim-mist-plum", "Around The World Body Mist", 337, "Body Mist", "Plum & Violet", catMist),
  kim("kim-mist-rose", "Around The World Body Mist", 337, "Body Mist", "Rose & Peach", catMist),
  kim("kim-mist-vanilla", "Around The World Body Mist", 337, "Body Mist", "Vanilla & Coconut", catMist),
  kim("kim-love-yogurt", "Love Story Body Yogurt", 449, "Body Mist", "Jasmine & Gardenia", catMist),

  // Kimirica — Duos / Sets
  kim("kim-silver-duo", "Lady In Silver Bath & Body Duo", 524, "Duos", "White Wisteria", catDuo),
  kim("kim-midnight-duo", "Midnight Masquerade Bath & Body Duo", 524, "Duos", "Neroli & Thyme", catDuo),
  kim("kim-love-duo", "Love Story Body Wash & Lotion Duo", 786, "Duos", "Jasmine & Gardenia", catDuo),
  kim("kim-earth-duo", "Earth Shower Gel & Body Lotion Duo", 636, "Duos", "Persian Sweet Lime", catDuo),
  kim("kim-five-duo", "Five Elements Body Care Duo", 636, "Duos", "Mimosa & Orange", catDuo),
  kim("kim-herbalist-duo", "Herbalist Body Care Duo", 824, "Duos", "Bergamot & Patchouli", catDuo),
  kim("kim-gulistan-duo", "The Gulistan Shower Gel & Body Lotion Duo", 861, "Duos", "Rose Absolute & Iris", catDuo),
  kim("kim-apothecary-duo", "The Indian Apothecary Body Care Duo", 824, "Duos", "Ashwagandha", catDuo),
  kim("kim-french-duo", "The French Note Body Care Duo", 974, "Duos", "French Lavender", catDuo),
  kim("kim-gentleman-duo", "The Gentleman Body Wash & Lotion Duo", 674, "Duos", "Musk & Amber", catDuo),
  kim("kim-atw-mist-set", "Around The World Body Mist Gift Set", 899, "Duos", "3-in-1", catDuo, ),
];

export const featuredProducts: Product[] = [
  products.find((p) => p.id === "twc-vibe-tribe")!,
  products.find((p) => p.id === "twc-skin-bright")!,
  products.find((p) => p.id === "kim-love-lotion")!,
  products.find((p) => p.id === "kim-vivah-cream")!,
  products.find((p) => p.id === "kim-souq-wash")!,
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building a Daily Body Care Ritual",
    excerpt: "A simple morning-to-night routine using lotions, creams, and mists for soft, glowing skin.",
    image: "/src/assets/blog-pads-evolution.jpg",
    slug: "building-a-daily-body-care-ritual",
  },
  {
    id: "2",
    title: "How to Choose a Signature Fragrance",
    excerpt: "Discover scent families and find the EDP that matches your mood and personality.",
    image: "/src/assets/blog-planet-health.jpg",
    slug: "how-to-choose-a-signature-fragrance",
  },
  {
    id: "3",
    title: "The Science of Niacinamide",
    excerpt: "Why this hero ingredient deserves a spot in your face and body care routine.",
    image: "/src/assets/blog-sleep.jpg",
    slug: "the-science-of-niacinamide",
  },
  {
    id: "4",
    title: "Gifting Guide: Curated Sets She'll Love",
    excerpt: "From bath duos to fragrance trios, our most-loved sets for every occasion.",
    image: "/src/assets/blog-cramps.jpg",
    slug: "gifting-guide-curated-sets",
  },
];
