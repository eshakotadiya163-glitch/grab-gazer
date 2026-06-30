import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { blogRepo, slugify } from "@/lib/repositories";

export const Route = createFileRoute("/admin/blog")({ component: () => (
  <ResourceManager
    title="Blog posts"
    description="Publish and manage blog content."
    repo={blogRepo}
    queryKey="blog-admin"
    order="created_at"
    columns={[
      { key: "title", label: "Title", render: (r: any) => <span className="font-medium">{r.title}</span> },
      { key: "author", label: "Author" },
      { key: "published", label: "Published", render: (r: any) => r.published ? "✓" : "—" },
      { key: "created_at", label: "Created", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
    ]}
    fields={[
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "slug", label: "Slug (auto if empty)", type: "text", span: 2 },
      { name: "author", label: "Author", type: "text" },
      { name: "cover_image_url", label: "Cover image URL", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea", span: 2 },
      { name: "content", label: "Content (Markdown)", type: "textarea", span: 2 },
      { name: "published", label: "Published", type: "switch" },
    ]}
    toPayload={(v) => ({
      ...v,
      slug: (v.slug as string)?.trim() || slugify(String(v.title ?? "")),
      published_at: v.published ? new Date().toISOString() : null,
    })}
  />
)});
