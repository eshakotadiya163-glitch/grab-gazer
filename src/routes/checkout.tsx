import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link, Navigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag, ChevronRight, Loader2, Shield, Truck, BadgeCheck,
  CreditCard, Banknote, Copy, Check, QrCode, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Woman's Company" },
      { name: "description", content: "Complete your order securely." },
    ],
  }),
  component: CheckoutPage,
});

const UPI_ID = "thewomanscompany@ibl";
const UPI_NAME = "The Womans Company";
const GST_RATE = 0.18;

const schema = z.object({
  customerName:  z.string().trim().min(2, "Full name required").max(100),
  email:         z.string().trim().email("Valid email required").max(200),
  phone:         z.string().trim().regex(/^\d{10}$/, "10-digit phone required"),
  address:       z.string().trim().min(5, "Street address required").max(300),
  city:          z.string().trim().min(2, "City required").max(80),
  state:         z.string().trim().min(2, "State required").max(80),
  pincode:       z.string().trim().regex(/^\d{6}$/, "6-digit pincode required"),
  paymentMethod: z.enum(["cod", "upi"]),
});
type FormValues = z.infer<typeof schema>;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh",
];

interface Address {
  id: string; label: string | null; full_name: string; phone: string | null;
  line1: string; line2: string | null; city: string; state: string; pincode: string; is_default: boolean;
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive">{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<null | { code: string; discount: number }>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  // UPI panel state (after order created)
  const [pendingOrder, setPendingOrder] = useState<null | { id: string; order_number: string; total: number }>(null);
  const [copied, setCopied] = useState(false);
  const [txnRef, setTxnRef] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled:  !!user?.id,
    queryFn:  async (): Promise<Address[]> => {
      const { data, error } = await supabase.from("addresses" as never).select("*").eq("user_id", user!.id).order("is_default", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Address[];
    },
  });

  const shipping = totalPrice >= 499 ? 0 : 49;
  const discount = coupon?.discount ?? 0;
  const taxableBase = Math.max(0, totalPrice - discount);
  const tax = Math.round(taxableBase * GST_RATE);
  const total = taxableBase + tax + shipping;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "upi" },
  });
  const paymentMethod = watch("paymentMethod");

  // Prefill from user profile / default address once loaded
  useEffect(() => {
    if (user) {
      setValue("customerName", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  const applyAddress = (a: Address) => {
    setValue("customerName", a.full_name);
    if (a.phone) setValue("phone", a.phone);
    setValue("address", [a.line1, a.line2].filter(Boolean).join(", "));
    setValue("city", a.city);
    setValue("state", a.state);
    setValue("pincode", a.pincode);
  };
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      applyAddress(def);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setCouponChecking(true);
    try {
      const { data, error } = await supabase
        .from("coupons" as never)
        .select("code, discount_type, discount_value, min_order_amount, active, expires_at, max_uses, uses")
        .eq("code", code).eq("active", true).maybeSingle();
      if (error) throw error;
      const c = data as any;
      if (!c) { setCouponError("Invalid coupon code"); setCoupon(null); return; }
      if (c.expires_at && new Date(c.expires_at) < new Date()) { setCouponError("Coupon expired"); setCoupon(null); return; }
      if (c.max_uses != null && c.uses >= c.max_uses) { setCouponError("Coupon usage limit reached"); setCoupon(null); return; }
      if (c.min_order_amount != null && totalPrice < Number(c.min_order_amount)) { setCouponError(`Requires min order ₹${c.min_order_amount}`); setCoupon(null); return; }
      const d = c.discount_type === "percent"
        ? Math.round(totalPrice * (Number(c.discount_value) / 100))
        : Math.min(totalPrice, Math.round(Number(c.discount_value)));
      setCoupon({ code: c.code, discount: d });
      toast.success(`Coupon applied — ₹${d} off`);
    } catch (e: any) {
      setCouponError(e?.message ?? "Failed to apply coupon");
    } finally {
      setCouponChecking(false);
    }
  };

  const buildOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

  async function persistOrder(data: FormValues, extra: Record<string, unknown>) {
    const order_number = buildOrderNumber();
    const orderId = crypto.randomUUID();
    const orderRow = {
      id: orderId,
      order_number,
      customer_id: user!.id,
      customer_name: data.customerName,
      customer_email: data.email,
      customer_phone: data.phone,
      address: data.address, city: data.city, state: data.state, pincode: data.pincode,
      subtotal: totalPrice, shipping, discount, tax, total,
      coupon_code: coupon?.code ?? null,
      ...extra,
    };
    const { error: oErr } = await supabase.from("orders" as never).insert(orderRow as never);
    if (oErr) throw oErr;
    const itemRows = items.map((it) => ({
      order_id: orderId,
      product_id: /^[0-9a-f-]{36}$/i.test(it.id) ? it.id : null,
      product_name: it.name, product_image: it.image,
      unit_price: it.price, quantity: it.quantity, subtotal: it.price * it.quantity,
    }));
    const { error: iErr } = await supabase.from("order_items" as never).insert(itemRows as never);
    if (iErr) throw iErr;
    return { id: orderId, order_number };
  }

  const handleCOD = async (data: FormValues) => {
    const { order_number } = await persistOrder(data, {
      status: "confirmed", payment_status: "unpaid", payment_method: "Cash on Delivery",
    });
    clearCart();
    toast.success("Order placed successfully!");
    await navigate({ to: "/order-confirmation", search: { orderId: order_number, total: String(total) } });
  };

  const handleUPIStart = async (data: FormValues) => {
    const created = await persistOrder(data, {
      status: "pending", payment_status: "pending_verification", payment_method: "UPI",
    });
    setPendingOrder({ id: created.id, order_number: created.order_number, total });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    setIsSubmitting(true);
    try {
      if (data.paymentMethod === "cod") await handleCOD(data);
      else await handleUPIStart(data);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiLink = useMemo(() => {
    if (!pendingOrder) return "";
    const params = new URLSearchParams({
      pa: UPI_ID, pn: UPI_NAME, am: String(pendingOrder.total),
      cu: "INR", tn: `Order ${pendingOrder.order_number}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [pendingOrder]);

  const qrUrl = useMemo(() => {
    if (!upiLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`;
  }, [upiLink]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
      toast.success("UPI ID copied");
    } catch { toast.error("Could not copy — please copy manually"); }
  };

  const confirmUpiPayment = async () => {
    if (!pendingOrder) return;
    if (!txnRef.trim() && !screenshotFile) {
      toast.error("Please enter a transaction reference or upload a screenshot");
      return;
    }
    setConfirming(true);
    try {
      let screenshotUrl: string | null = null;
      if (screenshotFile) {
        const ext = screenshotFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user!.id}/${pendingOrder.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, screenshotFile, { upsert: true });
        if (upErr) throw upErr;
        screenshotUrl = path;
      }
      const { error: uErr } = await supabase
        .from("orders" as never)
        .update({
          payment_reference: txnRef.trim() || null,
          payment_screenshot_url: screenshotUrl,
          payment_status: "awaiting_verification",
        } as never)
        .eq("id", pendingOrder.id);
      if (uErr) throw uErr;
      clearCart();
      toast.success("Payment submitted — we'll verify shortly");
      await navigate({ to: "/order-confirmation", search: { orderId: pendingOrder.order_number, total: String(pendingOrder.total) } });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not submit payment");
    } finally {
      setConfirming(false);
    }
  };

  // ─── auth guard ─────────────────────────────────────
  if (!hydrated) {
    return <main className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</main>;
  }
  if (!user) {
    return <Navigate to="/login" search={{ redirect: "/checkout" } as never} />;
  }

  if (items.length === 0 && !pendingOrder) {
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

  // ─── UPI PAYMENT PANEL ───────────────────────────
  if (pendingOrder) {
    return (
      <main className="min-h-screen bg-background">
        <section className="border-b bg-card py-5">
          <div className="container-tight">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">UPI Payment</span>
            </nav>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Complete UPI Payment</h1>
            <p className="text-sm text-muted-foreground">
              Order <span className="font-mono">{pendingOrder.order_number}</span> · ₹{pendingOrder.total}
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container-tight max-w-2xl">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sage-deep">
                  <QrCode className="h-5 w-5" /><span className="font-medium">Scan to pay ₹{pendingOrder.total}</span>
                </div>
                {qrUrl && (
                  <img src={qrUrl} alt="UPI QR" width={260} height={260}
                       className="rounded-lg border bg-white p-2" />
                )}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground">UPI ID</p>
                      <p className="font-mono text-sm">{UPI_ID}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={copyUpi} className="gap-1.5">
                      {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </Button>
                  </div>
                  <Button asChild className="w-full bg-sage text-white hover:bg-sage-deep">
                    <a href={upiLink}>Open UPI app to pay</a>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Works on mobile · Amount will be pre-filled
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <h3 className="font-semibold">After you've paid</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the UPI/UTR reference from your payment app and/or upload a screenshot.
                Our team will verify and confirm your order.
              </p>

              <div className="mt-4 space-y-3">
                <FieldWrap label="UPI / UTR reference (optional)">
                  <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)}
                         placeholder="e.g. 431276598234" maxLength={40} />
                </FieldWrap>
                <FieldWrap label="Payment screenshot (optional)">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      {screenshotFile ? "Change file" : "Choose file"}
                      <input type="file" accept="image/*" className="sr-only"
                             onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)} />
                    </label>
                    {screenshotFile && (
                      <span className="truncate text-xs text-muted-foreground">{screenshotFile.name}</span>
                    )}
                  </div>
                </FieldWrap>
                <Button onClick={confirmUpiPayment} disabled={confirming}
                  className="w-full bg-sage text-white hover:bg-sage-deep">
                  {confirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "I have completed payment"}
                </Button>
                <button type="button" onClick={() => setPendingOrder(null)}
                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                  Cancel and edit order
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card py-5">
        <div className="container-tight">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/cart" className="hover:text-foreground">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Checkout</span>
          </nav>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Complete Your Order</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="container-tight grid gap-10 lg:grid-cols-[1fr_380px]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {addresses.length > 0 && (
                <div className="rounded-2xl border bg-card p-6">
                  <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">Saved Addresses</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <button type="button" key={a.id} onClick={() => applyAddress(a)}
                        className="rounded-xl border p-3 text-left text-sm hover:border-sage">
                        <p className="font-medium">{a.full_name} <span className="text-xs text-muted-foreground">{a.label ? `· ${a.label}` : ""}{a.is_default ? " · Default" : ""}</span></p>
                        <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.pincode}</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Manage in <Link to="/profile" className="underline">your profile</Link>.</p>
                </div>
              )}

              <div className="rounded-2xl border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">Contact Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap label="Full Name" error={errors.customerName?.message}>
                    <Input {...register("customerName")} placeholder="Priya Sharma" className="h-10" />
                  </FieldWrap>
                  <FieldWrap label="Email" error={errors.email?.message}>
                    <Input {...register("email")} type="email" placeholder="priya@example.com" className="h-10" />
                  </FieldWrap>
                  <FieldWrap label="Phone" error={errors.phone?.message}>
                    <Input {...register("phone")} type="tel" placeholder="9876543210" maxLength={10} className="h-10" />
                  </FieldWrap>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">Shipping Address</h2>
                <div className="grid gap-4">
                  <FieldWrap label="Street Address" error={errors.address?.message}>
                    <Input {...register("address")} placeholder="123 MG Road, Apt 4B" className="h-10" />
                  </FieldWrap>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FieldWrap label="City" error={errors.city?.message}>
                      <Input {...register("city")} placeholder="Mumbai" className="h-10" />
                    </FieldWrap>
                    <FieldWrap label="State" error={errors.state?.message}>
                      <select {...register("state")}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FieldWrap>
                    <FieldWrap label="Pincode" error={errors.pincode?.message}>
                      <Input {...register("pincode")} placeholder="400001" maxLength={6} className="h-10" />
                    </FieldWrap>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6">
                <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">Payment Method</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${paymentMethod === "upi" ? "border-sage bg-sage/5" : "border-border hover:border-sage/50"}`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className={`h-5 w-5 ${paymentMethod === "upi" ? "text-sage" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">Online Payment (UPI)</p>
                        <p className="text-xs text-muted-foreground">Scan QR / any UPI app</p>
                      </div>
                    </div>
                    <input type="radio" value="upi" {...register("paymentMethod")} className="sr-only" />
                  </label>
                  <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${paymentMethod === "cod" ? "border-sage bg-sage/5" : "border-border hover:border-sage/50"}`}>
                    <div className="flex items-center gap-3">
                      <Banknote className={`h-5 w-5 ${paymentMethod === "cod" ? "text-sage" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                    <input type="radio" value="cod" {...register("paymentMethod")} className="sr-only" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[{ icon: Shield, text: "Secure Checkout" },{ icon: Truck, text: "Free Shipping ₹499+" },{ icon: BadgeCheck, text: "100% Genuine" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center">
                    <Icon className="h-5 w-5 text-sage-deep" />
                    <span className="text-[11px] text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting}
                className="w-full gap-2 bg-sage text-white hover:bg-sage-deep disabled:opacity-70">
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                  : paymentMethod === "cod" ? "Place Order (COD)" : "Continue to UPI Payment"}
              </Button>
            </form>
          </motion.div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">Order Summary</h2>
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-border" />

              {/* Coupon */}
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Coupon</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="h-9" disabled={!!coupon} />
                  {coupon ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => { setCoupon(null); setCouponCode(""); setCouponError(null); }}>Remove</Button>
                  ) : (
                    <Button type="button" size="sm" onClick={applyCoupon} disabled={couponChecking}>
                      {couponChecking ? "…" : "Apply"}
                    </Button>
                  )}
                </div>
                {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
                {coupon && <p className="mt-1 text-xs text-emerald-700">Applied {coupon.code} — ₹{coupon.discount} off</p>}
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-₹{discount}</span></div>}
                <div className="flex justify-between"><span>GST (18%)</span><span>₹{tax}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                <div className="my-2 h-px bg-border" />
                <div className="flex justify-between text-base font-semibold"><span>Grand Total</span><span>₹{total}</span></div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
