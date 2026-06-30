import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { couponsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/coupons")({ component: () => (
  <ResourceManager
    title="Coupons"
    description="Create and manage discount codes."
    repo={couponsRepo}
    queryKey="coupons-admin"
    order="created_at"
    columns={[
      { key: "code", label: "Code", render: (r: any) => <span className="font-mono font-medium">{r.code}</span> },
      { key: "discount_type", label: "Type" },
      { key: "discount_value", label: "Value", render: (r: any) =>
        r.discount_type === "percent" ? `${r.discount_value}%` : `₹${r.discount_value}` },
      { key: "min_order_amount", label: "Min order", render: (r: any) => `₹${r.min_order_amount ?? 0}` },
      { key: "uses", label: "Used", render: (r: any) => `${r.uses}${r.max_uses ? ` / ${r.max_uses}` : ""}` },
      { key: "active", label: "Active", render: (r: any) => r.active ? "✓" : "—" },
    ]}
    fields={[
      { name: "code", label: "Code", type: "text", required: true },
      { name: "discount_type", label: "Type", type: "select", required: true, options: [
        { value: "percent", label: "Percent" }, { value: "flat", label: "Flat ₹" }
      ] },
      { name: "discount_value", label: "Discount value", type: "number", required: true, step: "0.01" },
      { name: "min_order_amount", label: "Min order amount (₹)", type: "number", step: "0.01" },
      { name: "max_uses", label: "Max uses (blank = unlimited)", type: "number" },
      { name: "active", label: "Active", type: "switch", defaultValue: true },
    ]}
    toPayload={(v) => ({ ...v, code: String(v.code ?? "").trim().toUpperCase() })}
  />
)});
