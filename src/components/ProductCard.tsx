import { motion } from "framer-motion";
import { ShoppingCart, Leaf, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";

export interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  tag?: string;
  brand?: string;
  category?: string;
  variant?: string;
  description?: string;
  rating?: number;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const BRAND_STYLES: Record<string, { pill: string; btn: string; border: string }> = {
  Mamaearth: {
    pill:   "bg-emerald-500 text-white",
    btn:    "bg-emerald-500 hover:bg-emerald-600 text-white",
    border: "border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100/60",
  },
  Kimirica: {
    pill:   "bg-violet-500 text-white",
    btn:    "bg-violet-500 hover:bg-violet-600 text-white",
    border: "border-border hover:border-violet-300",
  },
  "The Woman Company": {
    pill:   "bg-rose-400 text-white",
    btn:    "bg-rose-400 hover:bg-rose-500 text-white",
    border: "border-border hover:border-rose-300",
  },
};

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < full ? "fill-amber-400 text-amber-400"
            : i === full && hasHalf ? "fill-amber-400/50 text-amber-400"
            : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="ml-1 text-[11px] text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const isMamaearth = product.brand === "Mamaearth";
  const style = product.brand ? BRAND_STYLES[product.brand] : BRAND_STYLES["The Woman Company"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.38, delay: Math.min(index, 10) * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg ${style.border}`}
    >
      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-muted/30">
        {/* Badge */}
        {isMamaearth ? (
          <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Leaf className="h-3 w-3" />
            Toxin-Free ✓
          </span>
        ) : product.tag && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-sage px-3 py-1 text-xs font-medium text-white shadow-sm">
            {product.tag}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Quick overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand pill */}
        {product.brand && (
          <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.pill}`}>
            {product.brand}
          </span>
        )}

        <Link to="/product/$id" params={{ id: product.id }} className="mt-2 block">
          <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-sage-deep line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.variant && (
          <p className="mt-0.5 text-xs italic text-muted-foreground">{product.variant}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="mt-1.5">
            <StarRating rating={product.rating} />
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-foreground">{product.priceLabel}</p>
          <Button
            size="sm"
            className={`gap-1.5 transition-all ${style.btn}`}
            onClick={(e) => {
              e.preventDefault();
              addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
