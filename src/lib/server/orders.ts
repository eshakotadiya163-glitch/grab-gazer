import { createServerFn } from "@tanstack/react-start";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

export interface PlaceOrderInput {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
}

// ─── Repository (swap this section for Supabase/MySQL/Postgres later) ─────────
const DB_PATH = join(process.cwd(), "data", "orders.json");

async function ensureDb(): Promise<void> {
  try {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readOrders(): Promise<Order[]> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as Order[];
}

async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

// ─── Server Functions ─────────────────────────────────────────────────────────

export const placeOrderFn = createServerFn({ method: "POST" })
  .validator((data: PlaceOrderInput) => data)
  .handler(async ({ data }) => {
    const orders = await readOrders();
    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 499 ? 0 : 49;
    const order: Order = {
      orderId: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      items: data.items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    await writeOrders(orders);
    return { success: true, order };
  });

export const getOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const orders = await readOrders();
  return orders;
});
