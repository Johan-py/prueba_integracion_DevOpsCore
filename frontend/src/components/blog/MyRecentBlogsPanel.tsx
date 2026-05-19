"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";

const MAX_VISIBLE = 5;
const USER_STORAGE_KEY = "propbol_user";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_STYLES: Record<string, string> = {
  PUBLICADO: "bg-green-50 text-green-700 border-green-200",
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  RECHAZADO: "bg-red-50 text-red-600 border-red-200",
  BORRADOR: "bg-stone-50 text-stone-500 border-stone-200",
};

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "PUBLICADO":
      return "Aprobado";
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

function getStatusClass(estado: string) {
  return STATUS_STYLES[estado] ?? "bg-stone-50 text-stone-500 border-stone-200";
}

interface MyRecentBlogsPanelProps {
  blogs?: Blog[];
}

type UserBlogResponse = {
  id: number;
  titulo: string;
  estado: Blog["estado"];
  imagen?: string | null;
  fecha_creacion?: string;
};

const MyRecentBlogsPanel: React.FC<MyRecentBlogsPanelProps> = ({ blogs: propBlogs }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [internalBlogs, setInternalBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = async () => {
      const token = localStorage.getItem('token');
      const isAuth = Boolean(localStorage.getItem(USER_STORAGE_KEY));
      setIsAuthenticated(isAuth);

      if (token) {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_URL}/api/blogs/mis-blogs`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) throw new Error('Error al obtener blogs');

          const data = (await res.json()) as UserBlogResponse[];
          const mapped: Blog[] = data.map((b) => ({
            id: b.id,
            titulo: b.titulo,
            imagenUrl: b.imagen || '/placeholder-house.jpg',
            estado: b.estado,
            fecha: b.fecha_creacion
              ? new Date(b.fecha_creacion).toLocaleDateString('es-BO')
              : ''
          }));
          setInternalBlogs(mapped);
        } catch {
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('propbol:session-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('propbol:session-changed', syncAuthState);
    };
  }, []);

  if (!isAuthenticated) return null;

  const blogs = propBlogs || internalBlogs;
  const visible = blogs.slice(0, MAX_VISIBLE);

  if (isLoading && !propBlogs) {
    return (
      <section className="bg-white dark:bg-stone-900 rounded-[32px] p-6 border border-stone-100 dark:border-stone-700 shadow-sm mb-10">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-stone-200 rounded w-1/4"></div>
            <div className="h-4 bg-stone-200 rounded w-1/2"></div>
          </div>
        </div>
        <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">Cargando tus blogs...</p>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="bg-white dark:bg-stone-900 rounded-[32px] p-6 border border-stone-100 dark:border-stone-700 shadow-sm mb-10">
        <p className="text-sm text-stone-400 dark:text-stone-500">No publicaste ningún blog aún</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Mis blogs recientes"
      className="bg-white dark:bg-stone-900 rounded-[32px] p-6 border border-stone-100 dark:border-stone-700 shadow-sm mb-10"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-stone-900 dark:text-stone-100 font-bold text-sm uppercase tracking-widest">
            Mis Blogs Recientes
          </h2>
          <p className="text-stone-400 dark:text-stone-500 text-xs">Panel de control editorial</p>
        </div>

        <Link href="/mis-blogs">
          <button className="text-[#A67C00] font-bold text-xs uppercase tracking-tighter transition-colors hover:text-[#7d4b00]">
            Ver todos mis posts
          </button>
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.id}`}
            className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-200">
              <Image
                src={blog.imagenUrl || "/placeholder-house.jpg"}
                alt={blog.titulo}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-stone-800 dark:text-stone-200">
                {blog.titulo}
              </p>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(blog.estado)}`}
              >
                {getEstadoLabel(blog.estado)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MyRecentBlogsPanel;
