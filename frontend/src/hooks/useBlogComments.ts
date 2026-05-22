"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BLOG_COMMENT_MAX_LENGTH,
  BlogComment,
  BlogCommentAuthor,
  INITIAL_VISIBLE_TOP_LEVEL_COMMENTS,
} from "@/types/blogComment";
import { USER_STORAGE_KEY } from "@/lib/session";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const DRAFT_STORAGE_PREFIX = "propbol_blog_comment_draft";
const createStorageKey = (prefix: string, blogId: string) =>
  `${prefix}:${blogId}`;
const socket = io(API_URL);

const getDescendantIds = (
  comments: BlogComment[],
  parentId: string,
): string[] => {
  const directChildren = comments.filter(
    (comment) => comment.parentId === parentId,
  );
  return directChildren.flatMap((comment) => [
    comment.id,
    ...getDescendantIds(comments, comment.id),
  ]);
};

const readStoredDraft = (blogId: string) => {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(
      createStorageKey(DRAFT_STORAGE_PREFIX, blogId),
    ) ?? ""
  );
};

const buildFallbackUserName = () => {
  if (typeof window === "undefined") return "Usuario PropBol";
  return (
    window.localStorage.getItem("nombre") ||
    window.localStorage.getItem("correo") ||
    "Usuario PropBol"
  );
};

const readCurrentUser = (): BlogCommentAuthor => {
  if (typeof window === "undefined") {
    return { id: "guest-user", name: "Usuario PropBol", avatar: null };
  }

  const storedAvatar = window.localStorage.getItem("avatar");
  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  const token = window.localStorage.getItem("token");

  let numericId: string | null = null;
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded && decoded.id) {
        numericId = String(decoded.id);
      }
    } catch {
      // Ignore token decode errors
    }
  }

  if (!storedUser) {
    const fallbackName = buildFallbackUserName();
    return {
      id: numericId || fallbackName.toLowerCase().replace(/\s+/g, "-"),
      name: fallbackName,
      avatar: storedAvatar,
    };
  }

  try {
    const parsedUser = JSON.parse(storedUser) as {
      name?: string;
      email?: string;
      avatar?: string | null;
      id?: number;
    };
    const name = parsedUser.name || parsedUser.email || buildFallbackUserName();
    const id =
      numericId ||
      String(
        parsedUser.id ||
          parsedUser.email ||
          name.toLowerCase().replace(/\s+/g, "-"),
      );

    return {
      id,
      name,
      email: parsedUser.email,
      avatar: parsedUser.avatar ?? storedAvatar,
    };
  } catch {
    const fallbackName = buildFallbackUserName();
    return {
      id: numericId || fallbackName.toLowerCase().replace(/\s+/g, "-"),
      name: fallbackName,
      avatar: storedAvatar,
    };
  }
};

function mapBackendComment(backendComment: any): BlogComment {
  return {
    id: String(backendComment.id),
    blogId: String(backendComment.blog_id),
    parentId: backendComment.comentario_padre_id
      ? String(backendComment.comentario_padre_id)
      : null,
    author: {
      id: String(backendComment.usuario?.id || ""),
      name:
        `${backendComment.usuario?.nombre || ""} ${backendComment.usuario?.apellido || ""}`.trim() ||
        "Usuario PropBol",
      avatar: backendComment.usuario?.avatar || null,
    },
    content: backendComment.contenido,
    createdAt: backendComment.fecha_creacion,
    updatedAt: null, // tracked locally for now as there is no updatedAt in DB
    likes: backendComment.likes || 0,
    likedByCurrentUser: !!backendComment.likedByCurrentUser,
  };
}

