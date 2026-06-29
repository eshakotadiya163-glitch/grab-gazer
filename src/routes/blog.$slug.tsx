import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const idx = blogPosts.findIndex((p) => p.slug === params.slug);
    if (idx < 0) throw notFound();
    return {
      post: blogPosts[idx],
      prev: blogPosts[idx - 1] ?? null,
      next: blogPosts[idx + 1] ?? null,
      related: blogPosts.filter((_, i) => i !== idx).slice(0, 3),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Article"} — The Woman's Company` },
      { name: "description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:title", content: loaderData?.post.title ?? "Article" },
      { property: "og:description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:image", content: loaderData?.post.image ?? "" },
    ],
  }),
  component: BlogPostPage,
  notFoundComponent: () => (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Article not found.</p>
      <Button asChild className="bg-sage text-white hover:bg-sage-deep">
        <Link to="/blog">Back to Blog</Link>
      </Button>
    </main>
  ),
  errorComponent: () => (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">We couldn't load this article.</p>
      <Button asChild variant="outline"><Link to="/blog">Back to Blog</Link></Button>
    </main>
  ),
});

function BlogPostPage() {
  const { post, prev, next, related } = Route.useLoaderData();
  const toc = post.sections.map((s: { id: string; heading: string }) => ({ id: s.id, title: s.heading }));

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-blush py-12 lg:py-16">
        <div className="container-tight">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-sage-deep hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
          >
            {post.title}
          </motion.h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {post.date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="container-tight grid gap-10 lg:grid-cols-[1fr_260px]">
          <article>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={post.image} alt={post.title} className="aspect-[16/9] w-full object-cover" />
            </div>

            <p className="mt-8 text-lg leading-relaxed text-foreground/90">{post.excerpt}</p>

            {post.sections.map((s: { id: string; heading: string; paragraphs: string[] }) => (
              <section key={s.id} id={s.id} className="mt-10 scroll-mt-24">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                  {s.heading}
                </h2>
                {s.paragraphs.map((p: string, i: number) => (
                  <p key={i} className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </section>
            ))}

            {/* Prev / Next */}
            <nav className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
              {prev ? (
                <Link to="/blog/$slug" params={{ slug: prev.slug }}
                  className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-sage">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Previous</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold text-foreground group-hover:text-sage-deep">
                    ← {prev.title}
                  </p>
                </Link>
              ) : <div />}
              {next ? (
                <Link to="/blog/$slug" params={{ slug: next.slug }}
                  className="group rounded-2xl border border-border bg-card p-5 text-right transition-colors hover:border-sage">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Next</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold text-foreground group-hover:text-sage-deep">
                    {next.title} →
                  </p>
                </Link>
              ) : <div />}
            </nav>
          </article>

          {/* TOC */}
          <aside className="order-first lg:order-last lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Table of contents</p>
              <ul className="mt-3 space-y-2 text-sm">
                {toc.map((item: { id: string; title: string }) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-foreground/80 transition-colors hover:text-sage-deep">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border py-14">
          <div className="container-tight">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                Related articles
              </h2>
              <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-sage-deep hover:underline">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp: typeof post, i: number) => <BlogCard key={rp.id} post={rp} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
