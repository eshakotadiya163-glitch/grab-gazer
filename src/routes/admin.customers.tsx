import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profilesRepo } from "@/lib/repositories";

export const Route = createFileRoute("/admin/customers")({ component: CustomersAdmin });

function CustomersAdmin() {
  const { data, isLoading } = useQuery({ queryKey: ["customers"], queryFn: () => profilesRepo.list({ order: "created_at" }) });
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-1">Customers</h1>
      <p className="text-sm text-muted-foreground mb-6">All registered accounts.</p>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Joined</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              : (data ?? []).length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>
              : (data ?? []).map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.full_name || "—"}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
