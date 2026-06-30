import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/claim")({ component: ClaimPage });

function ClaimPage() {
  const { user, isAdmin, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="text-center"><p className="mb-3">Please sign in first.</p>
          <Button asChild><Link to="/login">Go to login</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto h-12 w-12 rounded-full bg-sage/15 grid place-items-center">
          <ShieldCheck className="h-6 w-6 text-sage-deep" />
        </div>
        <h1 className="mt-3 text-xl font-semibold font-[family-name:var(--font-display)]">Admin access required</h1>
        {isAdmin ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">You're an admin.</p>
            <Button className="mt-4 w-full bg-sage text-white hover:bg-sage-deep" onClick={() => navigate({ to: "/admin" })}>
              Open dashboard
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              No admin exists yet for this store. The first user to claim it becomes admin. After that, admins are granted from Settings.
            </p>
            <Button
              disabled={loading}
              className="mt-4 w-full bg-sage text-white hover:bg-sage-deep"
              onClick={async () => {
                setLoading(true);
                const { data, error } = await supabase.rpc("bootstrap_admin" as never);
                setLoading(false);
                if (error) { toast.error(error.message); return; }
                if (!data) { toast.error("An admin already exists. Ask them to grant you the role."); return; }
                await refreshRoles();
                toast.success("You are now admin");
                navigate({ to: "/admin" });
              }}
            >
              {loading ? "Claiming…" : "Claim admin role"}
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
