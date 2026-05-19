import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  crearBlog,
  subirImagenBlog,
  listarBlogs,
  obtenerBlog,
  misBlogs,
  actualizarBlog,
  eliminarBlog,
  resubmitBlog,
  cambiarEstadoBlog,
  listarBlogsAdmin,
  listarCategorias,
  crearComentario,
  listarComentarios,
  toggleLikeComentario,
  eliminarComentario,
  actualizarComentario,
} from "./blogs.controller.js";

const router = Router();
const uploadBlogImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Solo se permiten imágenes JPG, PNG o WebP"));
      return;
    }

    cb(null, true);
  },
});

// Rutas de Blogs
router.get("/categorias", listarCategorias);
router.get("/admin", requireAuth, listarBlogsAdmin);
router.post(
  "/upload-image",
  requireAuth,
  uploadBlogImage.single("imagen"),
  subirImagenBlog,
);
router.post("/", requireAuth, crearBlog);
router.get("/", listarBlogs);
router.get("/mis-blogs", requireAuth, misBlogs);
router.get("/:id", obtenerBlog);
router.patch("/:id", requireAuth, actualizarBlog);
router.delete("/:id", requireAuth, eliminarBlog);
router.patch("/:id/resubmit", requireAuth, resubmitBlog);
router.patch("/:id/estado", requireAuth, cambiarEstadoBlog);

// Rutas de Comentarios
router.post("/comentarios", requireAuth, crearComentario);
router.get("/:id/comentarios", listarComentarios);
router.patch("/comentarios/:id", requireAuth, actualizarComentario);
router.post("/comentarios/:id/like", requireAuth, toggleLikeComentario);
router.delete("/comentarios/:id", requireAuth, eliminarComentario);

export default router;
