"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

type BlogUpdatedPayload = {
  id?: number | string;
  blogId?: number | string;
};

type BlogRealtimeRefreshProps = {
  blogId: string;
};

export default function BlogRealtimeRefresh({
  blogId,
}: BlogRealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const handleUpdatedBlog = (
      payload: BlogUpdatedPayload | number | string,
    ) => {
      const updatedBlogId =
        typeof payload === "object" ? (payload.id ?? payload.blogId) : payload;

      if (!updatedBlogId || String(updatedBlogId) !== blogId) return;

      router.refresh();
    };

    socket.on("blog:actualizado", handleUpdatedBlog);

    return () => {
      socket.off("blog:actualizado", handleUpdatedBlog);
    };
  }, [blogId, router]);

  return null;
}
