// Client-side order storage. Works in Lovable preview and on Cloudflare Workers
// (the previous Node fs-based server function was incompatible with the runtime).

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface StoredOrder {
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
  status: "confirmed";
  createdAt: string;
}

export type PlaceOrderInput = Omit<StoredOrder, "orderId" | "subtotal" | "shipping" | "total" | "status" | "createdAt">;

const KEY = "twc-orders";

function readAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as StoredOrder[];
  } catch {
    return [];
  }
}

export function placeOrder(input: PlaceOrderInput): StoredOrder {
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const order: StoredOrder = {
    ...input,
    orderId: `ORD-${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8).toUpperCase()}`,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  const orders = readAll();
  orders.push(order);
  localStorage.setItem(KEY, JSON.stringify(orders));
  return order;
}

export function getOrders(): StoredOrder[] {
  return readAll();
}

export function getOrder(orderId: string): StoredOrder | undefined {
  return readAll().find((o) => o.orderId === orderId);
}
