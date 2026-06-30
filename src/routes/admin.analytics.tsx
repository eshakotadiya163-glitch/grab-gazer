import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersRepo, productsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const orders   = useQuery({ queryKey: ["orders-all"],   queryFn: () => ordersRepo.list({ order: "created_at" }) });
  const products = useQuery({ queryKey: ["products-all"], queryFn: () => productsRepo.list({ order: "created_at" }) });

  const list = orders.data ?? [];
  const totalRevenue = list.reduce((s, o: any) => s + Number(o.total ?? 0), 0);
  const byStatus = list.reduce<Record<string, number>>((m, o: any) => { m[o.status] = (m[o.status] ?? 0) + 1; return m; }, {});
  const lowStock = (products.data ?? []).filter((p: any) => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Revenue</p><p className="mt-1 text-2xl font-semibold">₹{totalRevenue.toFixed(0)}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Orders</p><p className="mt-1 text-2xl font-semibold">{list.length}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Avg order value</p><p className="mt-1 text-2xl font-semibold">₹{list.length ? (totalRevenue/list.length).toFixed(0) : 0}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Low stock SKUs</p><p className="mt-1 text-2xl font-semibold">{lowStock}</p></div>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold mb-3">Orders by status</h2>
        <div className="grid gap-2 sm:grid-cols-5">
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <div key={s} className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s}</p>
              <p className="text-xl font-semibold">{byStatus[s] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
