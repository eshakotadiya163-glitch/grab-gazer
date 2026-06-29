import { useMemo } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronRight, Star, ShoppingCart, Leaf, Shield, Truck,
  RotateCcw, ChevronDown, Zap, Heart, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name ?? "Product"} — The Woman's Company` },
      {
        name: "description",
        content: loaderData?.product?.description?.slice(0, 155) ?? "Shop premium women's beauty products.",
      },
      { property: "og:title", content: loaderData?.product?.name ?? "Product" },
      { property: "og:image", content: loaderData?.product?.image ?? "" },
    ],
  }),
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Product not found.</p>
      <Button asChild className="bg-sage text-white hover:bg-sage-deep">
        <Link to="/shop">Back to Shop</Link>
      </Button>
    </div>
  ),
});

const BRAND_COLORS: Record<string, { pill: string; btn: string; badge: string }> = {
  Mamaearth:          { pill: "bg-emerald-500 text-white", btn: "bg-emerald-500 hover:bg-emerald-600 text-white", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Kimirica:           { pill: "bg-violet-500 text-white",  btn: "bg-violet-500 hover:bg-violet-600 text-white",   badge: "border-violet-200 bg-violet-50 text-violet-700" },
  "The Woman Company":{ pill: "bg-rose-400 text-white",    btn: "bg-rose-400 hover:bg-rose-500 text-white",       badge: "border-rose-200 bg-rose-50 text-rose-700" },
};

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const full    = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < full ? "fill-amber-400 text-amber-400"
            : i === full && hasHalf ? "fill-amber-400/50 text-amber-400"
            : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      {count && <span className="text-sm text-muted-foreground">({count} reviews)</span>}
    </span>
  );
}

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();
  const { has: isWished, toggle: toggleWish } = useWishlist();
  const navigate = useNavigate();

  const style = BRAND_COLORS[product.brand ?? "The Woman Company"] ?? BRAND_COLORS["The Woman Company"];
  const isMamaearth = product.brand === "Mamaearth";
  const wished = isWished(product.id);

  const related = useMemo(
    () => products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4),
    [product],
  );

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast.success(`${product.name} added to cart!`, {
      description: `${product.priceLabel} · ${product.variant ?? product.category}`,
    });
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    navigate({ to: "/checkout" });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: product.name, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="border-b border-border bg-card">
        <div className="container-tight flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" search={{ category: product.category }} className="transition-colors hover:text-foreground">
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 font-medium text-foreground">{product.name}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-10 lg:py-16">
        <div className="container-tight">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-[#FFF0F0] shadow-lg">
                {isMamaearth && (
                  <span className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow">
                    <Leaf className="h-3 w-3" /> Toxin-Free ✓
                  </span>
                )}
                {product.tag && !isMamaearth && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-sage px-3 py-1.5 text-xs font-semibold text-white shadow">
                    {product.tag}
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col"
            >
              {/* Brand pill */}
              <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style.pill}`}>
                {product.brand}
              </span>

              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>

              {product.variant && (
                <p className="mt-1 text-base italic text-muted-foreground">{product.variant}</p>
              )}

              {/* Rating */}
              {product.rating && (
                <div className="mt-3">
                  <StarRating rating={product.rating} count={Math.floor(product.rating * 23 + 41)} />
                </div>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">{product.priceLabel}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{Math.round(product.price * 1.2)}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  17% off
                </span>
              </div>

              {/* Stock indicator */}
              {product.stock && product.stock < 20 && (
                <p className="mt-2 text-sm font-medium text-amber-600">
                  Only {product.stock} left in stock!
                </p>
              )}

              {/* Description */}
              {product.description && (
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className={`flex-1 gap-2 sm:flex-none sm:min-w-44 ${style.btn}`}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="flex-1 sm:flex-none sm:min-w-44"
                >
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { icon: Shield,    label: "Secure Payment" },
                  { icon: Truck,     label: "Free on ₹499+" },
                  { icon: RotateCcw, label: "Easy Returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center ${style.badge}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Accordion: Product details */}
              <details className="group mt-6 rounded-xl border border-border">
                <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-foreground select-none">
                  Product Details
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border p-4 text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">Brand:</span> {product.brand}</p>
                  <p><span className="font-medium text-foreground">Category:</span> {product.category}</p>
                  {product.variant && <p><span className="font-medium text-foreground">Key Ingredients:</span> {product.variant}</p>}
                  <p><span className="font-medium text-foreground">Shelf Life:</span> 24 months from manufacture</p>
                  <p><span className="font-medium text-foreground">Country of Origin:</span> India</p>
                </div>
              </details>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border py-14">
          <div className="container-tight">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">You May Also Like</span>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-foreground">
                  Related Products
                </h2>
              </div>
              <Link
                to="/shop"
                search={{ category: product.category }}
                className="text-sm font-medium text-sage-deep hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rp, i) => (
                <ProductCard key={rp.id} product={rp} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
