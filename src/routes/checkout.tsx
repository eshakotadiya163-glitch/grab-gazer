import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ChevronRight, Loader2, Shield, Truck, BadgeCheck,
  CreditCard, Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { useCart } from "@/components/cart-context";
import { ordersRepo, orderItemsRepo } from "@/lib/repositories";
import { useAuth } from "@/components/auth-context";
import { createRazorpayOrderFn, verifyRazorpayPaymentFn } from "@/lib/payments";

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
  customerName:  z.string().min(2, "Full name required"),
  email:         z.string().email("Valid email required"),
  phone:         z.string().min(10, "10-digit phone required").max(10),
  address:       z.string().min(5, "Street address required"),
  city:          z.string().min(2, "City required"),
  state:         z.string().min(2, "State required"),
  pincode:       z.string().length(6, "6-digit pincode required"),
  paymentMethod: z.enum(["cod", "online"]),
});
type FormValues = z.infer<typeof schema>;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh",
];

function FormField({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
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

// Helper: create the order + items in the database, returns the created order
async function createOrder(
  data: FormValues,
  items: ReturnType<typeof useCart>["items"],
  userId: string,
  shipping: number,
  total: number,
  extraFields: Record<string, unknown> = {},
) {
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const order = await ordersRepo.create({
    order_number:   orderNumber,
    customer_id:    userId,
    customer_name:  data.customerName,
    customer_email: data.email,
    customer_phone: data.phone,
    address: data.address,
    city:    data.city,
    state:   data.state,
    pincode: data.pincode,
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    shipping,
    total,
    ...extraFields,
  } as any);

  await Promise.all(
    items.map((it) =>
      orderItemsRepo.create({
        order_id:      (order as any).id,
        product_id:    it.id.length === 36 ? it.id : null,
        product_name:  it.name,
        product_image: it.image,
        unit_price:    it.price,
        quantity:      it.quantity,
        subtotal:      it.price * it.quantity,
      } as any),
    ),
  );

  return { order, orderNumber };
}

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate   = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload Razorpay SDK script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script  = document.createElement("script");
    script.id     = "razorpay-script";
    script.src    = "https://checkout.razorpay.com/v1/checkout.js";
    script.async  = true;
    document.body.appendChild(script);
  }, []);

  const shipping = totalPrice >= 499 ? 0 : 49;
  const total    = totalPrice + shipping;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { paymentMethod: "online" },
  });

  const paymentMethod = watch("paymentMethod");

  /** ─── COD flow ─────────────────────────────────────────── */
  const handleCOD = async (data: FormValues) => {
    if (!user) { toast.error("Please log in to place an order."); return; }
    const { orderNumber } = await createOrder(data, items, user.id, shipping, total, {
      status:         "confirmed",
      payment_status: "unpaid",
      payment_method: "Cash on Delivery",
    });
    clearCart();
    toast.success("Order placed successfully!");
    await navigate({
      to: "/order-confirmation",
      search: { orderId: orderNumber, total: String(total) },
    });
  };

  /** ─── Razorpay flow ─────────────────────────────────────── */
  const handleOnlinePayment = async (data: FormValues) => {
    if (!user) { toast.error("Please log in to place an order."); return; }

    // Step 1: Create a Razorpay order on the server (no DB order yet)
    const rzpayOrder = await createRazorpayOrderFn({
      data: { amount: total, receipt: `ORD-${Date.now().toString(36).toUpperCase()}` },
    });

    if (!rzpayOrder.success || !rzpayOrder.orderId) {
      throw new Error("Failed to create Razorpay order. Please try again.");
    }

    // Step 2: Open Razorpay modal
    await new Promise<void>((resolve, reject) => {
      const options = {
        key:      import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
        amount:   rzpayOrder.amount,
        currency: rzpayOrder.currency,
        name:     "The Woman's Company",
        description: `Payment for ₹${total}`,
        order_id: rzpayOrder.orderId,

        handler: async function (response: any) {
          try {
            // Step 3: Verify signature server-side
            const verifyRes = await verifyRazorpayPaymentFn({
              data: {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              },
            });

            if (!verifyRes.success) throw new Error("Payment verification failed");

            // Step 4: Only NOW create the DB order (payment is confirmed)
            const { orderNumber } = await createOrder(data, items, user!.id, shipping, total, {
              status:              "confirmed",
              payment_status:      "paid",
              payment_method:      "Online",
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            clearCart();
            toast.success("Payment successful! Order confirmed.");
            await navigate({
              to: "/order-confirmation",
              search: { orderId: orderNumber, total: String(total) },
            });
            resolve();
          } catch (err: any) {
            toast.error(err.message || "Payment confirmed but order failed. Contact support.");
            reject(err);
          }
        },

        modal: {
          ondismiss: () => {
            // User closed the popup — no order was created, which is correct
            toast.error("Payment cancelled. No order was placed.");
            resolve(); // resolve (not reject) to not trigger outer error handler
          },
        },

        prefill: {
          name:    data.customerName,
          email:   data.email,
          contact: data.phone,
        },
        theme: { color: "#5B7E62" }, // sage green
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed. Please try again.");
        resolve(); // do not create order
      });
      rzp.open();
    });
  };

  /** ─── Main submit handler ───────────────────────────────── */
  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    setIsSubmitting(true);
    try {
      if (data.paymentMethod === "cod") {
        await handleCOD(data);
      } else {
        await handleOnlinePayment(data);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
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
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Complete Your Order
          </h1>
        </div>
      </section>

      <section className="py-10">
        <div className="container-tight grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* ── Form ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">
                  Contact Information
                </h2>
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
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">
                  Shipping Address
                </h2>
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
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Pincode" error={errors.pincode?.message}>
                      <Input {...register("pincode")} placeholder="400001" maxLength={6} className="h-10" />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">
                  Payment Method
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Online */}
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "online"
                        ? "border-sage bg-sage/5"
                        : "border-border hover:border-sage/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        paymentMethod === "online" ? "border-sage" : "border-muted-foreground"
                      }`}>
                        {paymentMethod === "online" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-sage" />
                        )}
                      </div>
                      <CreditCard className={`h-5 w-5 ${paymentMethod === "online" ? "text-sage" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">Online Payment</p>
                        <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                    <input type="radio" value="online" {...register("paymentMethod")} className="sr-only" />
                  </label>

                  {/* COD */}
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === "cod"
                        ? "border-sage bg-sage/5"
                        : "border-border hover:border-sage/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        paymentMethod === "cod" ? "border-sage" : "border-muted-foreground"
                      }`}>
                        {paymentMethod === "cod" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-sage" />
                        )}
                      </div>
                      <Banknote className={`h-5 w-5 ${paymentMethod === "cod" ? "text-sage" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                    <input type="radio" value="cod" {...register("paymentMethod")} className="sr-only" />
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-xs text-destructive">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield,      text: "Secure Checkout" },
                  { icon: Truck,       text: "Free Shipping ₹499+" },
                  { icon: BadgeCheck,  text: "100% Genuine" },
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
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : paymentMethod === "cod" ? (
                  "Place Order"
                ) : (
                  "Pay Now →"
                )}
              </Button>
            </form>
          </motion.div>

          {/* ── Order Summary ─────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
                Order Summary
              </h2>
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    />
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
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="font-medium text-emerald-600">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
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
