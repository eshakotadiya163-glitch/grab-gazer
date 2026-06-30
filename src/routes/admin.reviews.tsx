import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { reviewsRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/reviews")({ component: () => (
  <ResourceManager
    title="Reviews"
    description="Approve or remove customer reviews."
    repo={reviewsRepo}
    queryKey="reviews-admin"
    order="created_at"
    canCreate={false}
    columns={[
      { key: "reviewer_name", label: "Reviewer", render: (r: any) => <span className="font-medium">{r.reviewer_name}</span> },
      { key: "rating", label: "Rating", render: (r: any) => "★".repeat(r.rating) + "☆".repeat(5 - r.rating) },
      { key: "comment", label: "Comment", render: (r: any) => <span className="text-muted-foreground">{r.comment?.slice(0, 80) ?? "—"}</span> },
      { key: "approved", label: "Approved", render: (r: any) => r.approved ? "✓" : "—" },
    ]}
    fields={[
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "approved", label: "Approved", type: "switch" },
      { name: "comment", label: "Comment", type: "textarea", span: 2 },
    ]}
  />
)});
