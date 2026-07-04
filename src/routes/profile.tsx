import { useState } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User, MapPin, Package, Heart, Lock, LogOut, Plus, Pencil, Trash2, ChevronRight,
  Clock, CheckCircle2, Truck, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useWishlist } from "@/components/wishlist-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — The Woman's Company" },
      { name: "description", content: "Manage your profile, addresses, orders, and wishlist." },
    ],
  }),
  component: ProfilePage,
});

type Tab = "info" | "addresses" | "orders" | "wishlist" | "password";

function ProfilePage() {
  const { user, hydrated, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("info");
  const navigate = useNavigate();

  if (!hydrated) return <main className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</main>;
  if (!user) return <Navigate to="/login" search={{ redirect: "/profile" } as never} />;

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "info",      label: "Profile",   icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders",    label: "Orders",    icon: Package },
    { id: "wishlist",  label: "Wishlist",  icon: Heart },
    { id: "password",  label: "Password",  icon: Lock },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card py-5">
        <div className="container-tight">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">My Profile</span>
          </nav>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Welcome, {user.name || user.email}</h1>
        </div>
      </section>

      <section className="py-8">
        <div className="container-tight grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border bg-card p-3 h-max">
            <nav className="flex flex-col gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${tab === id ? "bg-sage/10 text-sage-deep font-medium" : "hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
              <button
                onClick={async () => { await logout(); toast.success("Signed out"); await navigate({ to: "/" }); }}
                className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>

          <div>
            {tab === "info"      && <ProfileInfo />}
            {tab === "addresses" && <Addresses />}
            {tab === "orders"    && <Orders />}
            {tab === "wishlist"  && <WishlistPanel />}
            {tab === "password"  && <PasswordChange />}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── PROFILE INFO ─────────────────────────────────── */
function ProfileInfo() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user!.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles" as never).select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles" as never)
        .update({ full_name: name, phone } as never).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile", user!.id] }); toast.success("Profile updated"); setEditing(false); },
    onError: (e: any) => toast.error(e.message ?? "Update failed"),
  });

  const startEdit = () => {
    setName(profile?.full_name ?? user?.name ?? "");
    setPhone(profile?.phone ?? "");
    setEditing(true);
  };

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Profile Information</h2>
        {!editing && <Button variant="outline" size="sm" onClick={startEdit}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-muted-foreground">Full name</Label>
          {editing
            ? <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            : <p className="mt-1 text-sm">{profile?.full_name ?? user?.name ?? "—"}</p>}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <p className="mt-1 text-sm">{profile?.email ?? user?.email}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Phone</Label>
          {editing
            ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} placeholder="9876543210" />
            : <p className="mt-1 text-sm">{profile?.phone ?? "—"}</p>}
        </div>
      </div>
      {editing && (
        <div className="mt-5 flex gap-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-sage text-white hover:bg-sage-deep">Save</Button>
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

/* ─── ADDRESSES ─────────────────────────────────── */
interface Address {
  id: string; label: string | null; full_name: string; phone: string | null;
  line1: string; line2: string | null; city: string; state: string; pincode: string; is_default: boolean;
}
const emptyAddress = { label: "", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false };

function Addresses() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<null | (typeof emptyAddress & { id?: string })>(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", user!.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses" as never).select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Address[];
    },
  });

  const save = useMutation({
    mutationFn: async (a: typeof emptyAddress & { id?: string }) => {
      const payload = { ...a, user_id: user!.id, label: a.label || null, phone: a.phone || null, line2: a.line2 || null };
      if (a.id) {
        const { error } = await supabase.from("addresses" as never).update(payload as never).eq("id", a.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses" as never).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["addresses", user!.id] }); toast.success("Address saved"); setEditing(null); },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["addresses", user!.id] }); toast.success("Address deleted"); },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Saved Addresses</h2>
        <Button size="sm" onClick={() => setEditing({ ...emptyAddress })} className="bg-sage text-white hover:bg-sage-deep">
          <Plus className="mr-1.5 h-4 w-4" /> Add address
        </Button>
      </div>

      {editing && (
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-medium">{editing.id ? "Edit" : "New"} address</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input placeholder="Label (Home, Office)" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} maxLength={30} />
            <Input placeholder="Full name" value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} maxLength={100} />
            <Input placeholder="Phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} maxLength={15} />
            <Input placeholder="Address line 1" value={editing.line1} onChange={(e) => setEditing({ ...editing, line1: e.target.value })} maxLength={200} />
            <Input placeholder="Address line 2 (optional)" value={editing.line2} onChange={(e) => setEditing({ ...editing, line2: e.target.value })} maxLength={200} />
            <Input placeholder="City" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} maxLength={80} />
            <Input placeholder="State" value={editing.state} onChange={(e) => setEditing({ ...editing, state: e.target.value })} maxLength={80} />
            <Input placeholder="Pincode" value={editing.pincode} onChange={(e) => setEditing({ ...editing, pincode: e.target.value })} maxLength={6} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_default} onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })} />
              Set as default
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => {
              if (!editing.full_name || !editing.line1 || !editing.city || !editing.state || editing.pincode.length !== 6) {
                toast.error("Fill in all required fields"); return;
              }
              save.mutate(editing);
            }} disabled={save.isPending} className="bg-sage text-white hover:bg-sage-deep">Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : addresses.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No saved addresses yet.</p>
        : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{a.full_name} {a.is_default && <span className="ml-1 rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage-deep">Default</span>}</p>
                    {a.label && <p className="text-xs text-muted-foreground">{a.label}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing({ ...a, label: a.label ?? "", line2: a.line2 ?? "", phone: a.phone ?? "" })}
                      className="rounded p-1.5 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm("Delete this address?")) remove.mutate(a.id); }}
                      className="rounded p-1.5 hover:bg-muted text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                  {a.city}, {a.state} — {a.pincode}<br />
                  {a.phone && <>📞 {a.phone}</>}
                </p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ─── ORDERS with tracking timeline ─────────────────────────────────── */
