import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — The Women Company" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  // Mock calculations
  const totalMrp = items.reduce((acc, item) => acc + ((item.price * 1.2) * item.quantity), 0);
  const totalDiscount = totalMrp - totalPrice;
  const shipping = totalPrice >= 500 ? 0 : 50;
  const grandTotal = totalPrice + shipping;

  return (
    <main className="min-h-screen bg-muted/20 pb-24">
      
      {/* Header */}
      <div className="bg-white border-b border-border py-6 shadow-sm">
        <div className="container-tight mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Shopping Bag {totalItems > 0 && <span className="text-primary">({totalItems} Items)</span>}
          </h1>
        </div>
      </div>

      <div className="container-tight mx-auto px-4 mt-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-md p-12 text-center shadow-sm border border-border mt-8">
            <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground/30 mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">Your Shopping Bag is Empty</h2>
            <p className="text-muted-foreground mb-8">This feels too light! Go on, add all your favourites.</p>
            <Button asChild className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wide rounded-sm px-8">
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left: Cart Items */}
            <div className="w-full lg:w-8/12 flex flex-col gap-4">
              <div className="bg-white border border-border rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/20 font-bold border-b border-border text-sm text-foreground flex justify-between items-center">
                  <span>Bag Items</span>
                  <span className="text-muted-foreground font-normal">{totalItems} items</span>
                </div>
                
                <div className="divide-y divide-border">
                  {items.map((item) => {
                    const mrp = item.price * 1.2;
                    const discountPercent = Math.round(((mrp - item.price) / mrp) * 100);
                    return (
                      <div key={item.id} className="p-4 flex gap-4 bg-white relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-24 object-contain rounded-sm border border-border p-1"
                        />
                        <div className="flex flex-col flex-1">
                          <h3 className="text-sm font-bold text-foreground pr-8">{item.name}</h3>
                          
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">₹{item.price}</span>
                            <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
                            <span className="text-xs font-bold text-green-600">{discountPercent}% Off</span>
                          </div>
                          
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 border border-border rounded-sm h-8 w-24">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-bold text-foreground">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-4/12 flex flex-col gap-4">
              <div className="bg-white border border-border rounded-md shadow-sm">
                <div className="p-4 bg-muted/20 font-bold border-b border-border text-sm text-foreground">
                  Price Details
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Bag MRP ({totalItems} items)</span>
                    <span>₹{totalMrp.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Bag Discount</span>
                    <span className="text-green-600">-₹{totalDiscount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 flex items-center gap-1">Free <span className="line-through text-muted-foreground text-xs">₹50</span></span>
                    ) : (
                      <span>₹{shipping}</span>
                    )}
                  </div>
                  <hr className="border-border my-2" />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>You Pay</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border-t border-border flex items-center justify-center gap-2 text-green-700 text-sm font-bold rounded-b-md">
                  <Check className="h-4 w-4" /> You will save ₹{totalDiscount.toFixed(0)} on this order
                </div>
              </div>

              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-sm font-bold uppercase tracking-wider rounded-sm shadow-md">
                <Link to="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              {/* Trust markers */}
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                <div className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> 100% Genuine</div>
                <div className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Secure Payment</div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
