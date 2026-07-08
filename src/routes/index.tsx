import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, Clock, Search, ArrowRight, Mail } from "lucide-react";
import { getShopCatalogFn } from "@/lib/repositories";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const FALLBACK_PRODUCTS = [
  {
    id: "fb-1",
    name: "Lip Lightening Scrub",
    brand: "The Woman Company",
    category: "Skin Care",
    price: 349,
    mrp: 499,
    priceLabel: "₹349",
    image: "/assets/images/products/lip-lightening-scrub.png",
    image_url: "/assets/images/products/lip-lightening-scrub.png",
    stock: 10,
    tag: "Bestseller"
  },
  {
    id: "fb-2",
    name: "Bamboo Razors",
    brand: "The Woman Company",
    category: "Body Care",
    price: 299,
    mrp: 399,
    priceLabel: "₹299",
    image: "/assets/images/products/bamboo-razors.png",
    image_url: "/assets/images/products/bamboo-razors.png",
    stock: 15,
  },
  {
    id: "fb-3",
    name: "Eau De Parfum Bawsy",
    brand: "The Woman Company",
    category: "Fragrances",
    price: 899,
    mrp: 1299,
    priceLabel: "₹899",
    image: "/assets/images/products/eau-de-parfum-bawsy.png",
    image_url: "/assets/images/products/eau-de-parfum-bawsy.png",
    stock: 5,
  },
  {
    id: "fb-4",
    name: "Under Eye Cream",
    brand: "The Woman Company",
    category: "Skin Care",
    price: 499,
    mrp: 599,
    priceLabel: "₹499",
    image: "/assets/images/products/under-eye-cream.png",
    image_url: "/assets/images/products/under-eye-cream.png",
    stock: 20,
  },
  {
    id: "fb-5",
    name: "Coffee Body Scrub",
    brand: "The Woman Company",
    category: "Body Care",
    price: 399,
    mrp: 549,
    priceLabel: "₹399",
    image: "/assets/images/products/coffee-body-scrub.png",
    image_url: "/assets/images/products/coffee-body-scrub.png",
    stock: 12,
  },
];

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const data = await getShopCatalogFn();
      if (!data || !data.products || data.products.length === 0) {
        return { 
          products: FALLBACK_PRODUCTS, 
          brands: ["The Woman Company"], 
          categories: ["Skin Care", "Body Care", "Fragrances"] 
        };
      }
      return data;
    } catch (error) {
      console.error('Home loader error:', error);
      return { 
        products: FALLBACK_PRODUCTS, 
        brands: ["The Woman Company"], 
        categories: ["Skin Care", "Body Care", "Fragrances"] 
      };
    }
  },
  head: () => ({
    meta: [
      { title: "The Women Company | Buy Cosmetics, Beauty Products Online" },
      { name: "description", content: "Shop beauty and cosmetics products online from The Women Company." },
    ],
  }),
  component: HomePage,
});

type Product = import("@/components/ProductCard").Product;

/* ═══════════════════════════════════════════════════
   MOCK DATA FOR BANNERS & BRANDS
   ═══════════════════════════════════════════════════ */
const BANNERS = [
  { id: 1, title: "Biggest Beauty Sale", subtitle: "Up to 50% Off on Top Brands", color: "bg-pink-100", textColor: "text-pink-900" },
  { id: 2, title: "Summer Essentials", subtitle: "Sunscreen & Body Care starting at ₹299", color: "bg-orange-100", textColor: "text-orange-900" },
  { id: 3, title: "Luxury Fragrances", subtitle: "Discover your signature scent", color: "bg-purple-100", textColor: "text-purple-900" },
];

const BRANDS = [
  { name: "The Woman Company", slug: "the-woman-company" },
  { name: "Kimirica", slug: "kimirica" },
  { name: "Mamaearth", slug: "mamaearth" },
  { name: "The Body Care", slug: "the-body-care" },
];

const CATEGORY_ICONS = [
  { name: "Skin Care", image: "/assets/images/products/The-Body-Care-Vitamin-C-Serum-1.jpg" },
  { name: "Hair Care", image: "/assets/images/products/The-Body-Care-Lemon-Cleansing-Milk-1.jpg" },
  { name: "Body Care", image: "/assets/images/products/The-Body-Care-Ubtan-Cleansing-Milk-1.jpg" },
  { name: "Fragrances", image: "/assets/images/products/Love_Story-White-Background-1x1-Listing-Images-11_7ec25e4c-b618-4849-b281-26b63baf4cb3.jpg" },
  { name: "Menstrual Care", image: "/assets/images/products/Menstrual-Cup-L-01_1_e4171694-8cf2-446f-8700-ce3c26ab8ff9.jpg" },
];

