import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMyVendor } from "./vendor";
import { productsRepo, orderItemsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/vendor/earnings")({ component: Earnings });

function Earnings() {
  const vendor = useMyVendor();
  const products = useQuery({
    queryKey: ["vp", vendor.data?.id],
    enabled: !!vendor.data?.id,
    queryFn: () => productsRepo.list({ filters: [["vendor_id", "eq", vendor.data!.id]] }),
  });
  const productIds = (products.data ?? []).map((p: any) => p.id);
  const items = useQuery({
    queryKey: ["vi", productIds.join(",")],
    enabled: productIds.length > 0,
    queryFn: () => orderItemsRepo.list({ filters: [["product_id", "in", `(${productIds.join(",")})`]] }),
  });

  const gross = (items.data ?? []).reduce((s: number, i: any) => s + Number(i.subtotal), 0);
  const commissionPct = Number(vendor.data?.commission_pct ?? 10);
  const fees = gross * commissionPct / 100;
  const net = gross - fees;

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Earnings</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Gross revenue</p><p className="mt-1 text-2xl font-semibold">₹{gross.toFixed(0)}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Platform fees ({commissionPct}%)</p><p className="mt-1 text-2xl font-semibold">-₹{fees.toFixed(0)}</p></div>
        <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated payout</p><p className="mt-1 text-2xl font-semibold text-sage-deep">₹{net.toFixed(0)}</p></div>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold mb-2">Payout history</h2>
        <p className="text-sm text-muted-foreground">No payouts have been processed yet. Payouts will appear here once enabled.</p>
      </div>
    </div>
  );
}
