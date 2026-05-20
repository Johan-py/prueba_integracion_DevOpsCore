"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type BlogDeletedPayload = {
  id?: number | string;
  blogId?: number | string;
};

type BlogDeletedRedirectProps = {
  blogId: string;
};

const getDeletedBlogId = (payload: BlogDeletedPayload | number | string) => {
  if (typeof payload === "object") {
    return payload.id ?? payload.blogId;
  }

  return payload;
};

export default function BlogDeletedRedirect({
  blogId,
}: BlogDeletedRedirectProps) {
  const router = useRouter();
  const [wasDeleted, setWasDeleted] = useState(false);

  useEffect(() => {
    const handleDeletedBlog = (
      payload: BlogDeletedPayload | number | string,
    ) => {
      const deletedBlogId = getDeletedBlogId(payload);

      if (!deletedBlogId || String(deletedBlogId) !== blogId) return;

      setWasDeleted(true);
    };

    socket.on("blog:eliminado_global", handleDeletedBlog);

    return () => {
      socket.off("blog:eliminado_global", handleDeletedBlog);
    };
  }, [blogId]);

  const handleAccept = () => {
    router.replace("/blogs");
  };

  if (!wasDeleted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-stone-950">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#a56400]">
          Blog no disponible
        </p>

        <h2 className="mt-3 text-2xl font-black text-stone-900 dark:text-white">
          Este blog fue eliminado
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          Esta publicación ya no se encuentra disponible porque fue eliminada.
          Presiona aceptar para volver a la lista de blogs.
        </p>

        <button
          type="button"
          onClick={handleAccept}
          className="mt-6 inline-flex rounded-full bg-[#a56400] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#8a5200]"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
