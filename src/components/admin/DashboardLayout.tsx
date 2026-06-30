import { type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, type LucideIcon } from "lucide-react";

export interface NavItem { to: string; label: string; icon: LucideIcon; }

export function DashboardLayout({ title, items, children }: { title: string; items: NavItem[]; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-60 shrink-0 border-r bg-card hidden md:flex flex-col">
        <div className="p-5 border-b">
          <Link to="/" className="font-[family-name:var(--font-display)] text-lg font-semibold">The Woman's Company</Link>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {items.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-sage/15 text-sage-deep font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 text-xs">
          <p className="truncate font-medium text-foreground">{user?.name}</p>
          <p className="truncate text-muted-foreground">{user?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={async () => { await logout(); navigate({ to: "/" }); }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">{title}</span>
          <select
            value={pathname}
            onChange={(e) => navigate({ to: e.target.value as never })}
            className="rounded-md border px-2 py-1 text-sm"
          >
            {items.map((it) => <option key={it.to} value={it.to}>{it.label}</option>)}
          </select>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
