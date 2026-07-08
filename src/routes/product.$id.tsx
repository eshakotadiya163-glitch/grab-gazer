import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Heart, ShoppingBag, Check, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductById, getShopCatalogFn } from "@/lib/repositories";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const [product, catalog] = await Promise.all([
      fetchProductById(params.id),
      getShopCatalogFn(),
    ]);
    if (!product) throw notFound();
    const related = catalog.products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return { product, related };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name ?? "Product"} — The Women Company` },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product, related } = Route.useLoaderData() as { product: import("@/components/ProductCard").Product; related: import("@/components/ProductCard").Product[] };
  const { addItem } = useCart();
  const { has: isWished, toggle: toggleWish } = useWishlist();
  
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  
  const imageSrc = product.image || product.image_url || "/assets/images/products/placeholder.png";
  const inStock = (product.stock ?? 0) > 0;
  const mrp = product.mrp || (product.price * 1.2);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);
  const ratingCount = Math.floor(Math.random() * 500) + 50;

  const handleAddToCart = () => {
    for (let i=0; i<qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: imageSrc });
    }
    toast.success(`${product.name} added to bag!`, { icon: <ShoppingBag className="h-4 w-4" /> });
  };

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border py-3 px-4 shadow-sm">
        <div className="container-tight mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" search={{ category: product.category }} className="hover:text-primary">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container-tight mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-8 bg-white p-4 md:p-6 rounded-md shadow-sm border border-border">
          
          {/* Left: Large Image Gallery */}
          <div className="w-full lg:w-5/12 shrink-0">
            <div className="relative aspect-square w-full rounded-sm border border-border overflow-hidden bg-white group cursor-zoom-in">
              <img 
                src={imageSrc} 
                alt={product.name} 
                className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-125"
              />
              <button 
                onClick={() => toggleWish(product.id)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md border border-border text-muted-foreground hover:text-primary"
              >
                <Heart className={`h-5 w-5 ${isWished(product.id) ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
              <div className="w-20 h-20 border-2 border-primary rounded-sm p-1 cursor-pointer">
                <img src={imageSrc} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-7/12 flex flex-col">
            {product.brand && (
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {product.brand}
              </h2>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <div className="flex items-center bg-green-700 text-white px-1.5 py-0.5 rounded-sm text-xs font-bold gap-1">
                {product.rating?.toFixed(1) || "4.5"} <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{ratingCount} ratings & reviews</span>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
                {mrp > product.price && (
                  <span className="text-muted-foreground line-through text-sm mb-1">MRP: ₹{mrp}</span>
                )}
                {mrp > product.price && (
                  <span className="text-green-600 font-bold text-sm mb-1">{discount}% Off</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">inclusive of all taxes</p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-bold text-foreground mb-2">Quantity</p>
              <select 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-24 h-10 border border-input rounded-sm px-3 outline-none focus:border-primary text-sm"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wide rounded-sm text-sm"
              >
                {inStock ? "Add to Bag" : "Out of Stock"}
              </Button>
              <Button 
                onClick={() => { toggleWish(product.id); toast.success("Added to wishlist!"); }}
                variant="outline"
                className="flex-1 h-12 border-border text-foreground font-bold uppercase tracking-wide hover:bg-muted/20 rounded-sm text-sm"
              >
                <Heart className={`h-4 w-4 mr-2 ${isWished(product.id) ? "fill-primary text-primary" : ""}`} /> Wishlist
              </Button>
            </div>
            
            {/* Delivery */}
            <div className="border border-border rounded-sm p-4 bg-muted/10">
              <div className="flex items-center gap-3 font-bold text-sm text-foreground mb-2">
                <Truck className="h-5 w-5 text-primary" /> Delivery Options
              </div>
              <div className="relative">
                <input type="text" placeholder="Enter Pincode" className="h-10 w-full border border-input rounded-sm pl-3 pr-20 text-sm outline-none focus:border-primary" />
                <button className="absolute right-0 top-0 h-10 px-4 text-primary font-bold text-sm hover:underline">Check</button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" /> Free delivery on orders above ₹500
              </p>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="bg-white rounded-md shadow-sm border border-border mt-8 overflow-hidden">
          <div className="flex border-b border-border text-sm font-bold bg-muted/20">
            <button 
              className={`flex-1 py-4 text-center ${activeTab === 'description' ? "border-b-2 border-primary text-primary bg-white" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`flex-1 py-4 text-center ${activeTab === 'ingredients' ? "border-b-2 border-primary text-primary bg-white" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button 
              className={`flex-1 py-4 text-center ${activeTab === 'howToUse' ? "border-b-2 border-primary text-primary bg-white" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab('howToUse')}
            >
              How to Use
            </button>
          </div>
          <div className="p-6 text-sm text-foreground leading-relaxed">
            {activeTab === 'description' && (
              <p>{product.description || "Premium beauty product designed with love and care for modern women. Authentic ingredients and long-lasting quality."}</p>
            )}
            {activeTab === 'ingredients' && (
              <p>Aqua, Glycerin, Niacinamide, Natural Extracts, Essential Oils, Preservatives (Safe & Toxin-Free). 100% cruelty-free and dermatologically tested.</p>
            )}
            {activeTab === 'howToUse' && (
              <p>Apply a generous amount onto clean skin. Massage gently in circular motions until fully absorbed. For best results, use daily.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
