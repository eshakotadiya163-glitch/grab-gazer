import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Leaf, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — The Woman's Company" },
      {
        name: "description",
        content:
          "Learn about The Woman's Company mission to provide sustainable, safe, and comfortable feminine hygiene products.",
      },
      { property: "og:title", content: "About Us — The Woman's Company" },
      {
        property: "og:description",
        content:
          "Learn about The Woman's Company mission to provide sustainable, safe, and comfortable feminine hygiene products.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Leaf,
    title: "Sustainability First",
    description:
      "We choose materials that biodegrade, packaging that minimizes waste, and processes that reduce our footprint.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Tested",
    description:
      "Every product is crafted with hypoallergenic, skin-friendly ingredients and held to rigorous quality standards.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "We partner with educators, healthcare workers, and grassroots organizations to spread awareness.",
  },
  {
    icon: Heart,
    title: "Made With Care",
    description:
      "From design to delivery, our products are created with empathy for the bodies and lives they touch.",
  },
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-20 lg:py-28">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">
            Our Story
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
            Making a difference, one person at a time
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The Woman's Company is a healthcare platform built on the belief that every menstruator
            deserves access to safe, sustainable, and dignified period care.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Why we exist
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Nearly 600 million people menstruate across India. For many, access to safe hygiene
              products is still a struggle, compounded by stigma, misinformation, and environmental
              waste. We started The Woman's Company to change that narrative.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Our range — from bamboo razors and menstrual cups to organic cotton pads and stand &
              pee devices — is designed for real bodies and real lives. We are here to make periods
              easier, conversations louder, and the planet cleaner.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <value.icon className="h-8 w-8 text-sage-deep" />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