const TRACKING_STEPS = ["Order Placed", "Payment Received", "Packed", "Shipped", "Out for Delivery", "Delivered"] as const;
function trackingIndex(status: string, paymentStatus: string): number {
  if (status === "delivered") return 5;
  if (status === "shipped") return 4;
  if (status === "packed") return 2;
  if (status === "confirmed") return paymentStatus === "paid" ? 1 : 0;
  return 0;
}
const STATUS_META: Record<string, { icon: typeof Clock; className: string; label: string }> = {
  pending:               { icon: Clock, className: "text-amber-700 bg-amber-50", label: "Pending" },
  awaiting_verification: { icon: Clock, className: "text-amber-700 bg-amber-50", label: "Verifying payment" },
  confirmed:             { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50", label: "Confirmed" },
  packed:                { icon: Package, className: "text-blue-700 bg-blue-50", label: "Packed" },
  shipped:               { icon: Truck, className: "text-blue-700 bg-blue-50", label: "Shipped" },
  delivered:             { icon: CheckCircle2, className: "text-sage-deep bg-sage/10", label: "Delivered" },
  cancelled:             { icon: XCircle, className: "text-red-700 bg-red-50", label: "Cancelled" },
};

function Orders() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user!.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders" as never)
        .select("id, order_number, status, payment_status, payment_method, total, shipping, tax, subtotal, created_at, order_items(id, product_name, product_image, quantity, unit_price, subtotal)")
        .eq("customer_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if (orders.length === 0) return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground/40" />
      <p className="mt-3 font-medium">No orders yet</p>
      <Button asChild className="mt-4 bg-sage text-white hover:bg-sage-deep"><Link to="/shop">Start shopping</Link></Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const idx = trackingIndex(o.status, o.payment_status);
        const meta = STATUS_META[o.status] ?? STATUS_META.pending;
        const Icon = meta.icon;
        return (
          <div key={o.id} className="rounded-2xl border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3">
              <div>
                <p className="font-mono text-sm font-semibold">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                  <Icon className="h-3 w-3" /> {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">{o.payment_method}</span>
              </div>
            </div>

            <div className="divide-y px-5">
              {o.order_items.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  {it.product_image ? <img src={it.product_image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.quantity} × ₹{it.unit_price}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{it.subtotal}</p>
                </div>
              ))}
            </div>

            <div className="border-t bg-muted/20 px-5 py-4">
              <div className="mb-4 flex items-center gap-1 overflow-x-auto">
                {TRACKING_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-1 min-w-[100px] items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i <= idx ? "bg-sage text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                    <div className="ml-2 min-w-0 flex-1">
                      <p className={`truncate text-[11px] ${i <= idx ? "font-medium" : "text-muted-foreground"}`}>{step}</p>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < idx ? "bg-sage" : "bg-muted"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ₹{o.subtotal} + GST ₹{o.tax ?? 0} + Shipping {o.shipping === 0 ? "Free" : `₹${o.shipping}`}</span>
                <span className="text-base font-bold">₹{o.total}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── WISHLIST ─────────────────────────────────── */
function WishlistPanel() {
  const { ids, toggle } = useWishlist();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist-products", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("products" as never)
        .select("id, name, price, image_url, slug").in("id", ids);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
  if (ids.length === 0) return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <Heart className="mx-auto h-10 w-10 text-muted-foreground/40" />
      <p className="mt-3 font-medium">Your wishlist is empty</p>
      <Button asChild className="mt-4 bg-sage text-white hover:bg-sage-deep"><Link to="/shop">Discover products</Link></Button>
    </div>
  );
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p: any) => (
        <div key={p.id} className="flex gap-3 rounded-2xl border bg-card p-3">
          <img src={p.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <Link to="/product/$id" params={{ id: p.slug ?? p.id }} className="line-clamp-2 text-sm font-medium hover:underline">{p.name}</Link>
            <p className="mt-1 text-sm text-sage-deep font-semibold">₹{p.price}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle(p.id)}>Remove</Button>
              <Button asChild size="sm" className="bg-sage text-white hover:bg-sage-deep">
                <Link to="/product/$id" params={{ id: p.slug ?? p.id }}>View</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PASSWORD CHANGE ─────────────────────────────────── */
function PasswordChange() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2)   return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPw(""); setPw2(""); }
  };
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-card p-6 max-w-md">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Change Password</h2>
      <div className="mt-4 space-y-3">
        <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required /></div>
        <div><Label>Confirm password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} required /></div>
        <Button type="submit" disabled={busy} className="bg-sage text-white hover:bg-sage-deep">{busy ? "Updating…" : "Update password"}</Button>
      </div>
    </form>
  );
}
