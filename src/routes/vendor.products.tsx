import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { productsRepo, categoriesRepo, brandsRepo, slugify } from "@/lib/repositories";
import { useMyVendor } from "./vendor";

export const Route = createFileRoute("/vendor/products")({ component: VendorProducts });

function VendorProducts() {
  const vendor = useMyVendor();
  const brands     = useQuery({ queryKey: ["brands"],     queryFn: () => brandsRepo.list({ order: "name", ascending: true }) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => categoriesRepo.list({ order: "name", ascending: true }) });

  if (!vendor.data) return <p>Loading…</p>;

  return (
    <ResourceManager
      title="My products"
      description="You can only manage products belonging to your store."
      repo={productsRepo}
      queryKey={`vendor-products-${vendor.data.id}`}
      filters={[["vendor_id", "eq", vendor.data.id]]}
      order="created_at"
      columns={[
        { key: "image_url", label: "", render: (r: any) => r.image_url ? <img src={r.image_url} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" /> },
        { key: "name", label: "Name", render: (r: any) => <span className="font-medium">{r.name}</span> },
        { key: "sku", label: "SKU" },
        { key: "price", label: "Price", render: (r: any) => `₹${r.price}` },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text", required: true, span: 2 },
        { name: "slug", label: "Slug (auto if empty)", type: "text", span: 2 },
        { name: "sku", label: "SKU", type: "text" },
        { name: "price", label: "Price (₹)", type: "number", required: true, step: "0.01" },
        { name: "mrp", label: "MRP (₹)", type: "number", step: "0.01" },
        { name: "stock", label: "Stock", type: "number" },
        { name: "brand_id", label: "Brand", type: "select", options: (brands.data ?? []).map((b: any) => ({ value: b.id, label: b.name })) },
        { name: "category_id", label: "Category", type: "select", options: (categories.data ?? []).map((c: any) => ({ value: c.id, label: c.name })) },
        { name: "status", label: "Status", type: "select", options: [
          { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }
        ] },
        { name: "image_url", label: "Image URL", type: "text", span: 2 },
        { name: "description", label: "Description", type: "textarea", span: 2 },
      ]}
      toPayload={(v) => ({
        ...v,
        slug: (v.slug as string)?.trim() || slugify(String(v.name ?? "")),
        vendor_id: vendor.data.id,
        brand_id: v.brand_id || null,
        category_id: v.category_id || null,
        status: v.status || "active",
      })}
    />
  );
}
