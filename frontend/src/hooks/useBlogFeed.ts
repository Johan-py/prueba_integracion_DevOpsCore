"use client";

import { useEffect, useState } from "react";
import { getPublishedBlogs, getBlogCategories } from "@/services/blogs.service";
import { createPlainTextExcerpt } from "@/lib/blogMarkdown";
import { BlogCategory, PublicBlogCard } from "@/types/publicBlog";
import { socket } from "@/lib/socket";

const INITIAL_VISIBLE_CARDS = 3;
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

const sortByPublishedDate = (a: PublicBlogCard, b: PublicBlogCard) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const orderBlogs = (blogs: PublicBlogCard[]) => {
  const featuredBlogs = blogs
    .filter((blog) => blog.isFeatured)
    .sort(sortByPublishedDate);
  const regularBlogs = blogs
    .filter((blog) => !blog.isFeatured)
    .sort(sortByPublishedDate);

  return [...featuredBlogs, ...regularBlogs];
};

export const useBlogFeed = () => {
  const [blogs, setBlogs] = useState<PublicBlogCard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(
    null,
  );
  const [visibleCards, setVisibleCards] = useState(INITIAL_VISIBLE_CARDS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, categoriesData] = await Promise.all([
          getPublishedBlogs(50),
          getBlogCategories(),
        ]);
        setBlogs(orderBlogs(blogsData));
        setCategories(categoriesData.map((c) => c.nombre));
      } catch (error) {
        console.error("Error fetching data for blog feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleNewPublishedBlog = (blog: any) => {
      const mappedBlog: PublicBlogCard = {
        id: String(blog.id),
        title: blog.titulo,
        excerpt: blog.resumen || blog.contenido,
        imageUrl: blog.imagen,
        category: blog.categoria?.nombre || "General",
        categoryLabel: blog.categoria?.nombre || "General",

        authorName:
          `${blog.usuario?.nombre || ""} ${blog.usuario?.apellido || ""}`.trim(),

        publishedAt:
          blog.fecha_publicacion ||
          blog.fecha_creacion ||
          new Date().toISOString(),

        isFeatured: blog.destacado ?? false,
      };

      setBlogs((prev) => {
        const exists = prev.some((b) => b.id === mappedBlog.id);

        if (exists) return prev;

        return orderBlogs([mappedBlog, ...prev]);
      });
    };

    const handleDeletedBlog = (payload: any) => {
      const blogId = payload?.id ?? payload?.blogId ?? payload;

      if (!blogId) return;

      setBlogs((prev) => prev.filter((blog) => blog.id !== String(blogId)));
    };

    socket.on("blog:publicado_global", handleNewPublishedBlog);
    socket.on("blog:eliminado_global", handleDeletedBlog);

    return () => {
      socket.off("blog:publicado_global", handleNewPublishedBlog);
      socket.off("blog:eliminado_global", handleDeletedBlog);
    };
  }, []);

  // RESTAURAR CATEGORÍA
  useEffect(() => {
    const savedCategory = localStorage.getItem("blogCategory");
    if (savedCategory) {
      setActiveCategory(savedCategory as BlogCategory);
    }
  }, []);

  // ✅ GUARDAR CATEGORÍA
  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem("blogCategory", activeCategory);
    } else {
      localStorage.removeItem("blogCategory");
    }
  }, [activeCategory]);

  // ✅ RESTAURAR SCROLL
  useEffect(() => {
    const savedScroll = localStorage.getItem("blogScroll");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, Number(savedScroll));
      }, 100);
    }
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [blogsData, categoriesData] = await Promise.all([
          getPublishedBlogs(50),
          getBlogCategories(),
        ]);
        setBlogs(orderBlogs(blogsData));
        setCategories(categoriesData.map((c) => c.nombre));
      } catch (error) {
        console.error("Error fetching data for blog feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    activeCategory ? blog.category === activeCategory : true,
  );

  const featuredBlog = filteredBlogs[0] ?? null;
  const secondaryBlogs = filteredBlogs.slice(1, visibleCards + 1);
  const canLoadMore = filteredBlogs.length > secondaryBlogs.length + 1;

  useEffect(() => {
    setVisibleCards(INITIAL_VISIBLE_CARDS);
  }, [activeCategory]);

  const toggleCategory = (category: BlogCategory | null) => {
    if (category === null) {
      setActiveCategory(null);
      return;
    }
    setActiveCategory((currentCategory) =>
      currentCategory === category ? null : category,
    );
  };

  return {
    activeCategory,
    categories,
    featuredBlog,
    secondaryBlogs,
    canLoadMore,
    hasResults: filteredBlogs.length > 0,
    isLoading,
    toggleCategory,
    loadMore: () =>
      setVisibleCards((currentVisibleCards) => currentVisibleCards + 3),
  };
};
