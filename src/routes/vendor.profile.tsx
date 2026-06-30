import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMyVendor } from "./vendor";
import { vendorsRepo } from "@/lib/repositories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/vendor/profile")({ component: Profile });

function Profile() {
  const vendor = useMyVendor();
  const qc = useQueryClient();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor.data) {
      setStoreName(vendor.data.store_name ?? "");
      setDescription(vendor.data.description ?? "");
      setLogo(vendor.data.logo_url ?? "");
    }
  }, [vendor.data]);

  if (!vendor.data) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-1">Store profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Status: <strong>{vendor.data.status}</strong></p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await vendorsRepo.update(vendor.data.id, { store_name: storeName, description, logo_url: logo });
            toast.success("Store updated");
            qc.invalidateQueries({ queryKey: ["my-vendor"] });
          } catch (err: any) { toast.error(err.message); }
          finally { setSaving(false); }
        }}
        className="rounded-xl border bg-card p-6 space-y-4"
      >
        <div className="space-y-1.5"><Label>Store name</Label><Input value={storeName} onChange={(e) => setStoreName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Logo URL</Label><Input value={logo} onChange={(e) => setLogo(e.target.value)} /></div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-28 rounded-md border border-input bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <Button disabled={saving} className="bg-sage text-white hover:bg-sage-deep">{saving ? "Saving…" : "Save changes"}</Button>
      </form>
    </div>
  );
}
