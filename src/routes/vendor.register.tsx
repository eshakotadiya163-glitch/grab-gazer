import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { slugify } from "@/lib/repositories";

export const Route = createFileRoute("/vendor/register")({ component: VendorRegister });

function VendorRegister() {
  const { user, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <main className="min-h-screen grid place-items-center"><p>Please <a className="underline" href="/login">sign in</a> first.</p></main>;
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-muted/20">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          const { error } = await supabase.rpc("apply_as_vendor" as never, {
            _store_name: storeName,
            _store_slug: slugify(storeName),
            _description: description,
          } as never);
          setLoading(false);
          if (error) { toast.error(error.message); return; }
          await refreshRoles();
          toast.success("Application submitted!");
          navigate({ to: "/vendor" });
        }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft space-y-4"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Become a vendor</h1>
        <p className="text-sm text-muted-foreground">
          Apply to sell on The Woman's Company. An admin will review your application.
        </p>
        <div className="space-y-1.5">
          <Label>Store name</Label>
          <Input required value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Beauty Store" />
        </div>
        <div className="space-y-1.5">
          <Label>About your store</Label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-24 rounded-md border border-input bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="What do you sell? What makes your store unique?" />
        </div>
        <Button disabled={loading} className="w-full bg-sage text-white hover:bg-sage-deep">
          {loading ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </main>
  );
}
