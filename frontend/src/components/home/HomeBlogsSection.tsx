import { getPublishedBlogs } from "@/services/blogs.service";
import BlogCard from "@/components/blog/BlogCard";
import Link from "next/link";

export default async function HomeBlogsSection() {
  const sortedBlogs = await getPublishedBlogs(3);

  const topBlogs = sortedBlogs.slice(0, 3);

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-24">
      {/* TOP SECTION: BLOGS HEADER */}
      <div className="space-y-12">
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-['Montserrat'] text-5xl font-black uppercase tracking-tighter text-stone-900 sm:text-8xl">
            Blogs
          </h2>

          <Link
            href="/blogs"
            className="inline-flex self-start rounded-full bg-[#D97706] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-stone-900 hover:shadow-xl sm:self-auto sm:px-8 sm:text-xs sm:tracking-widest"
          >
            Explorar Blogs
          </Link>
        </div>

        {/* TOP GRID */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBlogs.length > 0 ? (
            topBlogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} href={`/blog/${blog.id}`} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-100 rounded-[32px]">
              <p className="text-stone-400 font-['Inter']">Aún no hay blogs publicados.</p>
            </div>
          )}
        </div>
      </div>
      
    </section>
  );
}
