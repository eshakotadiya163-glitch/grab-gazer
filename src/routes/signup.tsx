import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — The Woman's Company" },
      { name: "description", content: "Create your account to track orders, save addresses and your wishlist." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Create your account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join us to track orders, save addresses and curate your wishlist.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const res = await signup(name, email, password);
              setLoading(false);
              if (!res.ok) {
                toast.error(res.error ?? "Could not sign up");
                return;
              }
              toast.success("Welcome! Your account is ready.");
              navigate({ to: "/" });
            }}
            className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream">
              <UserPlus className="h-6 w-6 text-sage-deep" />
            </div>
            <h2 className="mt-4 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Sign up
            </h2>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full name</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Priya Sharma" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="At least 6 characters" />
              </div>
              <Button disabled={loading} className="w-full bg-sage text-white hover:bg-sage-deep" type="submit" size="lg">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-sage-deep hover:underline">Sign in</Link>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
