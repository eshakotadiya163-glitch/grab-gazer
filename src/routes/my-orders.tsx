import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/my-orders")({
  head: () => ({
    meta: [
      { title: "My Orders — The Woman's Company" },
      { name: "description", content: "View your order history and track shipments." },
    ],
  }),
  component: MyOrdersPage,
});

type OrderItem = {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total: number;
  shipping: number;
  subtotal: number;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-600 bg-amber-50" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  shipped:   { label: "Shipped",   icon: Truck,        color: "text-blue-600 bg-blue-50" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-sage-deep bg-sage/10" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-red-600 bg-red-50" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, icon: Clock, color: "text-muted-foreground bg-muted" };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function MyOrdersPage() {
  const { user } = useAuth();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled:  !!user?.id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, status, payment_status, payment_method,
          total, shipping, subtotal, created_at,
          order_items ( id, product_name, product_image, quantity, unit_price, subtotal )
        `)
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  if (!user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <Package className="mx-auto h-14 w-14 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">You are not logged in</p>
          <p className="mt-1 text-sm text-muted-foreground">Please log in to view your orders.</p>
          <Button asChild className="mt-5 bg-sage text-white hover:bg-sage-deep">
            <Link to="/login">Log in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb header */}
      <section className="border-b border-border bg-card py-5">
        <div className="container-tight">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">My Orders</span>
          </nav>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">My Orders</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="container-tight max-w-3xl">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">Failed to load orders. Please try again.</p>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your order history will appear here after your first purchase.
              </p>
              <Button asChild className="mt-5 bg-sage text-white hover:bg-sage-deep">
                <Link to="/shop">Start shopping</Link>
              </Button>
            </div>
          )}

          <div className="space-y-5">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-foreground">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} />
                    {order.payment_status === "paid" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    )}
                    {order.payment_status === "unpaid" && order.payment_method === "Cash on Delivery" && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">COD</span>
                    )}
                  </div>
                </div>

                {/* Order items */}
                <div className="divide-y divide-border px-5">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.unit_price}</p>
                      </div>
                      <p className="text-sm font-semibold">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                    {order.shipping === 0 ? " · Free shipping" : ` · ₹${order.shipping} shipping`}
                  </p>
                  <p className="text-sm font-bold">Total: ₹{order.total}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