export const useBlogComments = (blogId: string) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [draft, setDraft] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const [visibleTopLevelComments, setVisibleTopLevelComments] = useState(
    INITIAL_VISIBLE_TOP_LEVEL_COMMENTS,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<BlogCommentAuthor>({
    id: "guest-user",
    name: "Usuario PropBol",
    avatar: null,
  });

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Request enough limit to load the thread in frontend easily.
      // In a real infinite scroll app, we might paginate, but the frontend needs all parents to render threads.
      const res = await fetch(
        `${API_URL}/api/blogs/${blogId}/comentarios?limit=100&t=${Date.now()}`,
        { headers, cache: "no-store" },
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setComments(json.data.map(mapBackendComment));
        }
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    setDraft(readStoredDraft(blogId));
    setReplyingToId(null);
    setEditingCommentId(null);
    setMenuOpenForId(null);
    setVisibleTopLevelComments(INITIAL_VISIBLE_TOP_LEVEL_COMMENTS);
    setCurrentUser(readCurrentUser());
    fetchComments();
  }, [blogId, fetchComments]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        createStorageKey(DRAFT_STORAGE_PREFIX, blogId),
        draft,
      );
    }
  }, [blogId, draft]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncCurrentUser = () => setCurrentUser(readCurrentUser());
    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("propbol:session-changed", syncCurrentUser);
    window.addEventListener("profileUpdated", syncCurrentUser);

    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("propbol:session-changed", syncCurrentUser);
      window.removeEventListener("profileUpdated", syncCurrentUser);
    };
  }, []);

  useEffect(() => {
    if (!blogId || !socket) return;

    const cleanId = String(blogId);

    socket.emit("join_blog_room", cleanId);
    const nuevoEvento = `blog:${cleanId}:nuevo_comentario`;
    const editadoEvento = `blog:${cleanId}:comentario_actualizado`;
    const eliminadoEvento = `blog:${cleanId}:comentario_eliminado`;

    socket.on(nuevoEvento, (data) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === String(data.id))) return prev;
        return [mapBackendComment(data), ...prev];
      });
    });

    socket.on(editadoEvento, (data) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === String(data.id) ? mapBackendComment(data) : c,
        ),
      );
    });

    socket.on(eliminadoEvento, ({ id }) => {
      setComments((prev) => prev.filter((c) => c.id !== String(id)));
    });

    return () => {
      socket.off(nuevoEvento);
      socket.off(editadoEvento);
      socket.off(eliminadoEvento);
    };
  }, [blogId, socket]);

  const topLevelComments = comments
    .filter((comment) => comment.parentId === null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const visibleComments = topLevelComments.slice(0, visibleTopLevelComments);
  const totalComments = comments.length;
  const isDraftEmpty = draft.trim().length === 0;
  const isAtCharacterLimit = draft.length >= BLOG_COMMENT_MAX_LENGTH;

  const activeParent = replyingToId
    ? (comments.find((c) => c.id === replyingToId) ?? null)
    : null;
  const activeEdition = editingCommentId
    ? (comments.find((c) => c.id === editingCommentId) ?? null)
    : null;

  const getReplies = (commentId: string) =>
    comments.filter((comment) => comment.parentId === commentId);

  const startReply = (commentId: string) => {
    setReplyingToId(commentId);
    setEditingCommentId(null);
    setMenuOpenForId(null);
  };

  const startEdit = (commentId: string) => {
    const commentToEdit = comments.find((c) => c.id === commentId);
    if (!commentToEdit) return;
    setDraft(commentToEdit.content);
    setEditingCommentId(commentId);
    setReplyingToId(null);
    setMenuOpenForId(null);
  };

  const cancelComposerMode = () => {
    setReplyingToId(null);
    setEditingCommentId(null);
    setMenuOpenForId(null);
    setDraft("");
  };

  const handleDraftChange = (value: string) => {
    setDraft(value.slice(0, BLOG_COMMENT_MAX_LENGTH));
  };

  const toggleLike = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Optimistic UI update
    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) return comment;
        const nextLikedState = !comment.likedByCurrentUser;
        return {
          ...comment,
          likedByCurrentUser: nextLikedState,
          likes: Math.max(0, comment.likes + (nextLikedState ? 1 : -1)),
        };
      }),
    );

    try {
      const res = await fetch(
        `${API_URL}/api/blogs/comentarios/${commentId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        // Revert on error
        fetchComments();
      }
    } catch {
      fetchComments();
    }
  };

  const deleteComment = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/blogs/comentarios/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        const idsToDelete = [
          commentId,
          ...getDescendantIds(comments, commentId),
        ];
        setMenuOpenForId(null);

        if (replyingToId && idsToDelete.includes(replyingToId))
          setReplyingToId(null);
        if (editingCommentId && idsToDelete.includes(editingCommentId)) {
          setEditingCommentId(null);
          setDraft("");
        }
      } else {
        alert("Error al eliminar el comentario");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error de conexión");
    }
  };

  const requestDelete = (commentId: string) => {
    deleteComment(commentId);
  };

  const submitComment = async () => {
    const normalizedDraft = draft.trim();
    if (!normalizedDraft || isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCommentId) {
        // Edit
        const res = await fetch(
          `${API_URL}/api/blogs/comentarios/${editingCommentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ contenido: normalizedDraft }),
          },
        );

        if (res.ok) {
          const data = await res.json();
          setComments((currentComments) =>
            currentComments.map((comment) =>
              comment.id === editingCommentId
                ? {
                    ...comment,
                    content: data.contenido,
                    updatedAt: new Date().toISOString(),
                  }
                : comment,
            ),
          );
          setDraft("");
          setEditingCommentId(null);
        } else {
          const err = await res.json();
          alert(err.message || "Error al editar el comentario");
        }
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/blogs/comentarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contenido: normalizedDraft,
            blog_id: Number(blogId),
            comentario_padre_id: replyingToId
              ? Number(replyingToId)
              : undefined,
          }),
        });

        if (res.ok) {
          setVisibleTopLevelComments((currentVisibleCount) =>
            replyingToId ? currentVisibleCount : currentVisibleCount + 1,
          );
          setDraft("");
          setReplyingToId(null);
        } else {
          const err = await res.json();
          alert(err.message || "Error al crear el comentario");
        }
      }
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeEdition,
    activeParent,
    blogId,
    canLoadMore: topLevelComments.length > visibleTopLevelComments,
    cancelComposerMode,
    currentUser,
    draft,
    getReplies,
    handleDraftChange,
    isAtCharacterLimit,
    isDraftEmpty,
    isSubmitting,
    isLoading,
    maxLength: BLOG_COMMENT_MAX_LENGTH,
    menuOpenForId,
    requestDelete,
    setMenuOpenForId,
    startEdit,
    startReply,
    submitComment,
    toggleLike,
    totalComments,
    visibleComments,
    loadMore: () =>
      setVisibleTopLevelComments(
        (currentVisibleCount) => currentVisibleCount + 3,
      ),
  };
};
