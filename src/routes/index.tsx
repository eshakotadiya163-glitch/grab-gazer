import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flower2,
  Gift,
  Heart,
  Leaf,
  Lock,
  Package,
  Plane,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/ProductCard";
import { getHomeProductsFn } from "@/lib/repositories";

export const Route = createFileRoute("/")({
  loader: () => getHomeProductsFn(),
  head: () => ({
    meta: [
      { title: "The Woman's Company — Premium Feminine Wellness & Intimate Care" },
      {
        name: "description",
        content:
          "By Women, For Women. Premium feminine hygiene, intimate care and wellness essentials — safe, dermatologist-inspired, and thoughtfully crafted.",
      },
      { property: "og:title", content: "The Woman's Company — Premium Feminine Wellness" },
      {
        property: "og:description",
        content:
          "Premium feminine hygiene & intimate care designed for every stage of life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type Product = import("@/components/ProductCard").Product;

// -------- Hero slides --------
const HERO_SLIDES = [
  {
    kicker: "By Women, For Women",
    title: "By Women, For Women",
    subtitle:
      "Premium feminine hygiene & intimate care designed for every stage of life.",
    cta: "Shop Now",
    to: "/shop",
    bg: "from-[oklch(0.95_0.03_15)] via-[oklch(0.97_0.01_50)] to-[oklch(0.96_0.02_85)]",
    image:
      "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1400",
  },
  {
    kicker: "Everyday Freshness",
    title: "Feel Fresh Every Day",
    subtitle:
      "Safe, dermatologist-inspired essentials for confident everyday care.",
    cta: "Explore Collection",
    to: "/shop",
    bg: "from-[oklch(0.96_0.02_85)] via-[oklch(0.97_0.015_120)] to-[oklch(0.94_0.04_150)]",
    image:
      "https://images.pexels.com/photos/6621336/pexels-photo-6621336.jpeg?auto=compress&cs=tinysrgb&w=1400",
  },
  {
    kicker: "Naturally Crafted",
    title: "Natural Care You Can Trust",
    subtitle:
      "Thoughtfully crafted products with comfort, safety and quality in mind.",
    cta: "View Products",
    to: "/shop",
    bg: "from-[oklch(0.94_0.04_15)] via-[oklch(0.96_0.02_45)] to-[oklch(0.95_0.03_85)]",
    image:
      "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1400",
  },
];

// -------- Trust bar --------
const TRUST_ITEMS = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹499" },
  { icon: BadgeCheck, title: "100% Genuine", desc: "Authentic products" },
  { icon: Lock, title: "Secure Payments", desc: "UPI · Cards · COD" },
  { icon: RefreshCcw, title: "Easy Returns", desc: "Hassle-free 7-day" },
  { icon: Zap, title: "Fast Delivery", desc: "Quick & discreet" },
];

// -------- Categories --------
const CATEGORIES = [
  { name: "Menstrual Care", icon: Flower2, tint: "bg-rose-100 text-rose-600" },
  { name: "Intimate Wash", icon: Droplet, tint: "bg-pink-100 text-pink-600" },
  { name: "Sanitary Pads", icon: Heart, tint: "bg-red-100 text-red-500" },
  { name: "Panty Liners", icon: Sparkles, tint: "bg-fuchsia-100 text-fuchsia-600" },
  { name: "Tampons", icon: Leaf, tint: "bg-emerald-100 text-emerald-600" },
  { name: "Menstrual Cups", icon: ShieldCheck, tint: "bg-amber-100 text-amber-600" },
  { name: "Hygiene Essentials", icon: Package, tint: "bg-sky-100 text-sky-600" },
  { name: "Wellness Kits", icon: Gift, tint: "bg-violet-100 text-violet-600" },
];

// -------- Shop by Concern --------
const CONCERNS = [
  {
    name: "Daily Hygiene",
    desc: "Everyday freshness essentials",
    image: "https://images.pexels.com/photos/3737599/pexels-photo-3737599.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Period Care",
    desc: "Pads, cups, tampons & more",
    image: "https://images.pexels.com/photos/6621336/pexels-photo-6621336.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Intimate Care",
    desc: "Gentle pH-balanced formulas",
    image: "https://images.pexels.com/photos/4210315/pexels-photo-4210315.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Sensitive Skin",
    desc: "Dermatologist-inspired care",
    image: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Travel Essentials",
    desc: "On-the-go must-haves",
    image: "https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Self Care",
    desc: "Wellness rituals you'll love",
    image: "https://images.pexels.com/photos/3737605/pexels-photo-3737605.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

// -------- Trusted Brands --------
const BRANDS = [
  "The Woman Company",
  "Mamaearth",
  "Kimirica",
  "The Body Care",
  "Sirona",
  "Nua",
  "Plush",
  "Carmesi",
];

// -------- Why choose us --------
const REASONS = [
  { icon: ShieldCheck, title: "Dermatologist Inspired", desc: "Formulated with expert guidance." },
  { icon: Leaf, title: "Safe Ingredients", desc: "Gentle, clean, body-friendly." },
  { icon: Truck, title: "Fast Delivery", desc: "Quick, discreet shipping." },
  { icon: Wallet, title: "Secure Payments", desc: "COD & UPI supported." },
  { icon: Flower2, title: "Eco-Friendly", desc: "Sustainable at every step." },
  { icon: Sparkles, title: "Trusted Quality", desc: "Loved by thousands." },
];

// -------- Testimonials --------
const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 5,
    text: "Absolutely love the quality. Finally a brand that understands women's needs and delivers on it every time.",
  },
  {
    name: "Priya Nair",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 5,
    text: "Soft, safe and reliable. The intimate care range has become a permanent part of my routine.",
  },
  {
    name: "Ritika Verma",
    avatar: "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 4.5,
    text: "Premium packaging, thoughtful products and fast delivery. Highly recommended to every woman.",
  },
  {
    name: "Sneha Kapoor",
    avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 5,
    text: "I trust The Woman's Company for everyday essentials. Comfortable, clean and eco-conscious.",
  },
];

// -------- Instagram gallery --------
const INSTA = [
  "https://images.pexels.com/photos/3737599/pexels-photo-3737599.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3737605/pexels-photo-3737605.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/4210315/pexels-photo-4210315.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=400",
];

// -------- FAQ --------
const FAQS = [
  {
    q: "Are the products dermatologically tested?",
    a: "Yes — every product is dermatologist-inspired and tested for skin safety before it reaches you.",
  },
  {
    q: "Are they safe for daily use?",
    a: "Absolutely. Our formulas are gentle, pH-balanced and body-friendly for everyday care.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, all major credit & debit cards, net banking, and Cash on Delivery.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders are delivered in 3–5 business days across India with discreet packaging.",
  },
  {
    q: "Can I return products?",
    a: "Yes — unopened products can be returned within 7 days of delivery. See our Returns policy for details.",
  },
];

function HomePage() {
  const products = Route.useLoaderData() as Product[];
  const bestSellers = useMemo(() => products.slice(0, 8), [products]);
  const newArrivals = useMemo(
    () => (products.length > 8 ? products.slice(8, 16) : products.slice(0, 8)),
    [products],
  );
  const flashProducts = useMemo(
    () => (products.length > 4 ? products.slice(4, 12) : products.slice(0, 8)),
    [products],
  );

  return (
    <main className="min-h-screen">
      <HeroSlider />
      <TrustBar />
      <FeaturedCategories />
      <FlashSale products={flashProducts} />
      <ShopByConcern />
      <ProductSection
        kicker="Best Sellers"
        title="Loved by Every Woman"
        products={bestSellers}
      />
      <WhyChooseUs />
      <ProductSection
        kicker="New Arrivals"
        title="Freshly Added for You"
        products={newArrivals}
        bg="bg-cream"
      />
      <TrustedBrands />
      <AboutBrand />
      <Testimonials />
      <FAQ />
      <InstagramGallery />
      <Newsletter />
    </main>
  );
}

// ============ Hero Slider ============
function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const total = HERO_SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(t);
  }, [total]);

  const go = (next: number) => {
    setDir(next > index || (index === total - 1 && next === 0) ? 1 : -1);
    setIndex(((next % total) + total) % total);
  };

  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    setTouchX(null);
  };

  const slide = HERO_SLIDES[index];

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-colors duration-700`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="container-tight grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-sage-deep shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {slide.kicker}
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {slide.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-sage text-white hover:bg-sage-deep">
                <Link to={slide.to}>
                  {slide.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${index}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-blush">
              <img
                src={slide.image}
                alt={slide.title}
                loading="eager"
                width={1400}
                height={900}
                className="aspect-[4/3] w-full object-cover lg:aspect-[14/10]"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-soft backdrop-blur transition hover:bg-white sm:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-soft backdrop-blur transition hover:bg-white sm:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-8 bg-sage-deep" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ============ Trust Bar ============
function TrustBar() {
  return (
    <section className="border-b border-border/60 bg-gradient-to-r from-blush/30 via-background to-cream/60">
      <div className="container-tight py-6">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/60"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-sage-deep shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ============ Featured Categories ============
function FeaturedCategories() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-tight">
        <SectionHeader kicker="Shop by Category" title="Featured Categories" />
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to="/shop"
                className="group flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${cat.tint} transition-transform duration-300 group-hover:scale-110`}
                >
                  <cat.icon className="h-7 w-7" />
                </span>
                <p className="mt-4 font-[family-name:var(--font-display)] text-sm font-semibold text-foreground">
                  {cat.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Flash Sale ============
function useCountdown(hours = 8) {
  const [end] = useState(() => Date.now() + hours * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, end - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { h, m, s };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[3rem] rounded-xl bg-foreground px-3 py-2 text-center font-[family-name:var(--font-display)] text-xl font-bold text-white shadow-sm tabular-nums sm:text-2xl">
        {v}
      </div>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function FlashSale({ products }: { products: Product[] }) {
  const { h, m, s } = useCountdown(8);
  if (!products?.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-background to-amber-50 py-16 lg:py-20">
      <div className="container-tight">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
              <Zap className="h-3 w-3" />
              Flash Sale
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
              Limited-Time Offers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hurry! These deals disappear soon.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TimeBox value={h} label="Hrs" />
            <span className="pb-4 text-xl font-bold text-foreground/60">:</span>
            <TimeBox value={m} label="Min" />
            <span className="pb-4 text-xl font-bold text-foreground/60">:</span>
            <TimeBox value={s} label="Sec" />
          </div>
        </div>

        <div className="mt-10 -mx-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-5 snap-x snap-mandatory">
            {products.slice(0, 8).map((p, i) => (
              <div
                key={p.id}
                className="w-[75%] flex-none snap-start sm:w-[45%] md:w-[32%] lg:w-[24%]"
              >
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="bg-rose-500 text-white hover:bg-rose-600">
            <Link to="/shop">
              View All Deals <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============ Shop by Concern ============
function ShopByConcern() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-tight">
        <SectionHeader kicker="Curated for You" title="Shop by Concern" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-xl"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-white/85">{c.desc}</p>
                <div className="mt-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button asChild size="sm" className="bg-white text-foreground hover:bg-white/90">
                    <Link to="/shop">
                      Shop Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <span className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-sage-deep shadow-sm">
                {i % 3 === 0 ? (
                  <Flower2 className="h-4 w-4" />
                ) : i % 3 === 1 ? (
                  <Droplet className="h-4 w-4" />
                ) : (
                  <Plane className="h-4 w-4" />
                )}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Product Section ============
function ProductSection({
  kicker,
  title,
  products,
  bg = "bg-background",
}: {
  kicker: string;
  title: string;
  products: Product[];
  bg?: string;
}) {
  if (!products?.length) return null;
  return (
    <section className={`${bg} py-16 lg:py-24`}>
      <div className="container-tight">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader kicker={kicker} title={title} align="left" />
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-sage-deep transition-all hover:gap-2"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Why Choose Us ============
function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-br from-blush/40 via-background to-cream py-16 lg:py-24">
      <div className="container-tight">
        <SectionHeader kicker="Why Choose Us" title="Care You Can Feel" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-sage/15 text-sage-deep">
                <r.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Trusted Brands (infinite scroll) ============
function TrustedBrands() {
  const loop = [...BRANDS, ...BRANDS];
  return (
    <section className="bg-background py-14 lg:py-16">
      <div className="container-tight">
        <SectionHeader kicker="As Featured In" title="Trusted Brands" />
        <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-[brand-marquee_28s_linear_infinite] gap-12">
            {loop.map((b, i) => (
              <div
                key={`${b}-${i}`}
                className="flex h-16 min-w-[180px] items-center justify-center rounded-xl border border-border/60 bg-card px-6 text-center font-[family-name:var(--font-display)] text-base font-semibold text-foreground/70 shadow-sm transition-colors hover:text-sage-deep"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes brand-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

// ============ About Brand ============
function AboutBrand() {
  return (
    <section className="bg-gradient-to-br from-cream via-background to-blush/30 py-16 lg:py-24">
      <div className="container-tight grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl shadow-blush">
            <img
              src="https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="The Woman's Company"
              loading="lazy"
              className="aspect-[5/6] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-white p-4 shadow-blush sm:block">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                <Heart className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold text-foreground">50,000+</p>
                <p className="text-xs text-muted-foreground">Happy customers</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
            Our Story
          </span>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
            Made for Every Woman
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            The Woman's Company began with a simple belief — every woman deserves feminine care
            that's safe, comfortable and honest. From gentle intimate washes to sustainable period
            care, every product is thoughtfully designed with expert guidance and love.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Dermatologist-inspired formulations",
              "Sustainable, body-friendly ingredients",
              "Made in India, loved across the world",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                <BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-sage-deep" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-sage text-white hover:bg-sage-deep">
              <Link to="/about">
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Testimonials ============
function Testimonials() {
  const [i, setI] = useState(0);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % total), 6000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-tight">
        <SectionHeader kicker="Customer Reviews" title="What Women Say" />
        <div className="relative mx-auto mt-12 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-soft sm:p-12"
            >
              <img
                src={TESTIMONIALS[i].avatar}
                alt={TESTIMONIALS[i].name}
                loading="lazy"
                width={80}
                height={80}
                className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-blush"
              />
              <div className="mt-4 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s < Math.floor(TESTIMONIALS[i].rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-5 text-lg leading-relaxed text-foreground">
                “{TESTIMONIALS[i].text}”
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] font-semibold text-sage-deep">
                {TESTIMONIALS[i].name}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, k) => (
              <button
                key={k}
                aria-label={`Review ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-2 rounded-full transition-all ${
                  k === i ? "w-8 bg-sage-deep" : "w-2 bg-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FAQ ============
function FAQ() {
  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="container-tight max-w-3xl">
        <SectionHeader kicker="Help Center" title="Frequently Asked Questions" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 rounded-2xl border border-border/60 bg-card px-6 shadow-sm sm:px-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left text-base font-medium text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Instagram Gallery ============
function InstagramGallery() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-tight">
        <SectionHeader kicker="@thewomanscompany" title="Follow Our Journey" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INSTA.map((src, i) => (
            <motion.a
              key={src}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <img
                src={src}
                alt={`Instagram post ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <a href="https://instagram.com" target="_blank" rel="noreferrer noopener">
              Follow Us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============ Newsletter ============
function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed! Welcome to the family 💌");
    setEmail("");
  };

  return (
    <section className="bg-sage py-16 text-white lg:py-24">
      <div className="container-tight text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            Stay Connected
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Get exclusive offers, new arrivals and wellness tips.
          </p>
          <form
            onSubmit={submit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border-0 bg-white/20 px-5 text-white placeholder:text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
            <Button
              type="submit"
              className="h-12 rounded-full bg-white px-6 text-sage-deep hover:bg-white/90"
            >
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Section Header ============
function SectionHeader({
  kicker,
  title,
  align = "center",
}: {
  kicker: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === "center" ? "text-center" : ""}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
        {kicker}
      </span>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
        {title}
      </h2>
    </motion.div>
  );
}
