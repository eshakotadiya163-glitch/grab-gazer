import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, PackageOpen, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { getShopCatalogFn } from "@/lib/repositories";

const searchSchema = z.object({
  q: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  loader: async () => {
    const catalog = await getShopCatalogFn();
    // #region agent log
    fetch("http://127.0.0.1:7442/ingest/69f67413-2d8e-4ac6-aadb-9860c8687794", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e962c0" },
      body: JSON.stringify({
        sessionId: "e962c0",
        location: "shop.tsx:loader",
        message: "Shop catalog loaded",
        data: {
          productCount: catalog.products.length,
          brandCount: catalog.brands.length,
          categoryCount: catalog.categories.length,
        },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion
    console.log("[shop loader]", {
      productCount: catalog.products.length,
      brandCount: catalog.brands.length,
      categoryCount: catalog.categories.length,
    });
    return catalog;
  },
  head: () => ({
    meta: [
      { title: "Shop — The Woman's Company" },
      { name: "description", content: "Shop our full range of feminine hygiene, body care, and skin care products." },
    ],
  }),
  component: ShopPage,
  pendingComponent: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-sage" />
    </div>
  ),
});

function ShopPage() {
  const { products, brands, categories } = Route.useLoaderData() as import("@/lib/repositories").ShopCatalog;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.q?.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
      if (search.brand && p.brand !== search.brand) return false;
      if (search.category && p.category !== search.category) return false;
      if (search.minPrice && p.price < search.minPrice) return false;
      if (search.maxPrice && p.price > search.maxPrice) return false;
      return true;
    });
  }, [products, search]);

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

  const clearFilters = () => {
    navigate({ search: {} });
  };

  const activeFilterCount = Object.keys(search).length;

  return (
    <main className="min-h-screen bg-background pb-20">
      <section className="bg-blush py-12 lg:py-20">
        <div className="container-tight text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
            Shop All
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Safe, sustainable, and toxin-free products designed for your everyday care.
            From intimate hygiene to nourishing skincare.
          </p>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="container-tight">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="flex items-center justify-between lg:hidden">
              <p className="font-medium text-foreground">{filteredProducts.length} products</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>

            <aside className="hidden w-64 shrink-0 lg:block space-y-8 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm font-medium text-sage-deep hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Brand</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateFilters({ brand: undefined })}
                    className={`text-left text-sm ${!search.brand ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => updateFilters({ brand: b })}
                      className={`text-left text-sm ${search.brand === b ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Category</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateFilters({ category: undefined })}
                    className={`text-left text-sm ${!search.category ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateFilters({ category: c })}
                      className={`text-left text-sm ${search.category === c ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6 hidden items-center justify-between lg:flex">
                <p className="text-sm text-muted-foreground">Showing {filteredProducts.length} of {products.length} results</p>
                {search.q && (
                  <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm">
                    <span className="text-muted-foreground">Search:</span>
                    <span className="font-medium">&quot;{search.q}&quot;</span>
                    <button onClick={() => updateFilters({ q: undefined })} className="ml-1 text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
                  <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">No products found</h3>
                  <p className="mt-2 text-muted-foreground">Try adjusting your filters or search term.</p>
                  <Button onClick={clearFilters} variant="outline" className="mt-6">Clear Filters</Button>
                </div>
              ) : (
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-border bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Brand</h3>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => updateFilters({ brand: search.brand === b ? undefined : b })}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          search.brand === b ? "border-sage bg-sage text-white" : "border-border bg-card text-foreground hover:border-sage"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm tracking-widest uppercase text-muted-foreground">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateFilters({ category: search.category === c ? undefined : c })}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          search.category === c ? "border-sage bg-sage text-white" : "border-border bg-card text-foreground hover:border-sage"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={clearFilters} disabled={activeFilterCount === 0}>
                  Clear All
                </Button>
                <Button onClick={() => setMobileFiltersOpen(false)} className="bg-sage text-white hover:bg-sage-deep">
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
