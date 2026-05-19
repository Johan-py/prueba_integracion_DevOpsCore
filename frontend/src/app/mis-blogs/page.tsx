"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type EstadoBlog = "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";

type BlogRechazo = {
  comentario: string;
  fecha: string;
};

type Blog = {
  id: number;
  titulo: string;
  imagen: string | null;
  estado: EstadoBlog;
  fecha_creacion: string | null;
  fecha_publicacion: string | null;
  blog_rechazo?: BlogRechazo[];
};

const estados = [
  "TODOS",
  "BORRADOR",
  "PENDIENTE",
  "PUBLICADO",
  "RECHAZADO",
] as const;

export default function MisBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<(typeof estados)[number]>("TODOS");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    fetch(`${API_URL}/api/blogs/mis-blogs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const lista = Array.isArray(data)
          ? data
          : data.blogs || data.data || [];
        setBlogs(lista);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtrados =
    filtro === "TODOS" ? blogs : blogs.filter((b) => b.estado === filtro);

  const count = (estado: EstadoBlog) =>
    blogs.filter((b) => b.estado === estado).length;

  const eliminarBlog = async (id: number) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este blog?");

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el blog");
      }

      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
    } catch {
      alert("No se pudo eliminar el blog");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F1EA] px-6 py-8">
        <p className="p-6 text-gray-500">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1EA] px-6 py-10 transition-colors dark:bg-black dark:text-white">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 border-l-4 border-[#C28700] pl-5">
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#B47A00] dark:text-[#F6B23A]">
              Panel de control
            </p>

            <h1 className="text-5xl font-extrabold leading-none text-[#222222] dark:text-white">
              Mis Blogs
            </h1>

            <p className="mt-3 text-sm text-[#6F675F] dark:text-zinc-300">
              Aquí puedes ver todos tus blogs y su estado
            </p>
          </div>

          <button
            onClick={() => router.push("/blog/create")}
            className="rounded-lg border border-[#E8DED0] bg-white px-6 py-3 text-xs font-extrabold text-[#222222] shadow-sm transition hover:shadow-md dark:border-[#C28700]/45 dark:bg-transparent dark:text-white dark:shadow-[0_12px_35px_rgba(194,135,0,0.08)] dark:hover:border-[#F6A21A] dark:hover:bg-[#F6A21A]/10"
          >
            ⊕ Añadir Nuevo Post
          </button>
        </div>

        {/* RESUMEN SUPERIOR */}
        <div className="mb-10 rounded-[28px] border border-[#E8DED0] bg-white px-8 py-7 shadow-sm transition-colors dark:border-[#C28700]/45 dark:bg-[#070707] dark:shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResumenCard
              titulo="Total posts"
              valor={blogs.length}
              color="text-[#111827] dark:text-white"
              accent="dark:from-white/35"
            />

            <ResumenCard
              titulo="Publicados"
              valor={count("PUBLICADO")}
              color="text-green-600 dark:text-emerald-400"
              accent="dark:from-emerald-400/55"
            />

            <ResumenCard
              titulo="Pendientes"
              valor={count("PENDIENTE")}
              color="text-amber-600 dark:text-[#F6A21A]"
              accent="dark:from-[#F6A21A]/60"
            />

            <ResumenCard
              titulo="Borradores"
              valor={count("BORRADOR")}
              color="text-gray-600 dark:text-zinc-300"
              accent="dark:from-zinc-400/45"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {estados.map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`flex items-center rounded-lg border px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] transition ${
                filtro === estado
                  ? "border-[#111111] bg-[#111111] text-white dark:border-[#F6A21A] dark:bg-transparent dark:text-white dark:shadow-[0_0_0_1px_rgba(246,162,26,0.25)]"
                  : estado === "TODOS"
                    ? "border-[#D8CEC2] bg-white text-[#242424] hover:bg-[#FAF7F2] dark:border-[#F6A21A]/50 dark:bg-transparent dark:text-white dark:hover:border-[#F6A21A]"
                    : `${getEstadoColor(estado)} hover:opacity-90`
              }`}
            >
              {estado === "TODOS" ? "Todos" : getEstadoLabel(estado)}

              {estado !== "TODOS" && (
                <span className="ml-2 text-xs opacity-70">{count(estado)}</span>
              )}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-[#7A7168] dark:text-zinc-300">
          Mostrando {filtrados.length} de {blogs.length} blogs
        </p>

        {/* EMPTY */}
        {filtrados.length === 0 ? (
          <div className="text-center text-[#7A7168] py-16 border border-[#E8DED0] bg-white rounded-[28px] shadow-sm">
            No hay blogs en este estado
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((blog) => (
              <div
                key={blog.id}
                tabIndex={0}
                role="button"
                aria-label={`Ver detalle del blog: ${blog.titulo}`}
                onClick={() => router.push(`/blog/${blog.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/blog/${blog.id}`);
                  }
                }}
                className="group cursor-pointer overflow-hidden rounded-[22px] border border-[#E8DED0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#C28700] focus:ring-offset-2 dark:border-white/20 dark:bg-[#070707] dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)] dark:hover:border-[#F6A21A]/30 dark:hover:bg-[#0b0b0b] dark:focus:ring-offset-black"
              >
                <div className="relative h-52 overflow-hidden bg-[#E5E0DA] dark:bg-zinc-900">
                  <img
                    src={getImagenSrc(blog.imagen)}
                    alt={blog.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] dark:brightness-[0.82]"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/55 via-black/5 to-transparent dark:block" />
                  <span
                    className={`absolute left-4 top-4 rounded-md border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${getEstadoBadgeColor(
                      blog.estado,
                    )}`}
                  >
                    {blog.estado}
                  </span>
                </div>

                <div className="p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8F84] dark:text-[#C28700]">
                    {getFechaVisible(blog)}
                  </p>

                  <h2 className="mb-8 line-clamp-2 min-h-[64px] text-2xl font-semibold leading-tight text-[#1F1F1F] dark:text-zinc-50">
                    {blog.titulo}
                  </h2>

                  {blog.estado === "RECHAZADO" &&
                    blog.blog_rechazo &&
                    blog.blog_rechazo.length > 0 && (
                      <div className="mb-4 p-3 bg-[#FDECEC] border border-[#F3BABA] rounded-lg">
                        <p className="text-xs font-bold text-[#D94848] uppercase tracking-wider mb-1">
                          Motivo de rechazo:
                        </p>
                        <p className="text-sm text-[#D94848] line-clamp-3 break-words">
                          {blog.blog_rechazo[0].comentario}
                        </p>
                      </div>
                    )}

                  <div className="flex items-center justify-between border-t border-[#EEE6DC] pt-4 dark:border-white/20">
                    {blog.estado === "BORRADOR" ||
                    blog.estado === "RECHAZADO" ||
                    blog.estado === "PENDIENTE" ||
                    blog.estado === "PUBLICADO" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/blog/${blog.id}/edit`);
                        }}
                        className="rounded text-xs font-bold text-[#3F3F3F] transition hover:text-[#B47A00] focus:outline-none focus:ring-2 focus:ring-[#B47A00] focus:ring-offset-4 dark:text-zinc-400 dark:hover:text-[#F6A21A] dark:focus:ring-offset-black"
                      >
                        ✎ {blog.estado === "BORRADOR" ? "Continuar" : "Editar"}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">
                        ✎ Editar
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarBlog(blog.id);
                      }}
                      className="rounded text-xs font-bold text-red-400 transition hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-4 dark:text-red-300 dark:hover:text-red-200 dark:focus:ring-offset-black"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ResumenCard({
  titulo,
  valor,
  color = "text-[#111827] dark:text-white",
  accent = "dark:from-white/20",
}: {
  titulo: string;
  valor: number;
  color?: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#EFE7DD] bg-[#FFFEFC] px-5 py-5 transition-colors dark:border-white/20 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
      <div
        className={`pointer-events-none absolute left-0 top-0 h-[10px] w-full bg-gradient-to-r ${accent} dark:via-transparent dark:to-transparent`}
      />
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A8F84] dark:text-zinc-500">
        {titulo}
      </p>

      <p className={`text-3xl font-light tracking-tight ${color}`}>
        {String(valor).padStart(2, "0")}
      </p>
    </div>
  );
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "PUBLICADO":
      return "Publicado";
    case "PENDIENTE":
      return "Pendiente";
    case "RECHAZADO":
      return "Rechazado";
    case "BORRADOR":
      return "Borrador";
    default:
      return estado;
  }
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case "PUBLICADO":
    case "APROBADO":
      return "bg-[#E8F7EE] text-[#198754] border-[#BFE8CD] dark:border-emerald-400/35 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "PENDIENTE":
    case "EN REVISION":
    case "EN_REVISIÓN":
    case "EN_REVISION":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:border-[#F6A21A]/40 dark:bg-[#F6A21A]/10 dark:text-[#F6A21A]";

    case "RECHAZADO":
      return "bg-[#FDECEC] text-[#D94848] border-[#F3BABA] dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400";

    case "BORRADOR":
      return "bg-[#F1F2F4] text-[#596270] border-[#D9DEE5] dark:border-zinc-400/25 dark:bg-zinc-500/10 dark:text-zinc-300";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:border-white/20 dark:bg-white/[0.04] dark:text-zinc-300";
  }
}

