import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — The Woman's Company" },
      {
        name: "description",
        content: "Shop sustainable feminine hygiene products: bamboo razors, menstrual cups, tampons, pads and more.",
      },
      { property: "og:title", content: "Shop — The Woman's Company" },
      {
        property: "og:description",
        content: "Shop sustainable feminine hygiene products: bamboo razors, menstrual cups, tampons, pads and more.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Shop</span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Our Products
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Sustainable, safe, and comfortable feminine hygiene products designed for every stage of
            life.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="container-tight text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Need a custom order?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              For bulk orders, corporate gifting, or wholesale enquiries, explore our B2B catalogue or
              get in touch.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