/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
function HomePage() {
  const { products: allProducts } = Route.useLoaderData();
  const navigate = useNavigate();
  
  // Valid local images filter
  const validProducts = useMemo(() => allProducts.filter(p => {
    const img = p.image_url || p.image || "";
    return img.startsWith("/assets/images/");
  }), [allProducts]);

  // Deduplicate products by name
  const products = useMemo(() => Array.from(new Map(validProducts.map(p => [p.name, p])).values()), [validProducts]);

  // Slices
  const bestsellers = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

  /* --- Hero Banner State --- */
  const [currentBanner, setCurrentBanner] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* --- Countdown Timer --- */
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white pb-20 lg:pb-0">
      
      {/* ════════════ HERO BANNER CAROUSEL ════════════ */}
      <section className="relative w-full overflow-hidden bg-gray-50 pt-4">
        <div className="container-tight mx-auto px-4">
          <div className="relative aspect-[16/6] md:aspect-[21/6] w-full rounded-md overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 flex items-center justify-center ${BANNERS[currentBanner].color}`}
              >
                <div className="text-center p-8">
                  <h2 className={`text-2xl md:text-5xl font-bold mb-2 ${BANNERS[currentBanner].textColor}`}>
                    {BANNERS[currentBanner].title}
                  </h2>
                  <p className={`text-sm md:text-xl font-medium ${BANNERS[currentBanner].textColor}`}>
                    {BANNERS[currentBanner].subtitle}
                  </p>
                  <Button className="mt-4 md:mt-6 bg-white text-black hover:bg-gray-100 rounded-sm">
                    Shop Now
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-10 bg-white/80 hover:bg-white flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setCurrentBanner((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1))}
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-10 bg-white/80 hover:bg-white flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setCurrentBanner((prev) => (prev + 1) % BANNERS.length)}
            >
              <ChevronRight className="h-6 w-6 text-black" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === currentBanner ? "w-6 bg-primary" : "w-2 bg-black/20"}`}
                  onClick={() => setCurrentBanner(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FLASH SALE ════════════ */}
      <section className="py-8">
        <div className="container-tight mx-auto px-4">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide">Flash Sale</h2>
              <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-sm">
                <Clock className="h-4 w-4" />
                <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
              </div>
            </div>
            <Link to="/shop" search={{ sort: "price_asc" }} className="text-sm font-semibold text-primary hover:underline flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {/* Using first 4 products for flash sale */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(4, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ SHOP BY CATEGORY ════════════ */}
      <section className="py-8 bg-muted/30">
        <div className="container-tight mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center uppercase tracking-wide mb-8">Shop By Category</h2>
          
          <div className="flex overflow-x-auto pb-6 gap-6 md:justify-center hide-scrollbar">
            {CATEGORY_ICONS.map((cat, i) => (
              <Link 
                key={i} 
                to="/shop" 
                search={{ category: cat.name }}
                className="flex flex-col items-center gap-3 min-w-[100px] md:min-w-[120px] group"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-sm border border-border group-hover:border-primary transition-colors overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TOP BRANDS ════════════ */}
      <section className="py-10">
        <div className="container-tight mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center uppercase tracking-wide mb-8">Top Brands</h2>
          
          <div className="flex overflow-x-auto pb-4 gap-4 md:justify-center hide-scrollbar">
            {BRANDS.map((brand, i) => (
              <Link
                key={i}
                to="/shop"
                search={{ brand: brand.name }}
                className="flex items-center justify-center min-w-[160px] h-20 bg-white border border-border rounded-md shadow-sm hover:shadow-md hover:border-primary transition-all p-4"
              >
                <span className="font-bold text-lg text-center tracking-tight text-foreground">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ BESTSELLERS ════════════ */}
      <section className="py-8 bg-muted/30">
        <div className="container-tight mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center uppercase tracking-wide mb-8">Bestsellers</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestsellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-sm font-bold px-8">
              <Link to="/shop">View All Bestsellers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════ OFFERS BANNER ════════════ */}
      <section className="py-8">
        <div className="container-tight mx-auto px-4">
          <Link to="/shop" className="block w-full rounded-md overflow-hidden bg-primary p-8 text-center md:text-left md:flex items-center justify-between hover:opacity-95 transition-opacity">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">Weekend Beauty Bash</h3>
              <p className="text-white/90 font-medium">Flat 50% Off on select Skincare & Fragrances</p>
            </div>
            <div className="bg-white text-primary font-bold px-8 py-3 rounded-sm flex items-center justify-center max-w-xs mx-auto md:mx-0">
              Explore Deals <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* ════════════ NEW ARRIVALS ════════════ */}
      <section className="py-8">
        <div className="container-tight mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center uppercase tracking-wide mb-8">New Arrivals</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ NEWSLETTER ════════════ */}
      <section className="py-16 bg-muted/40 border-t border-border mt-10">
        <div className="container-tight mx-auto px-4 text-center max-w-2xl">
          <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Special Discounts in your Inbox</h2>
          <p className="text-muted-foreground mb-8 font-medium">Subscribe to our newsletter and get ₹200 off on your first order.</p>
          
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-1 h-12 rounded-sm border border-input px-4 outline-none focus:border-primary"
            />
            <Button type="submit" className="h-12 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold px-8">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
      
    </main>
  );
}
