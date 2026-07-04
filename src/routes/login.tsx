import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";

import { z } from "zod";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Login — The Woman's Company" },
      { name: "description", content: "Sign in to your account." },
      { property: "og:title", content: "Login — The Woman's Company" },
      { property: "og:description", content: "Sign in to your account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, signInWithGoogle, user, logout, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <main className="min-h-screen bg-background">
        <section className="bg-blush py-16 lg:py-24">
          <div className="container-tight text-center">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
              Welcome, {user.name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{user.email}</p>
          </div>
        </section>
        <section className="py-16">
          <div className="container-tight flex flex-col items-center gap-3">
            <Button asChild className="bg-sage text-white hover:bg-sage-deep" size="lg"><Link to="/shop">Continue shopping</Link></Button>
            {isAdmin && <Button asChild variant="outline" size="lg"><Link to="/admin">Admin dashboard</Link></Button>}
            {isVendor && <Button asChild variant="outline" size="lg"><Link to="/vendor">Vendor dashboard</Link></Button>}
            {!isAdmin && <Button asChild variant="ghost" size="sm"><Link to="/admin/claim">Become admin</Link></Button>}
            {!isVendor && <Button asChild variant="ghost" size="sm"><Link to="/vendor/register">Become a vendor</Link></Button>}
            <Button variant="outline" size="lg" onClick={async () => { await logout(); toast.success("Signed out"); }}>Sign out</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">Welcome back</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Sign in to track orders, manage your subscriptions, and save your favourites.
          </p>
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream">
              <User className="h-6 w-6 text-sage-deep" />
            </div>
            <h2 className="mt-4 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">Sign in</h2>

            <Button type="button" variant="outline" className="mt-6 w-full"
              onClick={async () => { try { await signInWithGoogle(); } catch (e: any) { toast.error(e.message ?? "Google sign-in failed"); } }}>
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const res = await login(email, password);
                setLoading(false);
                if (!res.ok) { toast.error(res.error ?? "Could not sign in"); return; }
                toast.success("Signed in");
                const dest = (Route.useSearch as any) ? undefined : undefined;
                const search = Route.useSearch();
                await navigate({ to: (search.redirect as any) || "/" });
              }} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="••••••••" />
              </div>
              <Button disabled={loading} className="w-full bg-sage text-white hover:bg-sage-deep" type="submit" size="lg">
                {loading ? "Signing in…" : "Continue"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/signup" className="font-medium text-sage-deep hover:underline">Create one</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
