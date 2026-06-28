import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — The Woman's Company" },
      { name: "description", content: "Review your cart and proceed to checkout." },
      { property: "og:title", content: "Cart — The Woman's Company" },
      { property: "og:description", content: "Review your cart and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Your Cart
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {totalItems > 0 ? `You have ${totalItems} item${totalItems === 1 ? "" : "s"} in your cart.` : "Your cart is empty."}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <p className="mt-6 text-lg text-muted-foreground">
                Looks like you haven't added anything yet.
              </p>
              <Button asChild className="mt-6 bg-sage text-white hover:bg-sage-deep" size="lg">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">Rs. {item.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-input transition-colors hover:bg-accent"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-input transition-colors hover:bg-accent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                  Order Summary
                </h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>Rs. {totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span>Rs. {totalPrice}</span>
                  </div>
                </div>
                <Button className="mt-6 w-full gap-2 bg-sage text-white hover:bg-sage-deep" size="lg">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
