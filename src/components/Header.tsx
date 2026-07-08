import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium tracking-wide hidden sm:block">
        Free shipping on orders above ₹500 | Use code BEAUTY20 for 20% off
      </div>

      <div className="border-b border-border">
        <div className="container-tight mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 -ml-2 text-foreground"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6 stroke-[1.5]" /> : <Menu className="h-6 w-6 stroke-[1.5]" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center lg:mr-8">
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary tracking-tight">
                The Woman's Company
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 mr-6 whitespace-nowrap">
              <Link to="/shop" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Categories</Link>
              <Link to="/shop" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Brands</Link>
              <Link to="/blog" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Beauty Advice</Link>
              <Link to="/shop?sort=new" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">New Launches</Link>
            </nav>

            {/* Full Width Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-4">
              <form
                className="relative w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = new FormData(e.currentTarget).get("q")?.toString();
                  if (q) {
                    navigate({ to: "/shop", search: { q } });
                  }
                }}
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search on Nykaa"
                  className="h-10 w-full rounded-md border border-input bg-muted/30 pl-10 pr-4 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                />
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto lg:ml-0">
              <Button variant="ghost" className="hidden sm:flex text-foreground hover:text-primary hover:bg-transparent" asChild>
                <Link to={user ? "/profile" : "/login"}>
                  <User className="h-5 w-5 mr-2 stroke-[1.5]" />
                  <span className="text-sm font-semibold">{user ? "Account" : "Sign In"}</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-transparent hidden lg:flex" aria-label="Wishlist" asChild>
                <Link to="/profile">
                  <Heart className="h-5 w-5 stroke-[1.5]" />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary hover:bg-transparent" aria-label="Cart" asChild>
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                  {totalItems > 0 && (
                    <span className="absolute 1 -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Below Header) */}
        <div className="lg:hidden px-4 pb-3">
          <form
            className="relative w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString();
              if (q) {
                navigate({ to: "/shop", search: { q } });
              }
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search on Nykaa"
              className="h-10 w-full rounded-md border border-input bg-muted/30 pl-10 pr-4 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </form>
        </div>
      </div>

      {/* Mobile Nav Menu Dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full border-b border-border bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col">
            <Link to="/shop" className="p-4 border-b border-border text-sm font-semibold text-foreground" onClick={() => setMobileOpen(false)}>Categories</Link>
            <Link to="/shop" className="p-4 border-b border-border text-sm font-semibold text-foreground" onClick={() => setMobileOpen(false)}>Brands</Link>
            <Link to="/blog" className="p-4 border-b border-border text-sm font-semibold text-foreground" onClick={() => setMobileOpen(false)}>Beauty Advice</Link>
            <Link to="/shop?sort=new" className="p-4 border-b border-border text-sm font-semibold text-foreground" onClick={() => setMobileOpen(false)}>New Launches</Link>
            {!user && (
              <Link to="/login" className="p-4 text-sm font-semibold text-primary" onClick={() => setMobileOpen(false)}>Sign In / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
