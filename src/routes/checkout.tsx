import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, Loader2, Shield, Truck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart-context";
import { ordersRepo, orderItemsRepo } from "@/lib/repositories";
import { useAuth } from "@/components/auth-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Woman's Company" },
      { name: "description", content: "Complete your order securely." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customerName: z.string().min(2, "Full name required"),
  email:        z.string().email("Valid email required"),
  phone:        z.string().min(10, "10-digit phone required").max(10),
  address:      z.string().min(5, "Street address required"),
  city:         z.string().min(2, "City required"),
  state:        z.string().min(2, "State required"),
  pincode:      z.string().length(6, "6-digit pincode required"),
});
type FormValues = z.infer<typeof schema>;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh",
];

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = totalPrice >= 499 ? 0 : 49;
  const total    = totalPrice + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const order = placeOrder({ ...data, items });
      clearCart();
      toast.success("Order placed!");
      await navigate({
        to: "/order-confirmation",
        search: { orderId: order.orderId, total: String(order.total) },
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">Your cart is empty</p>
          <Button asChild className="mt-4 bg-sage text-white hover:bg-sage-deep">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header strip */}
      <section className="border-b border-border bg-card py-5">
        <div className="container-tight">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Checkout</span>
          </nav>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Complete Your Order</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="container-tight grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">Contact Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Full Name" error={errors.customerName?.message}>
                    <Input {...register("customerName")} placeholder="Priya Sharma" className="h-10" />
                  </FormField>
                  <FormField label="Email Address" error={errors.email?.message}>
                    <Input {...register("email")} type="email" placeholder="priya@example.com" className="h-10" />
                  </FormField>
                  <FormField label="Phone Number" error={errors.phone?.message}>
                    <Input {...register("phone")} type="tel" placeholder="9876543210" maxLength={10} className="h-10" />
                  </FormField>
                </div>
              </div>

              {/* Shipping */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">Shipping Address</h2>
                <div className="grid gap-4">
                  <FormField label="Street Address" error={errors.address?.message}>
                    <Input {...register("address")} placeholder="123 MG Road, Apartment 4B" className="h-10" />
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField label="City" error={errors.city?.message}>
                      <Input {...register("city")} placeholder="Mumbai" className="h-10" />
                    </FormField>
                    <FormField label="State" error={errors.state?.message}>
                      <select
                        {...register("state")}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Pincode" error={errors.pincode?.message}>
                      <Input {...register("pincode")} placeholder="400001" maxLength={6} className="h-10" />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, text: "Secure Checkout" },
                  { icon: Truck,  text: "Free Shipping ₹499+" },
                  { icon: BadgeCheck, text: "100% Genuine" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
                    <Icon className="h-5 w-5 text-sage-deep" />
                    <span className="text-[11px] text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full gap-2 bg-sage text-white hover:bg-sage-deep disabled:opacity-70"
              >
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</> : "Place Order"}
              </Button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">Order Summary</h2>
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} width={48} height={48}
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span><span>₹{total}</span>
                </div>
              </div>
              {shipping > 0 && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                  Add ₹{499 - totalPrice} more for free shipping!
                </p>
              )}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
