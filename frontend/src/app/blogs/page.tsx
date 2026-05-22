"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import MyRecentBlogsPanel from "@/components/blog/MyRecentBlogsPanel";
import AddPostButton from "@/components/blog/AddPostButton";
import BlogFilterChips from "@/components/blog/BlogFilterChips";
import FeaturedBlogSpotlight from "@/components/blog/FeaturedBlogSpotlight";
import { useBlogFeed } from "@/hooks/useBlogFeed";
import { Blog } from "@/types/blog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type UserBlogResponse = {
  id: number;
  titulo: string;
  estado: Blog["estado"];
  imagen?: string | null;
  fecha_creacion?: string;
};

export default function BlogsPage() {
  const {
    activeCategory,
    categories,
    featuredBlog,
    secondaryBlogs,
    canLoadMore,
    hasResults,
    isLoading,
    toggleCategory,
    loadMore,
  } = useBlogFeed();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f5efe7_45%,#ffffff_100%)] dark:bg-stone-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <MyRecentBlogsPanel />

        <section className="space-y-6">
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            Perspectivas para el Bien Raiz Moderno.
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="overflow-x-auto pb-1 flex-1">
              <BlogFilterChips
                categories={categories}
                activeCategory={activeCategory}
                onToggleCategory={toggleCategory}
              />
            </div>
            <div className="flex justify-end sm:flex-shrink-0">
              <AddPostButton />
            </div>
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-[32px] border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 py-12 text-center shadow-sm">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-stone-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-stone-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
            </div>
            <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">Cargando artículos...</p>
          </section>
        ) : hasResults && featuredBlog ? (
          <FeaturedBlogSpotlight blog={featuredBlog} />
        ) : (
          <section className="rounded-[32px] border border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
              Sin resultados
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold text-stone-900 dark:text-stone-100">
              No encontramos articulos en esta categoria por ahora.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-400">
              Prueba con otra etiqueta para seguir explorando las publicaciones
              disponibles.
            </p>
          </section>
        )}

        {!isLoading && (
          <section className="space-y-6">
            {secondaryBlogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {secondaryBlogs.map((blog) => (
                  <BlogCard key={blog.id} {...blog} />
                ))}
              </div>
            ) : hasResults ? (
              <div className="rounded-[28px] border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 py-10 text-center text-stone-600 dark:text-stone-300 shadow-sm">
                Esta categoria solo tiene un articulo destacado por el momento.
              </div>
            ) : null}

            {canLoadMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={loadMore}
                  className="rounded-full border border-amber-600 dark:border-amber-500 px-6 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white"
                >
                  CONTINUAR LEYENDO
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
