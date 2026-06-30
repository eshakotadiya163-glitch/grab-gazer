import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMyVendor } from "./vendor";
import { productsRepo, orderItemsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/vendor/")({ component: VendorDashboard });

function VendorDashboard() {
  const vendor = useMyVendor();
  const products = useQuery({
    queryKey: ["vendor-products", vendor.data?.id],
    enabled: !!vendor.data?.id,
    queryFn: () => productsRepo.list({ filters: [["vendor_id", "eq", vendor.data!.id]], order: "created_at" }),
  });
  const items = useQuery({
    queryKey: ["vendor-orderitems", vendor.data?.id],
    enabled: !!vendor.data?.id,
    queryFn: async () => {
      const productIds = (products.data ?? []).map((p: any) => p.id);
      if (productIds.length === 0) return [];
      return orderItemsRepo.list({ filters: [["product_id", "in", `(${productIds.join(",")})`]] });
    },
  });
  const revenue = (items.data ?? []).reduce((s, i: any) => s + Number(i.subtotal ?? 0), 0);
  const commission = (vendor.data?.commission_pct ?? 10) / 100;
  const payout = revenue * (1 - commission);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Welcome, {vendor.data?.store_name}</h1>
        <p className="text-sm text-muted-foreground">Quick overview of your store.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Products</p><p className="mt-1 text-2xl font-semibold">{products.data?.length ?? "—"}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Items sold</p><p className="mt-1 text-2xl font-semibold">{(items.data ?? []).reduce((s, i: any) => s + i.quantity, 0)}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Gross sales</p><p className="mt-1 text-2xl font-semibold">₹{revenue.toFixed(0)}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated payout</p><p className="mt-1 text-2xl font-semibold">₹{payout.toFixed(0)}</p></div>
      </div>
    </div>
  );
}
