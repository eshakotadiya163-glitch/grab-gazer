import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMyVendor } from "./vendor";
import { productsRepo, orderItemsRepo, ordersRepo } from "@/lib/repositories";

export const Route = createFileRoute("/vendor/orders")({ component: VendorOrders });

function VendorOrders() {
  const vendor = useMyVendor();
  const products = useQuery({
    queryKey: ["vendor-prod-ids", vendor.data?.id],
    enabled: !!vendor.data?.id,
    queryFn: () => productsRepo.list({ filters: [["vendor_id", "eq", vendor.data!.id]] }),
  });
  const productIds = (products.data ?? []).map((p: any) => p.id);
  const items = useQuery({
    queryKey: ["vendor-items", productIds.join(",")],
    enabled: productIds.length > 0,
    queryFn: () => orderItemsRepo.list({ filters: [["product_id", "in", `(${productIds.join(",")})`]] }),
  });
  const orderIds = Array.from(new Set((items.data ?? []).map((i: any) => i.order_id)));
  const orders = useQuery({
    queryKey: ["vendor-orders", orderIds.join(",")],
    enabled: orderIds.length > 0,
    queryFn: () => ordersRepo.list({ filters: [["id", "in", `(${orderIds.join(",")})`]] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Orders for your products</h1>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Order #</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Your items</th><th className="px-4 py-3 text-right">Your revenue</th></tr>
          </thead>
          <tbody>
            {(orders.data ?? []).length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders yet.</td></tr>
            ) : (orders.data ?? []).map((o: any) => {
              const myItems = (items.data ?? []).filter((i: any) => i.order_id === o.id);
              const myRev = myItems.reduce((s: number, i: any) => s + Number(i.subtotal), 0);
              return (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-mono">{o.order_number}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span></td>
                  <td className="px-4 py-3 text-right">{myItems.reduce((s: number, i: any) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-right">₹{myRev.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
