import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/components/auth-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-[family-name:var(--font-display)] text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Woman's Company — Sustainable Feminine Hygiene" },
      {
        name: "description",
        content:
          "Safe, sustainable & comfortable feminine hygiene products designed for every stage of life. By Us, For You.",
      },
      { name: "author", content: "The Woman's Company" },
      {
        property: "og:title",
        content: "The Woman's Company — Sustainable Feminine Hygiene",
      },
      {
        property: "og:description",
        content:
          "Safe, sustainable & comfortable feminine hygiene products designed for every stage of life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@TheWomansCompany" },
      { property: "og:title", content: "The Woman's Company — Sustainable Feminine Hygiene" },
      { name: "twitter:title", content: "The Woman's Company — Sustainable Feminine Hygiene" },
      { name: "description", content: "Safe, sustainable & toxin-free feminine hygiene, skin care and body care products for every modern woman. Shop The Woman's Company, Kimirica ." },
      { property: "og:description", content: "Safe, sustainable & toxin-free feminine hygiene, skin care and body care products for every modern woman. Shop The Woman's Company, Kimirica ." },
      { name: "twitter:description", content: "Safe, sustainable & toxin-free feminine hygiene, skin care and body care products for every modern woman. Shop The Woman's Company, Kimirica ." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1c559943-9f4c-48bf-9161-b1ccd8ec7877" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/1c559943-9f4c-48bf-9161-b1ccd8ec7877" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Home, Grid, Tag, ShoppingBag, User } from "lucide-react";

function MobileBottomNav() {
  const router = useRouter();
  const activePath = router.state.location.pathname;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-border flex items-center justify-around lg:hidden pb-safe">
      <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activePath === "/" ? "text-primary" : "text-muted-foreground"}`}>
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activePath === "/shop" ? "text-primary" : "text-muted-foreground"}`}>
        <Grid className="h-5 w-5" />
        <span className="text-[10px] font-medium">Categories</span>
      </Link>
      <Link to="/shop" search={{ sort: "new" }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activePath === "/offers" ? "text-primary" : "text-muted-foreground"}`}>
        <Tag className="h-5 w-5" />
        <span className="text-[10px] font-medium">Offers</span>
      </Link>
      <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${activePath === "/cart" ? "text-primary" : "text-muted-foreground"}`}>
        <ShoppingBag className="h-5 w-5" />
        <span className="text-[10px] font-medium">Bag</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activePath === "/profile" ? "text-primary" : "text-muted-foreground"}`}>
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            {/* Removed AnnouncementBar since it's now inside Header */}
            <Header />
            <div className="pb-16 lg:pb-0"> {/* Padding for mobile bottom nav */}
              <Outlet />
            </div>
            <Footer />
            <MobileBottomNav />
            <Toaster richColors position="top-center" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
