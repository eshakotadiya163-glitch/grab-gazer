import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
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
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        {product.tag && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-sage px-3 py-1 text-xs font-medium text-white">
            {product.tag}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={408}
          height={408}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {product.brand && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-sage-deep">
            {product.brand}
          </span>
        )}
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        {product.variant && (
          <p className="mt-1 text-sm italic text-muted-foreground">{product.variant}</p>
        )}
        <p className="mt-2 text-lg font-medium text-foreground">{product.priceLabel}</p>
        <Button
          className="mt-4 w-full gap-2 bg-sage text-white hover:bg-sage-deep transition-colors"
          onClick={() =>
            addItem({ id: product.id, name: product.name, price: product.price, image: product.image })
          }
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}
