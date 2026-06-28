import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
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
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Welcome back
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Sign in to track orders, manage your subscriptions, and save your favourites.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream">
              <User className="h-6 w-6 text-sage-deep" />
            </div>
            <h2 className="mt-4 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Sign in
            </h2>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="••••••••"
                />
              </div>
              <Button className="w-full bg-sage text-white hover:bg-sage-deep" type="submit" size="lg">
                Continue
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-sage-deep hover:underline">
                Create one
              </a>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
