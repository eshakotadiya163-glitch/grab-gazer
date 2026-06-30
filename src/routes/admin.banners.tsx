import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { bannersRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/banners")({ component: () => (
  <ResourceManager
    title="Banners"
    description="Manage homepage promotional banners."
    repo={bannersRepo}
    queryKey="banners-admin"
    order="position" ascending
    columns={[
      { key: "image_url", label: "", render: (r: any) => r.image_url
        ? <img src={r.image_url} alt="" className="h-10 w-20 rounded object-cover" /> : <div className="h-10 w-20 rounded bg-muted" /> },
      { key: "title", label: "Title", render: (r: any) => <span className="font-medium">{r.title}</span> },
      { key: "position", label: "Position" },
      { key: "active", label: "Active", render: (r: any) => r.active ? "✓" : "—" },
    ]}
    fields={[
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "subtitle", label: "Subtitle", type: "text", span: 2 },
      { name: "image_url", label: "Image URL", type: "text", span: 2 },
      { name: "link_url", label: "Link URL", type: "text", span: 2 },
      { name: "position", label: "Position", type: "number" },
      { name: "active", label: "Active", type: "switch", defaultValue: true },
    ]}
  />
)});
