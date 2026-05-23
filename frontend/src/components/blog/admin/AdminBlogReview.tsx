"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminBlogModeration } from "@/hooks/useAdminBlogModeration";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function StatusBanner({
  status,
  rejectionComment,
}: {
  status: "PUBLICADO" | "RECHAZADO";
  rejectionComment: string | null;
}) {
  if (status === "PUBLICADO") {
    return (
      <div className="font-inter rounded-3xl border border-green-200 bg-green-50 px-6 py-5 text-green-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-600">
          Estado actual
        </p>
        <h2 className="mt-2 text-2xl font-bold font-montserrat">
          Artículo publicado
        </h2>
        <p className="mt-2 text-sm leading-7">
          Este blog ya fue publicado, por lo que no volverá a aparecer en la
          pestaña de pendientes.
        </p>
      </div>
    );
  }

  return (
    <div className="font-inter rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-800 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-300">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
        Estado actual
      </p>
      <h2 className="mt-2 text-2xl font-bold font-montserrat">
        Artículo rechazado
      </h2>
      <p className="mt-2 text-sm leading-7 break-words">
        Comentario registrado: {rejectionComment || "Sin comentario adicional."}
      </p>
    </div>
  );
}

export default function AdminBlogReview({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { blogs, isReady, updateBlogStatus } = useAdminBlogModeration();
  const [rejectionComment, setRejectionComment] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blog = useMemo(
    () => blogs.find((currentBlog) => currentBlog.id === blogId),
    [blogId, blogs],
  );

  if (!isReady) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-stone-200 bg-white px-6 py-20 text-center text-stone-500 shadow-sm dark:border-white/10 dark:bg-[#070707] dark:text-zinc-400">
          Cargando articulo...
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-stone-200 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-[#070707] dark:text-white">
          <h1 className="text-3xl font-bold text-stone-900">
            Blog no encontrado
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            El articulo solicitado no existe en la demo o fue removido del
            almacenamiento local.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/admin/blogs"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-stone-900 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              Volver al listado
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateBlogStatus(blog.id, "PUBLICADO");
      router.push("/admin/blogs");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;
    if (!rejectionComment.trim()) {
      setFormError("Agrega un comentario para justificar el rechazo.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBlogStatus(blog.id, "RECHAZADO", rejectionComment);
      router.push("/admin/blogs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7f1_0%,#ffffff_48%,#fff8f2_100%)] text-stone-900 transition-colors dark:bg-none dark:bg-[#030303] dark:text-white">
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 transition-colors hover:text-stone-900 dark:text-zinc-400 dark:hover:text-[#F6A21A]"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al listado
        </Link>

        <div className="mt-10 rounded-[36px] border border-stone-200 bg-white p-5 shadow-[0_24px_80px_rgba(28,25,23,0.08)] transition-colors dark:border-white/10 dark:bg-[#070707] dark:shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:p-8 lg:p-10">
          <div className="font-inter rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:border dark:border-[#F6A21A]/35 dark:bg-[#F6A21A]/10 dark:text-[#F6A21A]">
            {blog.category}
          </div>

          <h1 className="font-montserrat mt-8 max-w-5xl text-4xl font-bold leading-none tracking-tight text-stone-900 dark:text-white sm:text-6xl">
            {blog.title}
          </h1>

          <div className="font-inter mt-10 grid gap-5 border-b border-stone-200 pb-8 text-sm text-stone-600 dark:border-white/10 dark:text-zinc-400 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400 dark:text-zinc-500">
                Autor
              </p>
              <p className="mt-2 text-lg font-bold text-stone-900 font-montserrat">
                {blog.authorName}
              </p>
              <p>{blog.authorRole}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400 dark:text-zinc-500">
                Fecha de creación
              </p>
              <p className="mt-2 text-lg font-bold text-stone-900 font-montserrat">
                {formatDate(blog.submittedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400 dark:text-zinc-500">
                Tiempo de lectura
              </p>
              <p className="font-montserrat mt-2 text-lg font-bold text-stone-900 dark:text-white">
                {blog.readingTime}
              </p>
            </div>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[32px]">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={1600}
              height={980}
              className="h-auto w-full object-cover dark:brightness-[0.88]"
              priority
              unoptimized
            />
          </div>

          <div className="font-inter mx-auto mt-10 max-w-4xl space-y-9 text-lg leading-9 text-stone-700 dark:text-zinc-300">
            {blog.sections.map((section, index) => (
              <section key={`${blog.id}-${index}`} className="space-y-4">
                {section.heading && (
                  <h2 className="font-montserrat text-3xl font-bold leading-tight text-stone-900 dark:text-white">
                    {section.heading}
                  </h2>
                )}

                <MarkdownRenderer content={section.paragraphs.join("\n\n")} />
              </section>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl border-t border-stone-200 pt-8 dark:border-white/10">
            {blog.status === "PENDIENTE" ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2 font-inter">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-[#F6A21A]">
                    Decisión del admin
                  </p>
                  <h2 className="font-montserrat text-3xl font-bold text-stone-900 dark:text-white">
                    Revisa antes de publicar
                  </h2>
                  <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-zinc-400">
                    Si rechazas el artículo, agrega un comentario claro para que
                    el autor sepa qué debe mejorar.
                  </p>
                </div>

                <label className="block font-inter">
                  <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-zinc-300">
                    Comentario de rechazo
                  </span>
                  <textarea
                    value={rejectionComment}
                    onChange={(event) => {
                      setRejectionComment(event.target.value);
                      setFormError("");
                    }}
                    rows={5}
                    maxLength={500}
                    placeholder="Ejemplo: falta citar fuentes, mejorar estructura o corregir tono editorial."
                    className="w-full rounded-2xl border border-stone-300 bg-white px-5 py-4 text-sm text-stone-700 outline-none transition focus:border-amber-600 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                  />
                  <p
                    className={`mt-1 text-right text-xs ${rejectionComment.length >= 450 ? "text-red-500" : " text-stone-400 dark:text-zinc-500"}`}
                  >
                    {rejectionComment.length}/500 caracteres
                  </p>
                </label>

                {formError && (
                  <p className="text-sm font-medium text-red-600 font-inter">
                    {formError}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end font-inter">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className={`inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-red-500 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 transition-colors dark:border-red-400/50 dark:text-red-300 ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-red-50 dark:hover:bg-red-500/10"}`}
                  >
                    <XCircle className="h-4 w-4" />
                    {isSubmitting ? "Procesando..." : "Rechazar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className={`inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-amber-600 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm shadow-amber-200 transition-colors dark:bg-[#F6A21A] dark:text-black dark:shadow-none ${isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-amber-700 dark:hover:bg-[#ffb43d]"}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Procesando..." : "Publicar"}
                  </button>
                </div>
              </div>
            ) : (
              <StatusBanner
                status={blog.status}
                rejectionComment={blog.rejectionComment}
              />
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
