import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vending-machines")({
  head: () => ({
    meta: [
      { title: "Vending Machines — The Woman's Company" },
      {
        name: "description",
        content: "Accessible sanitary pad vending machines for schools, colleges, offices, and public spaces.",
      },
      { property: "og:title", content: "Vending Machines — The Woman's Company" },
      {
        property: "og:description",
        content: "Accessible sanitary pad vending machines for schools, colleges, offices, and public spaces.",
      },
    ],
  }),
  component: VendingMachinesPage,
});

const benefits = [
  "24/7 access to sanitary products",
  "Discreet and easy to use",
  "Low maintenance and restocking",
  "Custom branding options",
  "Ideal for schools, offices, malls, and public spaces",
];

function VendingMachinesPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Solutions</span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Vending Machines
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Make period products accessible anytime, anywhere with our smart vending machine
            solutions.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-cream p-8 sm:p-12"
          >
            <Building2 className="h-12 w-12 text-sage-deep" />
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Hygiene access at your fingertips
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Our vending machines are designed to dispense sanitary pads and hygiene products
              discreetly, helping institutions support menstrual health with dignity and ease.
            </p>
            <ul className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Button className="mt-8 bg-sage text-white hover:bg-sage-deep" size="lg">
              Request a quote
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-3xl bg-sage p-8 text-white sm:p-12"
          >
            <MapPin className="h-10 w-10" />
            <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold">
              Perfect for high-traffic spaces
            </h3>
            <p className="mt-4 text-white/90">
              Schools, colleges, corporate offices, malls, airports, railway stations, and community
              centers — our machines fit seamlessly into any environment.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
