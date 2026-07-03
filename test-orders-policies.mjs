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
  const { data, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'orders');
  console.log("Policies:", data);
  console.log("Error:", error);
}

test();
