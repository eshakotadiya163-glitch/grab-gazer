import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — The Woman's Company" },
      {
        name: "description",
        content: "Get in touch with The Woman's Company for enquiries, partnerships, and support.",
      },
      { property: "og:title", content: "Contact Us — The Woman's Company" },
      {
        property: "og:description",
        content: "Get in touch with The Woman's Company for enquiries, partnerships, and support.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Get in touch</span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We would love to hear from you. Reach out for orders, partnerships, or just to say hello.
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
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream">
                <MapPin className="h-5 w-5 text-sage-deep" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Address</h3>
                <p className="mt-1 text-muted-foreground">
                  First Floor, Local Shopping Complex, 7, Panchsheel Marg, New Delhi 110017
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream">
                <Mail className="h-5 w-5 text-sage-deep" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Email</h3>
                <a
                  href="mailto:sales@ecosattvastore.com"
                  className="mt-1 text-muted-foreground hover:text-foreground"
                >
                  sales@ecosattvastore.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream">
                <Phone className="h-5 w-5 text-sage-deep" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Phone</h3>
                <p className="mt-1 text-muted-foreground">+91 11 1234 5678</p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onSubmit={(e) => e.preventDefault()}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="How can we help?"
              />
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Tell us more..."
              />
            </div>
            <Button className="mt-6 w-full gap-2 bg-sage text-white hover:bg-sage-deep" type="submit">
              <Send className="h-4 w-4" />
              Send message
            </Button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
