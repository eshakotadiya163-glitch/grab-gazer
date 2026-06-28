import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { products, BRANDS, CATEGORIES, type Brand, type Category } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — The Woman's Company & Kimirica" },
      {
        name: "description",
        content:
          "Shop multi-brand women's beauty: face care, fragrances, body lotions, creams, washes, mists and gift sets from The Woman Company and Kimirica.",
      },
      { property: "og:title", content: "Shop — The Woman's Company & Kimirica" },
      {
        property: "og:description",
        content: "Body lotions, creams, washes, mists, fragrances and gift sets from your favourite brands.",
      },
    ],
  }),
  component: ShopPage,
});

const PRICE_BUCKETS = [
  { id: "all", label: "All prices", min: 0, max: Infinity },
  { id: "u300", label: "Under ₹300", min: 0, max: 299 },
  { id: "300-500", label: "₹300 – ₹500", min: 300, max: 500 },
  { id: "500-800", label: "₹500 – ₹800", min: 500, max: 800 },
  { id: "800p", label: "₹800 & above", min: 800, max: Infinity },
] as const;

function ShopPage() {
  const [brand, setBrand] = useState<Brand | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priceId, setPriceId] = useState<(typeof PRICE_BUCKETS)[number]["id"]>("all");

  const bucket = PRICE_BUCKETS.find((b) => b.id === priceId)!;

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (brand === "all" || p.brand === brand) &&
          (category === "all" || p.category === category) &&
          p.price >= bucket.min &&
          p.price <= bucket.max,
      ),
    [brand, category, bucket],
  );

  const clear = () => {
    setBrand("all");
    setCategory("all");
    setPriceId("all");
  };

  const hasFilters = brand !== "all" || category !== "all" || priceId !== "all";

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-12 lg:py-20">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Shop</span>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            All Products
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Curated beauty from The Woman Company and Kimirica — face, fragrance, and body care for every ritual.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-16">
        <div className="container-tight grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clear}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sage-deep hover:underline"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              <FilterGroup label="Brand">
                <FilterChip active={brand === "all"} onClick={() => setBrand("all")}>All</FilterChip>
                {BRANDS.map((b) => (
                  <FilterChip key={b} active={brand === b} onClick={() => setBrand(b)}>
                    {b}
                  </FilterChip>
                ))}
              </FilterGroup>

              <FilterGroup label="Category">
                <FilterChip active={category === "all"} onClick={() => setCategory("all")}>All</FilterChip>
                {CATEGORIES.map((c) => (
                  <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                    {c}
                  </FilterChip>
                ))}
              </FilterGroup>

              <FilterGroup label="Price">
                {PRICE_BUCKETS.map((b) => (
                  <FilterChip key={b.id} active={priceId === b.id} onClick={() => setPriceId(b.id)}>
                    {b.label}
                  </FilterChip>
                ))}
              </FilterGroup>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span> of {products.length} products
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No products match these filters.</p>
                <Button onClick={clear} className="mt-4 bg-sage text-white hover:bg-sage-deep">
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-border pt-4 first:border-t-0 first:pt-0 first:mt-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-sage bg-sage text-white"
          : "border-border bg-background text-muted-foreground hover:border-sage hover:text-sage-deep")
      }
    >
      {children}
    </button>
  );
}
