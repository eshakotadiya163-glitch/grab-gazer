import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/data";
import { getFeaturedProductsFn } from "@/lib/repositories";
import type { Product } from "@/components/ProductCard";

import heroImage from "@/assets/hero-products.jpg";

export const Route = createFileRoute("/")({
  loader: async (): Promise<Product[]> => await getFeaturedProductsFn(),
  head: () => ({
    meta: [
      { title: "The Woman's Company — Sustainable Feminine Hygiene" },
      {
        name: "description",
        content:
          "Safe, sustainable & comfortable feminine hygiene products designed for every stage of life. By Us, For You.",
      },
      {
        property: "og:title",
        content: "The Woman's Company — Sustainable Feminine Hygiene",
      },
      {
        property: "og:description",
        content:
          "Safe, sustainable & comfortable feminine hygiene products designed for every stage of life.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featuredProducts = Route.useLoaderData();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush via-background to-cream">
        <div className="container-tight grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-sage-deep shadow-sm">
              <Sparkles className="h-4 w-4" />
              Sustainable period care
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              By Us, For You
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Safe, sustainable & comfortable feminine hygiene products designed for every stage
              of life.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-sage text-white hover:bg-sage-deep transition-colors"
                size="lg"
              >
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Leaf className="h-4 w-4 text-sage-deep" />
                Eco-friendly
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sage-deep" />
                Doctor approved
              </span>
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-berry" />
                Made with care
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-blush">
              <img
                src={heroImage}
                alt="Sustainable feminine hygiene products arranged on soft linen"
                width={1400}
                height={900}
                className="aspect-[4/3] w-full object-cover lg:aspect-[14/10]"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-soft lg:block">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                600M+
              </p>
              <p className="text-sm text-muted-foreground">Menstruators across the world</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-tight">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">
                Shop
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
                Our Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-sm font-medium text-sage-deep transition-colors hover:gap-2"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-tight">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl bg-blush p-8 sm:p-12 lg:p-16">
                <blockquote className="font-[family-name:var(--font-display)] text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
                  "Making a difference, one person at a time"
                </blockquote>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">
                About Us
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
                A healthcare platform for every menstruator
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                With nearly 600 million menstruators in India, access to safe and sustainable
                feminine hygiene remains a challenge. The Woman's Company is more than a brand — it
                is a healthcare platform built to educate, empower, and provide products that are
                kind to bodies and the planet.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                From biodegradable pads to reusable menstrual cups, every product is designed with
                intention, tested for safety, and crafted to make periods easier, healthier, and more
                dignified.
              </p>
              <Button asChild className="mt-8 bg-sage text-white hover:bg-sage-deep" size="lg">
                <Link to="/about">Read Our Story</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-tight">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-sage-deep">
                Journal
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
                Blog Posts
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm font-medium text-sage-deep transition-colors hover:gap-2"
            >
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="bg-sage py-16 text-white lg:py-24">
        <div className="container-tight text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            Join the movement
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Subscribe for tips, period stories, and early access to new sustainable products.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border-0 bg-white/20 px-5 text-white placeholder:text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
            <Button className="h-12 rounded-full bg-white px-6 text-sage-deep hover:bg-white/90" type="submit">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
