import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          width={472}
          height={354}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-foreground">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <a
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sage-deep transition-colors hover:gap-2"
        >
          Read more <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.article>
  );
}
