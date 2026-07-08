import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { getShopCatalogFn } from "@/lib/repositories";

const searchSchema = z.object({
  q: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
});

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

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
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
      console.error('Shop loader error:', error);
      return { 
        products: FALLBACK_PRODUCTS, 
        brands: ["The Woman Company"], 
        categories: ["Skin Care", "Body Care", "Fragrances"] 
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Shop Beauty & Cosmetics — The Women Company" },
      { name: "description", content: "Explore our premium collections of luxury beauty and body care." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { products: allProducts, brands, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter valid local images
  const validProducts = useMemo(() => allProducts.filter(p => {
    const img = p.image_url || p.image || "";
    return img.startsWith("/assets/images/");
  }), [allProducts]);

  // Deduplicate products by name
  const uniqueProducts = useMemo(() => Array.from(new Map(validProducts.map(p => [p.name, p])).values()), [validProducts]);

  const filteredProducts = useMemo(() => {
    let result = uniqueProducts.filter((p) => {
      const q = search.q?.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
      if (search.brand && p.brand !== search.brand) return false;
      if (search.category && p.category !== search.category) return false;
      return true;
    });

    if (search.sort === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (search.sort === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (search.sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (search.sort === "new") {
      // simulate newness by reversing
      result.reverse();
    }
    
    return result;
  }, [uniqueProducts, search]);

  const updateFilters = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev: typeof search) => {
        const next = { ...prev, ...updates };
        Object.keys(next).forEach((key) => {
          const k = key as keyof typeof next;
          if (next[k] === "" || next[k] === undefined) {
            delete next[k];
          }
        });
        return next;
      },
    });
  };

  const SORTS = [
    { id: "relevance", label: "Relevance" },
    { id: "price_asc", label: "Price: Low To High" },
    { id: "price_desc", label: "Price: High To Low" },
    { id: "rating", label: "Customer Top Rated" },
    { id: "new", label: "New Arrivals" },
  ];

  const activeSort = SORTS.find(s => s.id === search.sort) || SORTS[0];
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className="container-tight mx-auto px-4 py-6">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <span>Home</span> <span>❯</span> <span className="text-foreground">Makeup</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {search.category || search.brand || search.q || "All Products"} <span className="text-muted-foreground font-normal text-lg">({filteredProducts.length})</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center border-y border-border py-3">
            <button 
              className="flex items-center gap-2 font-bold"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <div className="relative">
               <button 
                className="flex items-center gap-2 font-bold"
                onClick={() => setSortOpen(!sortOpen)}
              >
                Sort By: {activeSort.label} <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* LEFT SIDEBAR FILTERS */}
          <aside className={`w-full lg:w-64 shrink-0 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-24 pr-4">
              
              {/* Category Filter */}
              <div className="border border-border rounded-sm mb-4">
                <div className="p-4 bg-muted/20 font-bold border-b border-border text-sm">
                  Category
                </div>
                <div className="p-4 max-h-60 overflow-y-auto">
                  <div 
                    className={`text-sm py-1.5 cursor-pointer ${!search.category ? "font-bold text-primary" : "text-foreground hover:text-primary"}`}
                    onClick={() => updateFilters({ category: undefined })}
                  >
                    All Categories
                  </div>
                  {categories.map(cat => (
                    <div 
                      key={cat}
                      className={`text-sm py-1.5 cursor-pointer ${search.category === cat ? "font-bold text-primary" : "text-foreground hover:text-primary"}`}
                      onClick={() => updateFilters({ category: cat })}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="border border-border rounded-sm">
                <div className="p-4 bg-muted/20 font-bold border-b border-border text-sm">
                  Brand
                </div>
                <div className="p-4 max-h-60 overflow-y-auto">
                  <div 
                    className={`text-sm py-1.5 cursor-pointer ${!search.brand ? "font-bold text-primary" : "text-foreground hover:text-primary"}`}
                    onClick={() => updateFilters({ brand: undefined })}
                  >
                    All Brands
                  </div>
                  {brands.map(brand => (
                    <div 
                      key={brand}
                      className={`text-sm py-1.5 cursor-pointer ${search.brand === brand ? "font-bold text-primary" : "text-foreground hover:text-primary"}`}
                      onClick={() => updateFilters({ brand: brand })}
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* PRODUCT GRID SECTION */}
          <section className="flex-1">
            
            {/* Desktop Sort Bar */}
            <div className="hidden lg:flex justify-end items-center mb-6">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-sm hover:border-primary transition-colors bg-white"
                  onClick={() => setSortOpen(!sortOpen)}
                >
                  <span className="text-muted-foreground">Sort By:</span> 
                  <span className="font-bold">{activeSort.label}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-border shadow-lg z-20 rounded-sm">
                    {SORTS.map(s => (
                      <button
                        key={s.id}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-muted/30 flex items-center justify-between"
                        onClick={() => {
                          updateFilters({ sort: s.id === "relevance" ? undefined : s.id });
                          setSortOpen(false);
                        }}
                      >
                        <span className={activeSort.id === s.id ? "font-bold text-primary" : ""}>{s.label}</span>
                        {activeSort.id === s.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 border border-border rounded-sm bg-muted/10">
                <p className="text-lg font-bold text-foreground">No products found</p>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                <Button onClick={() => updateFilters({ brand: undefined, category: undefined, q: undefined, sort: undefined })} className="mt-6 bg-primary rounded-sm">
                  Clear All Filters
                </Button>
              </div>
            )}
            
          </section>

        </div>
      </div>
    </main>
  );
}
