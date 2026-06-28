import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: z.object({
    orderId: z.string().optional(),
    total:   z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — The Woman's Company" },
      { name: "description", content: "Your order has been placed successfully." },
    ],
  }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const { orderId, total } = Route.useSearch();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground">
              Order Confirmed! 🎉
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for your purchase. We've received your order and will process it shortly.
            </p>
          </motion.div>

          {orderId && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6 rounded-xl bg-muted/40 px-5 py-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order ID</p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{orderId}</p>
              {total && (
                <p className="mt-1 text-sm text-muted-foreground">Amount: <span className="font-semibold text-foreground">₹{total}</span></p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mt-6 space-y-3 rounded-xl border border-border bg-background/50 p-4 text-left text-sm"
          >
            {[
              { icon: Package, label: "Estimated Delivery", value: "3–5 business days" },
              { icon: CheckCircle2, label: "Confirmation Email", value: "Sent to your inbox" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sage/10">
                  <Icon className="h-4 w-4 text-sage-deep" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild className="flex-1 gap-2 bg-sage text-white hover:bg-sage-deep" size="lg">
              <Link to="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
