// Query Supabase to see products with placeholder/missing images
const SUPABASE_URL = "https://bgsgkmzwenjbgtexinfp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnc2drbXp3ZW5qYmd0ZXhpbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTAxNzQsImV4cCI6MjA5ODM2NjE3NH0.Da5zZjxKVa6BA6nPIOiyLWS6CXwoHypk_BI33Z5UpJU";

async function query(path, params = "") {
  const url = `${SUPABASE_URL}/rest/v1/${path}${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  // Count all products
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&status=eq.active`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Prefer": "count=exact", "Range-Unit": "items" },
  });
  console.log("Total active products count header:", countRes.headers.get("content-range"));

  // Get products with brand info - look for bad images
  const products = await query(
    "products",
    "?select=id,name,slug,image_url,status,brands:brand_id(name)&order=name&limit=250"
  );

  console.log(`\nTotal products fetched: ${products.length}`);
  
  const byBrand = {};
  const badImages = [];
  
  for (const p of products) {
    const brand = p.brands?.name ?? "Unknown";
    if (!byBrand[brand]) byBrand[brand] = { total: 0, bad: 0 };
    byBrand[brand].total++;
    
    const img = p.image_url ?? "";
    const isBad = !img || img.includes("placeholder") || img.includes("via.placeholder") || img === "" || img === null;
    if (isBad) {
      byBrand[brand].bad++;
      badImages.push({ id: p.id, name: p.name, slug: p.slug, brand, image_url: img });
    }
  }
  
  console.log("\n=== BY BRAND ===");
  for (const [brand, stats] of Object.entries(byBrand)) {
    console.log(`  ${brand}: ${stats.total} total, ${stats.bad} bad images`);
  }
  
  console.log(`\n=== BAD IMAGE PRODUCTS (${badImages.length}) ===`);
  for (const p of badImages) {
    console.log(`  [${p.brand}] ${p.name} (slug: ${p.slug}) -> "${p.image_url}"`);
  }

  // Also show all products with their current image_url for inspection
  console.log("\n=== ALL PRODUCTS IMAGE AUDIT ===");
  for (const p of products) {
    const brand = p.brands?.name ?? "Unknown";
    const img = p.image_url ?? "NULL";
    const flag = (!img || img.includes("placeholder") || img === "NULL") ? "❌" : "✅";
    console.log(`${flag} [${brand}] ${p.name}: ${img.substring(0,80)}`);
  }
}

main().catch(console.error);
