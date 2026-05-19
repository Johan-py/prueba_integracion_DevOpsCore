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
        const lista = Array.isArray(data) ? data : data.blogs || data.data || [];
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
    <main className="min-h-screen bg-[#F6F1EA] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 border-l-4 border-[#C28700] pl-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#B47A00] font-extrabold mb-1">
              Panel de control
            </p>

            <h1 className="text-5xl font-extrabold leading-none text-[#222222]">
              Mis Blogs
            </h1>

            <p className="text-[#6F675F] text-sm mt-3">
              Aquí puedes ver todos tus blogs y su estado
            </p>
          </div>

          <button
            onClick={() => router.push("/blog/create")}
            className="bg-white text-[#222222] px-6 py-3 rounded-lg text-xs font-extrabold shadow-sm hover:shadow-md transition"
          >
            ⊕ Añadir Nuevo Post
          </button>
        </div>

        {/* RESUMEN SUPERIOR */}
        <div className="bg-white border border-[#E8DED0] rounded-[28px] shadow-sm px-8 py-7 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResumenCard titulo="Total posts" valor={blogs.length} />

            <ResumenCard
              titulo="Publicados"
              valor={count("PUBLICADO")}
              color="text-green-600"
            />

            <ResumenCard
              titulo="Pendientes"
              valor={count("PENDIENTE")}
              color="text-amber-600"
            />

            <ResumenCard
              titulo="Borradores"
              valor={count("BORRADOR")}
              color="text-gray-600"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {estados.map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`flex items-center px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-[0.16em] border transition ${filtro === estado
                ? "bg-[#111111] text-white border-[#111111]"
                : estado === "TODOS"
                  ? "bg-white text-[#242424] border-[#D8CEC2] hover:bg-[#FAF7F2]"
                  : `${getEstadoColor(estado)} hover:opacity-80`
                }`}
            >
              {estado === "TODOS" ? "Todos" : getEstadoLabel(estado)}

              {estado !== "TODOS" && (
                <span className="ml-2 text-xs opacity-70">
                  {count(estado)}
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-[#7A7168]">
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
                className="cursor-pointer bg-white border border-[#E8DED0] rounded-[22px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition focus:outline-none focus:ring-2 focus:ring-[#C28700] focus:ring-offset-2"
              >
                <div className="relative h-52 bg-[#E5E0DA]">
                  <img
                    src={getImagenSrc(blog.imagen)}
                    alt={blog.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder.jpg")
                    }
                  />

                  <span
                    className={`absolute left-4 top-4 text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1 rounded-full border ${getEstadoColor(
                      blog.estado
                    )}`}
                  >
                    {getEstadoLabel(blog.estado)}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8F84] mb-3">
                    {getFechaVisible(blog)}
                  </p>

                  <h2 className="font-semibold text-2xl leading-tight text-[#1F1F1F] mb-8 line-clamp-2 min-h-[64px]">
                    {blog.titulo}
                  </h2>

                  {blog.estado === "RECHAZADO" && blog.blog_rechazo && blog.blog_rechazo.length > 0 && (
                    <div className="mb-4 p-3 bg-[#FDECEC] border border-[#F3BABA] rounded-lg">
                      <p className="text-xs font-bold text-[#D94848] uppercase tracking-wider mb-1">Motivo de rechazo:</p>
                      <p className="text-sm text-[#D94848] break-words">{blog.blog_rechazo[0].comentario}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-[#EEE6DC] pt-4">
                    {blog.estado === "BORRADOR" ||
                      blog.estado === "RECHAZADO" ||
                      blog.estado === "PENDIENTE" ||
                      blog.estado === "PUBLICADO" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/blog/${blog.id}/edit`);
                        }}
                        className="text-xs font-bold text-[#3F3F3F] hover:text-[#B47A00] transition rounded focus:outline-none focus:ring-2 focus:ring-[#B47A00] focus:ring-offset-4"
                      >
                        ✎ {blog.estado === "BORRADOR" ? "Continuar" : "Editar"}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">✎ Editar</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarBlog(blog.id);
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-600 transition rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-4"
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
  color = "text-[#111827]",
}: {
  titulo: string;
  valor: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EFE7DD] bg-[#FFFEFC] px-5 py-5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A8F84]">
        {titulo}
      </p>

      <p className={`text-3xl font-light ${color}`}>
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
      return "bg-[#E8F7EE] text-[#198754] border-[#BFE8CD]";
    case "PENDIENTE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "RECHAZADO":
      return "bg-[#FDECEC] text-[#D94848] border-[#F3BABA]";
    case "BORRADOR":
      return "bg-[#F1F2F4] text-[#596270] border-[#D9DEE5]";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
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
