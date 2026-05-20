"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BlogCreateForm from "@/components/blog/BlogCreateForm";
import { getEditableBlog, type EditableBlog } from "@/services/blogs.service";

const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const TOKEN_STORAGE_KEY = "token";

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [blog, setBlog] = useState<EditableBlog | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, `/blog/${params.id}/edit`);
      router.replace("/sign-in");
      return;
    }

    const blogId = Number(params.id);

    if (Number.isNaN(blogId)) {
      setError("El blog solicitado no es válido.");
      setIsLoading(false);
      return;
    }

    const loadBlog = async () => {
      try {
        const row = await getEditableBlog(blogId);
        setBlog(row);
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el blog para edición.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadBlog();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-28 rounded bg-stone-200" />
            <div className="h-10 w-80 rounded bg-stone-200" />
            <div className="h-12 rounded bg-stone-100" />
            <div className="h-12 rounded bg-stone-100" />
            <div className="h-48 rounded bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    const isDeleted = error === "No se encontró el blog solicitado.";
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className={`rounded-[32px] border px-6 py-8 text-center shadow-sm ${isDeleted ? "border-stone-200 bg-stone-50" : "border-red-200 bg-red-50"}`}>
          {isDeleted ? (
            <>
              <p className="text-base font-semibold text-stone-700">El blog ya no está disponible</p>
              <p className="mt-2 text-sm text-stone-500">Este blog fue eliminado y no puede editarse.</p>
              <button
                type="button"
                onClick={() => router.push("/blogs")}
                className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Ver todos los blogs
              </button>
            </>
          ) : (
            <p className="text-sm text-red-700">{error || "No se pudo cargar el blog."}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BlogCreateForm
        mode="edit"
        blogId={blog.id}
        initialValues={{
          categoriaId: String(blog.categoria_id),
          contenido: blog.contenido,
          imagen: blog.imagen,
          titulo: blog.titulo,
        }}
        statusLabel={blog.estado}
        rejectionReason={blog.blog_rechazo?.[0]?.comentario}
      />
    </div>
  );
}
