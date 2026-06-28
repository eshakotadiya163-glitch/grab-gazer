import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Package, Truck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/b2b-catalogue")({
  head: () => ({
    meta: [
      { title: "B2B Catalogue — The Woman's Company" },
      {
        name: "description",
        content: "Wholesale, corporate gifting, and institutional supplies of sustainable feminine hygiene products.",
      },
      { property: "og:title", content: "B2B Catalogue — The Woman's Company" },
      {
        property: "og:description",
        content: "Wholesale, corporate gifting, and institutional supplies of sustainable feminine hygiene products.",
      },
    ],
  }),
  component: B2BCataloguePage,
});

const offerings = [
  {
    icon: Package,
    title: "Bulk Products",
    description: "Pads, cups, tampons, and razors available in wholesale quantities for retail and institutions.",
  },
  {
    icon: Building2,
    title: "Corporate Wellness",
    description: "Curated period-care kits for employee wellness programs and workplace hygiene.",
  },
  {
    icon: Truck,
    title: "Reliable Logistics",
    description: "Pan-India delivery with consistent restocking and dedicated account support.",
  },
  {
    icon: FileText,
    title: "Custom Branding",
    description: "White-label and co-branded packaging options for partners and distributors.",
  },
];

function B2BCataloguePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Business</span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            B2B Catalogue
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Partner with us for wholesale, corporate gifting, and institutional supply of sustainable
            feminine hygiene products.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offerings.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <item.icon className="h-8 w-8 text-sage-deep" />
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
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
              Download the full catalogue
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Get detailed product specifications, pricing tiers, and custom packaging options for your
              business.
            </p>
            <Button className="mt-8 bg-sage text-white hover:bg-sage-deep" size="lg">
              Request catalogue
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
