import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/data";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — The Woman's Company" },
      {
        name: "description",
        content: "Read articles on menstrual health, sustainability, and period wellness from The Woman's Company.",
      },
      { property: "og:title", content: "Blog — The Woman's Company" },
      {
        property: "og:description",
        content: "Read articles on menstrual health, sustainability, and period wellness from The Woman's Company.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-16 lg:py-24">
        <div className="container-tight text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">Journal</span>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground sm:text-5xl">
            Blog Posts
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Insights on menstrual health, sustainability, and living with confidence.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
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
              Want to contribute?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We are always looking for voices that can help us build a more open, informed community
              around menstrual health.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
