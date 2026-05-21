import Image from 'next/image'
import Link from 'next/link'
import type { PublicBlogCard } from '@/types/publicBlog'

type BlogDetailSidebarProps = {
  recommendations: PublicBlogCard[]
}

const recommendedImageFallback = '/placeholder-blog.jpg'

const truncateTitle = (title: string) => {
  const cleanTitle = title.replace(/\s+/g, ' ').trim()
  return cleanTitle.length > 78 ? `${cleanTitle.slice(0, 78).trimEnd()}...` : cleanTitle
}

function RecommendedBlogCard({ blog }: { blog: PublicBlogCard }) {
  return (
    <Link href={`/blog/${blog.id}`} className="group block">
      <article className="space-y-3">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] bg-stone-100">
          <Image
            src={blog.imageUrl || recommendedImageFallback}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, 100vw"
            unoptimized
          />
        </div>

        <h3 className="max-w-[16rem] text-sm font-extrabold leading-tight text-stone-900 transition-colors group-hover:text-[#a56400]">
          {truncateTitle(blog.title)}
        </h3>
      </article>
    </Link>
  )
}

export default function BlogDetailSidebar({ recommendations }: BlogDetailSidebarProps) {
  return (
    <aside className="mx-auto w-full max-w-[380px]">
      <div className="min-h-[840px] rounded-[32px] bg-white px-6 py-7 shadow-[0_24px_60px_-48px_rgba(41,37,36,0.5)] sm:min-h-[880px] sm:px-8 sm:py-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#a56400] sm:text-[0.95rem]">
          Lecturas recomendadas
        </h2>

        {recommendations.length > 0 ? (
          <div className="mt-7 space-y-8">
            {recommendations.map((blog) => (
              <RecommendedBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <p className="mt-7 rounded-[16px] bg-stone-50 px-4 py-5 text-sm font-medium leading-relaxed text-stone-500">
            No hay lecturas recomendadas por el momento
          </p>
        )}
      </div>
    </aside>
  )
}
