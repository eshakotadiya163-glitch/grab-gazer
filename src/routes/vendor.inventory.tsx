import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { productsRepo } from "@/lib/repositories";
import { useMyVendor } from "./vendor";

export const Route = createFileRoute("/vendor/inventory")({ component: VendorInventory });

function VendorInventory() {
  const vendor = useMyVendor();
  if (!vendor.data) return <p>Loading…</p>;
  return (
    <ResourceManager
      title="Inventory"
      description="Adjust stock for your products."
      repo={productsRepo}
      queryKey={`vendor-inv-${vendor.data.id}`}
      filters={[["vendor_id", "eq", vendor.data.id]]}
      order="stock" ascending
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "name", label: "Product", render: (r: any) => <span className="font-medium">{r.name}</span> },
        { key: "sku", label: "SKU" },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "stock", label: "Stock", type: "number", required: true },
        { name: "status", label: "Status", type: "select", options: [
          { value: "active", label: "Active" }, { value: "draft", label: "Draft" }
        ] },
      ]}
    />
  );
}
