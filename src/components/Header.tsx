import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAdmin, isVendor } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-tight">
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              The Woman's Company
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeProps={{ className: "text-sage-deep font-medium" }}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                inactiveProps={{ className: "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Admin dashboard" asChild>
                <Link to="/admin"><ShieldCheck className="h-5 w-5 text-sage-deep" /></Link>
              </Button>
            )}
            {isVendor && (
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Vendor dashboard" asChild>
                <Link to="/vendor"><Store className="h-5 w-5 text-sage-deep" /></Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Login" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Cart" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-berry px-1 text-[10px] font-medium text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border py-3">
            <form
              className="relative max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString();
                if (q) {
                  navigate({ to: "/shop", search: { q } });
                  setSearchOpen(false);
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-input bg-transparent pl-9 pr-4 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-tight flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-3 text-base font-medium text-foreground transition-colors hover:text-sage-deep"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
