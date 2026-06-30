import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { profilesRepo, userRolesRepo } from "@/lib/repositories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const profiles = useQuery({ queryKey: ["profiles-for-roles"], queryFn: () => profilesRepo.list({ order: "created_at" }) });
  const roles    = useQuery({ queryKey: ["all-roles"], queryFn: () => userRolesRepo.list() });
  const [q, setQ] = useState("");

  const rolesByUser = (roles.data ?? []).reduce<Record<string, string[]>>((m, r: any) => {
    (m[r.user_id] ??= []).push(r.role); return m;
  }, {});

  async function grant(userId: string, role: string) {
    try {
      await userRolesRepo.create({ user_id: userId, role } as any);
      toast.success(`Granted ${role}`);
      qc.invalidateQueries({ queryKey: ["all-roles"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function revoke(rowId: string) {
    try {
      await userRolesRepo.remove(rowId);
      toast.success("Revoked");
      qc.invalidateQueries({ queryKey: ["all-roles"] });
    } catch (e: any) { toast.error(e.message); }
  }

  const filtered = (profiles.data ?? []).filter((p: any) =>
    !q || p.email?.toLowerCase().includes(q.toLowerCase()) || p.full_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage roles & access.</p>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold">User roles</h2>
          <Input placeholder="Search by name or email" className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">User</th><th>Roles</th><th className="text-right">Grant</th></tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const userRoles = roles.data?.filter((r: any) => r.user_id === p.id) ?? [];
                const has = (r: string) => (rolesByUser[p.id] ?? []).includes(r);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="py-3">
                      <div className="font-medium">{p.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {userRoles.map((r: any) => (
                          <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                            {r.role}
                            <button onClick={() => revoke(r.id)} className="text-muted-foreground hover:text-destructive">×</button>
                          </span>
                        ))}
                        {userRoles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      {(["admin", "vendor", "customer"] as const).filter((r) => !has(r)).map((r) => (
                        <Button key={r} size="sm" variant="outline" className="ml-1" onClick={() => grant(p.id, r)}>+ {r}</Button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
