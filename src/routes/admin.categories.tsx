import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { categoriesRepo, slugify } from "@/lib/repositories";

export const Route = createFileRoute("/admin/categories")({ component: () => (
  <ResourceManager
    title="Categories"
    repo={categoriesRepo}
    queryKey="categories-admin"
    order="name" ascending
    columns={[
      { key: "name", label: "Name", render: (r: any) => <span className="font-medium">{r.name}</span> },
      { key: "slug", label: "Slug" },
      { key: "image_url", label: "Image", render: (r: any) => r.image_url ? "✓" : "—" },
    ]}
    fields={[
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug (auto if empty)", type: "text" },
      { name: "image_url", label: "Image URL", type: "text", span: 2 },
    ]}
    toPayload={(v) => ({ ...v, slug: (v.slug as string)?.trim() || slugify(String(v.name ?? "")) })}
  />
)});
