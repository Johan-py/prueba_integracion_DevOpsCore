import Link from "next/link";

type BlogCardProps = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  categoryLabel?: string;
  authorName: string;
  publishedAt: string;
  href?: string;
};

export default function BlogCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  categoryLabel,
  authorName,
  publishedAt,
  href,
}: BlogCardProps) {
  const cardHref = href || `/blog/${id}`;

  // Trunca el excerpt a una longitud fija y añade tres puntos suspensivos
  const truncateExcerpt = (text: string, max = 140) => {
    if (!text) return '';
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trimEnd() + '...';
  };

  return (
    <Link href={cardHref} className="block group">
      <article
        className={`
          flex
          flex-col
          overflow-hidden
          rounded-[32px]
          bg-white dark:bg-stone-800
          transition-all
          duration-500
          group-hover:shadow-[0_24px_80px_-15px_rgba(41,37,36,0.15)]
          h-full
        `}
      >
        {/* Imagen */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl || "/placeholder-blog.jpg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 transition-opacity duration-500 group-hover:opacity-0" />
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          {/* Categoría Pill */}
          <div className="mb-4">
            <span className="inline-block rounded-full border border-[#D97706]/20 bg-[#D97706]/5 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D97706] dark:text-[#D97706]/80">  /* Cambia el color del texto para modo oscuro */
              {categoryLabel ?? category}
            </span>
          </div>

          {/* Título */}
          <h2 className="font-['Montserrat'] mb-3 line-clamp-2 text-xl font-bold leading-tight text-stone-900 dark:text-stone-100 transition-colors group-hover:text-[#D97706] sm:text-2xl">
            {title}
          </h2>

          {/* Resumen */}
          <p className="font-['Inter'] mb-6 line-clamp-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">
            {truncateExcerpt(excerpt)}
          </p>

          {/* Botón y Metadata */}
          <div className="mt-auto flex items-center justify-between">
            <div
              className="rounded-full bg-[#D97706] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all group-hover:bg-[#D97706]/90 group-hover:shadow-lg group-hover:shadow-[#D97706]/20"
            >
              Leer Más
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                {authorName}
              </p>
              <p className="text-[9px] text-stone-400 dark:text-stone-500">
                {new Date(publishedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
