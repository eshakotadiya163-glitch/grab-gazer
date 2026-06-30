import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { brandsRepo, slugify } from "@/lib/repositories";

export const Route = createFileRoute("/admin/brands")({ component: () => (
  <ResourceManager
    title="Brands"
    repo={brandsRepo}
    queryKey="brands-admin"
    order="name" ascending
    columns={[
      { key: "logo_url", label: "", render: (r: any) => r.logo_url
        ? <img src={r.logo_url} alt="" className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-muted" /> },
      { key: "name", label: "Name", render: (r: any) => <span className="font-medium">{r.name}</span> },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description", render: (r: any) => <span className="text-muted-foreground">{r.description?.slice(0,60) ?? "—"}</span> },
    ]}
    fields={[
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug (auto if empty)", type: "text" },
      { name: "logo_url", label: "Logo URL", type: "text", span: 2 },
      { name: "description", label: "Description", type: "textarea", span: 2 },
    ]}
    toPayload={(v) => ({ ...v, slug: (v.slug as string)?.trim() || slugify(String(v.name ?? "")) })}
  />
)});