function getEstadoBadgeColor(estado: string) {
  switch (estado) {
    case "PUBLICADO":
    case "APROBADO":
      return "border-emerald-400/35 bg-emerald-500/20 text-emerald-100 dark:border-emerald-400/35 dark:bg-emerald-500/20 dark:text-emerald-200";

    case "PENDIENTE":
    case "EN REVISION":
    case "EN_REVISIÓN":
    case "EN_REVISION":
      return "border-orange-400/35 bg-orange-500/20 text-orange-100 dark:border-orange-400/35 dark:bg-orange-500/20 dark:text-orange-200";

    case "RECHAZADO":
      return "border-red-400/35 bg-red-500/20 text-red-100 dark:border-red-400/35 dark:bg-red-500/20 dark:text-red-200";

    case "BORRADOR":
      return "border-zinc-400/30 bg-zinc-500/20 text-zinc-100 dark:border-zinc-400/30 dark:bg-zinc-500/20 dark:text-zinc-200";

    default:
      return "border-white/20 bg-white/15 text-white dark:border-white/20 dark:bg-white/15 dark:text-white";
  }
}

function getFechaVisible(blog: Blog) {
  const fecha =
    blog.estado === "PUBLICADO" && blog.fecha_publicacion
      ? blog.fecha_publicacion
      : blog.fecha_creacion;

  if (!fecha) return "Sin fecha";

  return new Date(fecha)
    .toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(".", "")
    .toUpperCase();
}

function getImagenSrc(imagen: string | null) {
  if (!imagen) return "/placeholder.jpg";

  if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
    return imagen;
  }

  if (imagen.startsWith("/")) {
    return imagen;
  }

  return `${API_URL}/${imagen}`;
}
