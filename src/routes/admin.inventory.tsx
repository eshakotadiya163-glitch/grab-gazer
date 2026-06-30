import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { productsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/inventory")({ component: () => (
  <ResourceManager
    title="Inventory"
    description="Adjust stock levels for every product."
    repo={productsRepo}
    queryKey="inventory-admin"
    order="stock" ascending
    canCreate={false}
    canDelete={false}
    columns={[
      { key: "name", label: "Product", render: (r: any) => <span className="font-medium">{r.name}</span> },
      { key: "sku", label: "SKU" },
      { key: "stock", label: "Stock", render: (r: any) => {
        const tone = r.stock <= 0 ? "text-red-600 font-semibold" : r.stock < 10 ? "text-amber-600 font-medium" : "text-foreground";
        return <span className={tone}>{r.stock}</span>;
      } },
      { key: "status", label: "Status" },
    ]}
    fields={[
      { name: "stock", label: "Stock", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: [
        { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }
      ] },
    ]}
  />
)});
