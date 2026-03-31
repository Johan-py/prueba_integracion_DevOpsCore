// backend/src/server.ts
import 'dotenv/config';
import express from "express";
import cors from "cors";

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import publicacionesRoutes from './routes/publicaciones.js'; 
import { authMiddleware } from './middleware/authMiddleware.js';
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/api", publicacionesRoutes);

// Ejemplo de ruta protegida (validación de publicaciones gratuitas)
app.get("/users/:id/publicaciones/free", authMiddleware, (req, res) => {
  // Aquí luego implementamos la lógica con Prisma
  res.json({ restantes: 2 });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
