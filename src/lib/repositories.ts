// Thin repository layer over Supabase. Centralizes table access so the
// rest of the app talks to typed helpers, not raw client calls.
import { supabase } from "@/integrations/supabase/client";

type AnyRow = Record<string, unknown>;

function table(name: string) {
  // Type assertion: generated types are empty until tables are introspected.
  return supabase.from(name as never) as unknown as {
    select: (cols?: string, opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) => any;
    insert: (row: AnyRow | AnyRow[]) => any;
    update: (row: AnyRow) => any;
    delete: () => any;
    upsert: (row: AnyRow, opts?: AnyRow) => any;
  };
}

export function repo<T extends { id: string } = { id: string } & AnyRow>(name: string) {
  return {
    list: async (opts?: { order?: string; ascending?: boolean; filters?: Array<[string, string, unknown]>; limit?: number }) => {
      let q: any = table(name).select("*");
      for (const [col, op, val] of opts?.filters ?? []) q = q[op](col, val);
      if (opts?.order) q = q.order(opts.order, { ascending: opts.ascending ?? false });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
    get: async (id: string) => {
      const { data, error } = await (table(name).select("*") as any).eq("id", id).single();
      if (error) throw error;
      return data as T;
    },
    create: async (row: Partial<T>) => {
      const { data, error } = await (table(name).insert(row as AnyRow) as any).select().single();
      if (error) throw error;
      return data as T;
    },
    update: async (id: string, row: Partial<T>) => {
      const { data, error } = await (table(name).update(row as AnyRow) as any).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    },
    remove: async (id: string) => {
      const { error } = await (table(name).delete() as any).eq("id", id);
      if (error) throw error;
    },
    count: async (filters?: Array<[string, string, unknown]>) => {
      let q: any = table(name).select("*", { count: "exact", head: true });
      for (const [col, op, val] of filters ?? []) q = q[op](col, val);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  };
}

export const productsRepo   = repo("products");
export const brandsRepo     = repo("brands");
export const categoriesRepo = repo("categories");
export const vendorsRepo    = repo("vendors");
export const couponsRepo    = repo("coupons");
export const bannersRepo    = repo("banners");
export const blogRepo       = repo("blog_posts");
export const ordersRepo     = repo("orders");
export const orderItemsRepo = repo("order_items");
export const reviewsRepo    = repo("reviews");
export const profilesRepo   = repo("profiles");
export const addressesRepo  = repo("addresses");
export const userRolesRepo  = repo("user_roles");

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
