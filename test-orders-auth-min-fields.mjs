import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Parse .env file manually
const envPath = ".env";
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
  const email = `test${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: "StrongPassword123!@#"
  });
  
  console.log("Signed up:", authData.user?.id);
  
  // Try inserting with ONLY required fields to see if it's a default/null issue
  const { data, error } = await supabase.from("orders").insert({
    customer_id: authData.user?.id,
    order_number: "TEST-AUTH-" + Date.now(),
    customer_name: "T",
    customer_email: "a@a.com",
    address: "A",
  }).select();
  
  console.log("Insert Response:");
  console.log("Error:", JSON.stringify(error, null, 2));
}

test();
