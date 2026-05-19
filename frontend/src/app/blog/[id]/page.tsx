import Image from "next/image"
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogDetailSidebar from '@/components/blog/BlogDetailSidebar'
import BlogCommentsSection from '@/components/blog/BlogCommentsSection'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import BlogSharePlaceholder from '@/components/blog/BlogSharePlaceholder'
import { MOCK_USER_BLOGS } from '@/lib/mock/blogs.mock'
import { getPublishedBlogById, getPublishedBlogs } from '@/services/blogs.service'
import BackButton from "@/app/blogs/backButton"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const publicBlog = await getPublishedBlogById(params.id)
  const userBlog = MOCK_USER_BLOGS.find((blog) => blog.id === params.id)

  if (!publicBlog && !userBlog) return {}

  const title = publicBlog?.title ?? userBlog?.titulo ?? 'Blog PropBol'
  const description = `${publicBlog?.excerpt ?? userBlog?.resumen ?? 'Descubre más sobre el mercado inmobiliario en PropBol.'} | Lee el artículo completo en PropBol.`
  const imageUrl = publicBlog?.imageUrl ?? userBlog?.imagenUrl ?? '/placeholder-blog.jpg'

  return {
    title: `${title} | PropBol Blog`,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: 'article',
    },
  }
}

const formatPublishedDate = (value: string) =>
  new Date(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const publicBlog = await getPublishedBlogById(params.id)
  const userBlog = MOCK_USER_BLOGS.find((blog) => blog.id === params.id)

  if (!publicBlog && !userBlog) {
    notFound()
  }

  const title = publicBlog?.title ?? userBlog?.titulo ?? 'Blog PropBol'
  const imageUrl = publicBlog?.imageUrl ?? userBlog?.imagenUrl ?? '/placeholder-blog.jpg'
  const authorName = publicBlog?.authorName ?? userBlog?.autor ?? 'Usuario PropBol'
  const publishedLabel = publicBlog
    ? formatPublishedDate(publicBlog.publishedAt)
    : userBlog?.fecha ?? 'Fecha no disponible'
  const summary =
    publicBlog?.excerpt ??
    userBlog?.resumen ??
    'Este articulo presenta una mirada clara y actual sobre el ecosistema inmobiliario y las oportunidades que aparecen cuando observamos el mercado con criterio.'
  const articleContent = publicBlog?.content?.trim() || userBlog?.resumen?.trim() || summary
  const recommendedBlogs = (await getPublishedBlogs(8))
    .filter((blog) => blog.id !== params.id)
    .slice(0, 4)

  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f8f3eb_38%,#ffffff_100%)] dark:bg-none dark:bg-black pb-20 transition-colors duration-300">
      <header className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a56400]">
            Blog PropBol
          </p>

          <h1 className="font-heading mt-4 text-4xl font-black leading-tight text-stone-900 dark:text-white sm:text-5xl lg:text-6xl transition-colors duration-300">
            {title}
          </h1>

          <div className="mt-8 flex items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-8 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#d68b1a] to-[#a56400] text-lg font-black text-white shadow-lg shadow-[#a56400]/30 border border-white/20">
                {authorName.charAt(0).toUpperCase()}
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-bold text-stone-900 dark:text-white transition-colors duration-300">{authorName}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  {publishedLabel}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 overflow-hidden rounded-[32px] bg-stone-100 dark:bg-stone-900 shadow-[0_24px_80px_-32px_rgba(41,37,36,0.35)] dark:shadow-none transition-colors duration-300">
          <Image
            src={imageUrl}
            alt={title}
            width={1600}
            height={900}
            className="h-full min-h-[240px] w-full object-cover sm:min-h-[360px]"
            unoptimized
          />
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="blog-grid-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-12">
            <div className="rounded-[36px] bg-white/90 dark:bg-[#111111] dark:border dark:border-stone-800 p-6 shadow-[0_24px_80px_-50px_rgba(41,37,36,0.45)] dark:shadow-none sm:p-8 lg:p-10 transition-colors duration-300">
              <MarkdownRenderer content={articleContent} />
            </div>

            <div className="no-capture">
              <BlogSharePlaceholder
                title={title}
                author={authorName}
                category={publicBlog?.category || 'General'}
                imageUrl={imageUrl}
                description={articleContent}
              />
            </div>

            <div className="no-capture">
              <BlogCommentsSection blogId={params.id} />
            </div>

            <div className="pt-2 no-capture">
              <BackButton />
            </div>
          </div>

          <div className="no-capture">
            <BlogDetailSidebar recommendations={recommendedBlogs} />
          </div>
        </div>
      </main>
    </article>
  )
}
