import type { Product } from "@/components/ProductCard";
import type { BlogPost } from "@/components/BlogCard";

export const products: Product[] = [
  {
    id: "bamboo-razors",
    name: "Bamboo Razors",
    price: 800,
    priceLabel: "Rs. 800",
    image: "/src/assets/bamboo-razors.jpg",
    tag: "Bestseller",
  },
  {
    id: "menstrual-cups",
    name: "Menstrual Cups",
    price: 499,
    priceLabel: "Rs. 499",
    image: "/src/assets/menstrual-cups.jpg",
  },
  {
    id: "stand-pee-sticks",
    name: "Stand And Pee Sticks",
    price: 210,
    priceLabel: "From Rs. 210",
    image: "/src/assets/stand-pee-sticks.jpg",
    tag: "New",
  },
  {
    id: "tampons",
    name: "Tampons Without Applicator",
    price: 499,
    priceLabel: "Rs. 499",
    image: "/src/assets/tampons.jpg",
  },
  {
    id: "teen-pads",
    name: "Teen Pad (240MM)",
    price: 259,
    priceLabel: "Rs. 259",
    image: "/src/assets/teen-pads.jpg",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Evolution of Sanitary Pads in India",
    excerpt: "From cloth rags to biodegradable organic pads, trace the journey of menstrual hygiene in India.",
    image: "/src/assets/blog-pads-evolution.jpg",
    slug: "evolution-of-sanitary-pads-in-india",
  },
  {
    id: "2",
    title: "Women's Menstrual Health Matters, Our Planet Matters",
    excerpt: "How choosing sustainable period products can protect both your body and the environment.",
    image: "/src/assets/blog-planet-health.jpg",
    slug: "womens-menstrual-health-planet-matters",
  },
  {
    id: "3",
    title: "Sleep Pattern Disturbance",
    excerpt: "Understanding the hormonal cycle and simple habits to improve rest during menstruation.",
    image: "/src/assets/blog-sleep.jpg",
    slug: "sleep-pattern-disturbance",
  },
  {
    id: "4",
    title: "The Best Solution For Menstrual Cramps",
    excerpt: "Natural remedies and products that bring comfort and relief during your period.",
    image: "/src/assets/blog-cramps.jpg",
    slug: "best-solution-for-menstrual-cramps",
  },
];
