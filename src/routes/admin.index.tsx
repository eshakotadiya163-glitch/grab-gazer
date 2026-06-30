import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsRepo, ordersRepo, profilesRepo, vendorsRepo } from "@/lib/repositories";
import { Package, ShoppingCart, Users, Store, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function Stat({ label, value, icon: Icon, href }: { label: string; value: string | number; icon: typeof Package; href: string }) {
  return (
    <Link to={href} className="rounded-xl border bg-card p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-sage-deep" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function AdminDashboard() {
  const products = useQuery({ queryKey: ["count","products"], queryFn: () => productsRepo.count() });
  const orders   = useQuery({ queryKey: ["count","orders"],   queryFn: () => ordersRepo.count() });
  const profiles = useQuery({ queryKey: ["count","profiles"], queryFn: () => profilesRepo.count() });
  const vendors  = useQuery({ queryKey: ["count","vendors"],  queryFn: () => vendorsRepo.count() });
  const recent   = useQuery({ queryKey: ["recent-orders"], queryFn: () => ordersRepo.list({ order: "created_at", limit: 5 }) });

  const revenue = (recent.data ?? []).reduce((s, o: any) => s + Number(o.total ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Products"  value={products.data ?? "—"} icon={Package}      href="/admin/products" />
        <Stat label="Orders"    value={orders.data   ?? "—"} icon={ShoppingCart} href="/admin/orders" />
        <Stat label="Customers" value={profiles.data ?? "—"} icon={Users}        href="/admin/customers" />
        <Stat label="Vendors"   value={vendors.data  ?? "—"} icon={Store}        href="/admin/vendors" />
        <Stat label="Recent revenue" value={`₹${revenue.toFixed(0)}`} icon={IndianRupee} href="/admin/analytics" />
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold mb-3">Recent orders</h2>
        {recent.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          (recent.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> :
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr><th className="py-2">Order #</th><th>Customer</th><th>Status</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {(recent.data ?? []).map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2 font-medium">{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span></td>
                  <td className="text-right">₹{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
