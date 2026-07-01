// Thin repository layer over Supabase. Centralizes table access so the
// rest of the app talks to typed helpers, not raw client calls.
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ProductCard";

type AnyRow = Record<string, unknown>;

function table(name: string) {
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

// ─── Shop catalog (Supabase products + joined brand/category names) ───────────

const PLACEHOLDER = "/assets/images/products/placeholder.png";

const PRODUCT_SELECT =
  "id, name, price, mrp, stock, image_url, slug, description, tags, status, brands:brand_id ( name ), categories:category_id ( name )";

type DbProductRow = {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  image_url: string | null;
  slug: string;
  description: string | null;
  tags: string[] | null;
  status: string;
  brands: { name: string } | null;
  categories: { name: string } | null;
};

export function mapProductRow(row: DbProductRow): Product {
  const price = Number(row.price);
  return {
    id: row.id,
    name: row.name,
    price,
    priceLabel: `₹${price}`,
    image: row.image_url || PLACEHOLDER,
    image_url: row.image_url ?? undefined,
    brand: row.brands?.name,
    category: row.categories?.name,
    stock: row.stock ?? 0,
    tag: row.tags?.[0],
    description: row.description ?? undefined,
    mrp: row.mrp ?? undefined,
  };
}

async function fetchActiveProducts(limit?: number): Promise<DbProductRow[]> {
  let q = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("name");

  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DbProductRow[];
}

export interface ShopCatalog {
  products: Product[];
  brands: string[];
  categories: string[];
}

export async function fetchShopCatalog(): Promise<ShopCatalog> {
  const rows = await fetchActiveProducts();
  const products = rows.map(mapProductRow);
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort() as string[];
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort() as string[];
  return { products, brands, categories };
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const rows = await fetchActiveProducts(limit);
  return rows.map(mapProductRow);
}

export async function fetchProductById(idOrSlug: string): Promise<Product | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  let q = supabase.from("products").select(PRODUCT_SELECT).eq("status", "active");
  q = isUuid ? q.eq("id", idOrSlug) : q.eq("slug", idOrSlug);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProductRow(data as DbProductRow);
}

export const getShopCatalogFn = createServerFn({ method: "GET" }).handler(async () => fetchShopCatalog());

export const getFeaturedProductsFn = createServerFn({ method: "GET" }).handler(async () =>
  fetchFeaturedProducts(8),
);

export const getProductByIdFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const product = await fetchProductById(data.id);
    if (!product) throw new Error("Product not found");
    return product;
  });
