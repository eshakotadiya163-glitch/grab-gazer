import { createFileRoute, Outlet, Navigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-context";
import { DashboardLayout, type NavItem } from "@/components/admin/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, Boxes, ShoppingCart, IndianRupee, Store } from "lucide-react";

export const Route = createFileRoute("/vendor")({ component: VendorLayout });

const NAV: NavItem[] = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/products", label: "Products", icon: Package },
  { to: "/vendor/inventory", label: "Inventory", icon: Boxes },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendor/earnings", label: "Earnings", icon: IndianRupee },
  { to: "/vendor/profile", label: "Store profile", icon: Store },
];

export function useMyVendor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-vendor", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors" as never).select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

function VendorLayout() {
  const { user, isVendor, hydrated } = useAuth();
  const vendor = useMyVendor();
  if (!hydrated) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isVendor && !vendor.isLoading && !vendor.data) return <Navigate to="/vendor/register" />;
  if (vendor.data && vendor.data.status !== "approved") {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center rounded-2xl border bg-card p-8 shadow-soft">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">Application {vendor.data.status}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your vendor account is currently <strong>{vendor.data.status}</strong>. An admin will review and approve your store shortly.
          </p>
          <Button asChild className="mt-4 bg-sage text-white hover:bg-sage-deep"><Link to="/">Back to store</Link></Button>
        </div>
      </main>
    );
  }
  return <DashboardLayout title="Vendor" items={NAV}><Outlet /></DashboardLayout>;
}
