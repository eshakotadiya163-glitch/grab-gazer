import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { productsRepo, brandsRepo, categoriesRepo, vendorsRepo, slugify } from "@/lib/repositories";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const brands     = useQuery({ queryKey: ["brands"],     queryFn: () => brandsRepo.list({ order: "name", ascending: true }) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => categoriesRepo.list({ order: "name", ascending: true }) });
  const vendors    = useQuery({ queryKey: ["vendors"],    queryFn: () => vendorsRepo.list({ order: "store_name", ascending: true }) });

  return (
    <ResourceManager
      title="Products"
      description="Add, edit and remove products across all brands and vendors."
      repo={productsRepo}
      queryKey="products-admin"
      order="created_at"
      columns={[
        { key: "image_url", label: "", render: (r: any) => r.image_url
            ? <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" />
            : <div className="h-10 w-10 rounded bg-muted" /> },
        { key: "name", label: "Name", render: (r: any) => <span className="font-medium">{r.name}</span> },
        { key: "sku", label: "SKU" },
        { key: "price", label: "Price", render: (r: any) => `₹${r.price}` },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Status", render: (r: any) =>
          <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>{r.status}</span> },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text", required: true, span: 2 },
        { name: "slug", label: "Slug (auto if empty)", type: "text", span: 2 },
        { name: "sku", label: "SKU", type: "text" },
        { name: "price", label: "Price (₹)", type: "number", required: true, step: "0.01" },
        { name: "mrp", label: "MRP (₹)", type: "number", step: "0.01" },
        { name: "stock", label: "Stock", type: "number", defaultValue: 0 },
        { name: "brand_id", label: "Brand", type: "select",
          options: (brands.data ?? []).map((b: any) => ({ value: b.id, label: b.name })) },
        { name: "category_id", label: "Category", type: "select",
          options: (categories.data ?? []).map((c: any) => ({ value: c.id, label: c.name })) },
        { name: "vendor_id", label: "Vendor", type: "select",
          options: (vendors.data ?? []).map((v: any) => ({ value: v.id, label: v.store_name })) },
        { name: "status", label: "Status", type: "select", options: [
          { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }
        ] },
        { name: "image_url", label: "Image URL", type: "text", span: 2 },
        { name: "tags", label: "Tags", type: "tags", span: 2 },
        { name: "description", label: "Description", type: "textarea", span: 2 },
      ]}
      toPayload={(v) => ({
        ...v,
        slug: (v.slug as string)?.trim() || slugify(String(v.name ?? "")),
        brand_id: v.brand_id || null,
        category_id: v.category_id || null,
        vendor_id: v.vendor_id || null,
        status: v.status || "active",
      })}
    />
  );
}
