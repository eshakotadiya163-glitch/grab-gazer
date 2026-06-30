import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { vendorsRepo, slugify } from "@/lib/repositories";

export const Route = createFileRoute("/admin/vendors")({ component: () => (
  <ResourceManager
    title="Vendors"
    description="Approve, suspend or remove vendors."
    repo={vendorsRepo}
    queryKey="vendors-admin"
    order="created_at"
    columns={[
      { key: "store_name", label: "Store", render: (r: any) => <span className="font-medium">{r.store_name}</span> },
      { key: "store_slug", label: "Slug" },
      { key: "status", label: "Status", render: (r: any) => {
        const tone = r.status === "approved" ? "bg-emerald-100 text-emerald-700"
                   : r.status === "suspended" ? "bg-red-100 text-red-700"
                   : "bg-amber-100 text-amber-700";
        return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{r.status}</span>;
      } },
      { key: "commission_pct", label: "Commission %" },
    ]}
    fields={[
      { name: "store_name", label: "Store name", type: "text", required: true, span: 2 },
      { name: "store_slug", label: "Store slug", type: "text" },
      { name: "status", label: "Status", type: "select", options: [
        { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "suspended", label: "Suspended" }
      ] },
      { name: "commission_pct", label: "Commission (%)", type: "number", step: "0.01" },
      { name: "logo_url", label: "Logo URL", type: "text" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ]}
    toPayload={(v) => ({ ...v, store_slug: (v.store_slug as string)?.trim() || slugify(String(v.store_name ?? "")) })}
    canCreate={false}
  />
)});
