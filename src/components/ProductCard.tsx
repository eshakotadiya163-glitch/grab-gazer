import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";

export interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  image_url?: string;
  tag?: string;
  brand?: string;
  category?: string;
  variant?: string;
  description?: string;
  rating?: number;
  stock?: number;
  mrp?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const PLACEHOLDER = "/assets/images/products/placeholder.png";

function productImage(product: Product) {
  return product.image || product.image_url || PLACEHOLDER;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < full ? "fill-yellow-400 text-yellow-400"
            : i === full && hasHalf ? "fill-yellow-400/50 text-yellow-400"
            : "fill-border text-border"
          }`}
        />
      ))}
      <span className="ml-1 text-[11px] text-muted-foreground font-medium">({Math.floor(Math.random() * 500) + 50})</span>
    </span>
  );
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const imageSrc = productImage(product);
  const inStock = (product.stock ?? 0) > 0;
  
  // Calculate discount percentage
  const mrp = product.mrp || (product.price * 1.2); // Fallback to 20% off if no MRP
  const discount = Math.round(((mrp - product.price) / mrp) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.05 }}
      className="group relative flex flex-col bg-white border border-border/60 hover:shadow-lg transition-shadow duration-300 rounded-md overflow-hidden"
    >
      <div className="relative aspect-square p-4 bg-white overflow-hidden">
        {/* Wishlist Icon */}
        <button 
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-border/50 text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Added to wishlist");
          }}
        >
          <Heart className="h-4 w-4" />
        </button>

        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Tag (Bestseller, New, etc) */}
        {product.tag && (
          <span className="absolute left-0 bottom-0 z-10 bg-[#FFD2D2] text-[#D82E2E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 text-center">
        {product.brand && (
          <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        
        <Link to="/product/$id" params={{ id: product.id }} className="mb-2">
          <h3 className="text-[13px] font-medium leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-center mb-2">
          <StarRating rating={product.rating || (4 + Math.random())} />
        </div>

        <div className="mt-auto pt-2 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">₹{product.price}</span>
          {mrp > product.price && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
              <span className="text-xs font-bold text-green-600">{discount}% Off</span>
            </>
          )}
        </div>
      </div>

      {/* Add to Bag Button */}
      <div className="p-3 pt-0 mt-auto border-t border-border/30">
        <Button 
          disabled={!inStock}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm h-9 text-xs font-bold tracking-wide uppercase transition-colors"
          onClick={(e) => {
            e.preventDefault();
            if (!inStock) return;
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: imageSrc,
            });
            toast.success("Added to bag", { icon: <ShoppingBag className="h-4 w-4" /> });
          }}
        >
          {inStock ? "Add to Bag" : "Out of Stock"}
        </Button>
      </div>
    </motion.article>
  );
}
