import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./modules/notificaciones/notificaciones.controller.js";
import { BannersController } from "./modules/banners/banners.controller.js";
import locationSearchHandler from "../api/locations/search.js";
import { FiltersHomepageController } from "./modules/filtershomepage/filtershomepage.controller.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { registerController, loginController, logoutController } from "./modules/auth/auth.controller.js";
import meHandler from "../api/auth/me.js";
// Import corregido: si el archivo exporta un router con `export const router`, usamos destructuring
import { router as correoverificacionRoutes } from "./modules/perfil/correoverificacion.routes.js";

// Importamos el router de publicaciones (HU1)
import publicacionesRoutes from "./modules/publicaciones/publicaciones.routes.js";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    email?: string;
  };
};

// auth temporal para pruebas
const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  (req as AuthenticatedRequest).user = { id: 1 };
  next();
};

const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

// --- Rutas de usuarios y auth ---
app.post("/api/users", (req: Request, res: Response) => {
  const user = req.body;
  res.json({ message: "User created", user });
});
app.post("/api/auth/register", registerController);
app.post("/api/auth/login", loginController);
app.post("/api/auth/logout", logoutController);
app.use("/api/perfil", correoverificacionRoutes);

// Tipado corregido para evitar `any`
app.get("/api/auth/me", async (req: Request, res: Response) => {
  await meHandler(req as unknown as VercelRequest, res as unknown as VercelResponse);
});

// --- Rutas de filtros y banners ---
app.get("/api/filters", filtersController.getFilters);
app.get("/api/banners", (req: Request, res: Response) => bannersController.getBanners(req, res));
app.get("/api/locations/search", async (req: Request, res: Response) => {
  const vercelReq = req as unknown as VercelRequest;
  const vercelRes = res as unknown as VercelResponse;
  await locationSearchHandler(vercelReq, vercelRes);
});

// --- Rutas de notificaciones ---
app.get("/notificaciones", fakeAuth, getNotificationsController);
app.get("/notificaciones/unread-count", fakeAuth, getUnreadCountController);
app.patch("/notificaciones/:id/read", fakeAuth, markNotificationAsReadController);
app.patch("/notificaciones/read-all", fakeAuth, markAllNotificationsAsReadController);
app.delete("/notificaciones/:id", fakeAuth, deleteNotificationController);

// --- Rutas de publicaciones (HU1) ---
app.use("/api", publicacionesRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
