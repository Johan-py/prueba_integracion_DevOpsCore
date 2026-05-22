import Image from "next/image";
import Link from "next/link";
import { PublicBlogCard } from "@/types/publicBlog";

type FeaturedBlogSpotlightProps = {
  blog: PublicBlogCard;
};

export default function FeaturedBlogSpotlight({
  blog,
}: FeaturedBlogSpotlightProps) {
  return (
    <Link href={`/blog/${blog.id}`} className="group block">
      <article className="grid gap-6 overflow-hidden rounded-[32px] border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-[0_24px_80px_-48px_rgba(41,37,36,0.45)] dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.5)] transition-shadow duration-300 group-hover:shadow-[0_24px_90px_-42px_rgba(41,37,36,0.3)] dark:group-hover:shadow-[0_24px_90px_-42px_rgba(0,0,0,0.4)] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden">
          <Image
            src={blog.imageUrl}
            alt={blog.title}
            width={1200}
            height={900}
            className="h-full min-h-[260px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:min-h-[320px]"
            unoptimized
          />
        </div>

        <div className="flex flex-col justify-center gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
            {blog.featuredLabel ?? blog.categoryLabel ?? blog.category}
          </p>

          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-bold leading-tight text-stone-900 dark:text-stone-100 transition-colors group-hover:text-amber-700 sm:text-4xl">
              {blog.title}
            </h2>

            <p className="text-base leading-7 text-stone-600 dark:text-stone-300">{blog.excerpt}</p>
          </div>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex w-fit rounded-full bg-amber-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors group-hover:bg-amber-700">
              {blog.articleCtaLabel ?? "Leer más"}
            </span>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-700 dark:text-stone-300">
              {blog.authorName}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
