import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Parse .env file manually
const envPath = ".env";
if (!fs.existsSync(envPath)) {
  console.error(".env file not found");
  process.exit(1);
}
const envVars = {};
const lines = fs.readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const [key, ...val] = line.split("=");
  if (key && val.length > 0) {
    envVars[key.trim()] = val.join("=").trim().replace(/^"|"$/g, '');
  }
}

const supabase = createClient(
  envVars["VITE_SUPABASE_URL"],
  envVars["VITE_SUPABASE_PUBLISHABLE_KEY"]
);

async function test() {
  const { data, error } = await supabase.from("orders").insert({
    customer_id: null,
    order_number: "TEST-1234",
    customer_name: "Test",
    customer_email: "test@test.com",
    address: "123 Test",
    city: "Test",
    state: "Test",
    pincode: "123456",
    subtotal: 0,
    shipping: 0,
    total: 0,
    status: "pending",
    payment_status: "unpaid"
  }).select();
  
  console.log("Insert Response:");
  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data:", data);
}

test();
