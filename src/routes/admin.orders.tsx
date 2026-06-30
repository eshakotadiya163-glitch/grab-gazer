import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { ordersRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/orders")({ component: () => (
  <ResourceManager
    title="Orders"
    description="Update order status and review payment state."
    repo={ordersRepo}
    queryKey="orders-admin"
    order="created_at"
    canCreate={false}
    columns={[
      { key: "order_number", label: "Order #", render: (r: any) => <span className="font-mono">{r.order_number}</span> },
      { key: "customer_name", label: "Customer" },
      { key: "total", label: "Total", render: (r: any) => `₹${r.total}` },
      { key: "status", label: "Status", render: (r: any) =>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span> },
      { key: "payment_status", label: "Payment" },
      { key: "created_at", label: "Date", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
    ]}
    fields={[
      { name: "status", label: "Order status", type: "select", required: true, options: [
        { value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" },
        { value: "shipped", label: "Shipped" }, { value: "delivered", label: "Delivered" }, { value: "cancelled", label: "Cancelled" },
      ] },
      { name: "payment_status", label: "Payment status", type: "select", options: [
        { value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }, { value: "refunded", label: "Refunded" }
      ] },
      { name: "notes", label: "Internal notes", type: "textarea", span: 2 },
    ]}
  />
)});
