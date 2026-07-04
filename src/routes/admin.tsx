import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-context";
import { DashboardLayout, type NavItem } from "@/components/admin/DashboardLayout";
import { LayoutDashboard, BarChart3, Package, ListTree, Award, Boxes, ShoppingCart, Users, Star, Ticket, Image, BookOpen, Settings, Store, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/brands", label: "Brands", icon: Award },
  { to: "/admin/vendors", label: "Vendors", icon: Store },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, hydrated } = useAuth();
  if (!hydrated) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/admin/claim" />;
  return <DashboardLayout title="Admin" items={NAV}><Outlet /></DashboardLayout>;
}
