import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";

import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller';

import { BannersController } from './modules/banners/banners.controller';
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller';

import locationSearchHandler from '../../api/locations/search';

import type { VercelRequest, VercelResponse } from '@vercel/node';

import {
  registerController,
  loginController,
  logoutController
} from './modules/auth/auth.controller';

import meHandler from "../../api/auth/me";
import correoverificacionRoutes from './modules/perfil/correoverificacion.routes';

const app = express();

// CORS (solo uno bien configurado)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// JSON middleware
app.use(express.json());

// ------------------- TYPES -------------------
type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    email?: string;
  };
};

// ------------------- FAKE AUTH -------------------
const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  (req as AuthenticatedRequest).user = {
    id: 1
  };
  next();
};

// ------------------- CONTROLLERS -------------------
const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

// ------------------- ROUTES -------------------

// USERS
app.post('/api/users', (req, res) => {
  const user = req.body;
  res.json({
    message: 'User created',
    user
  });
});

// AUTH
app.post('/api/auth/register', registerController);
app.post('/api/auth/login', loginController);
app.post('/api/auth/logout', logoutController);
app.get('/api/auth/me', meHandler);

// PERFIL
app.use('/api/perfil', correoverificacionRoutes);

// FILTERS
app.get('/api/filters', filtersController.getFilters);

// BANNERS
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res));

// LOCATIONS
app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(
    req as unknown as VercelRequest,
    res as unknown as VercelResponse
  );
});

// NOTIFICACIONES
app.get('/notificaciones', fakeAuth, getNotificationsController);
app.get('/notificaciones/unread-count', fakeAuth, getUnreadCountController);
app.patch('/notificaciones/:id/read', fakeAuth, markNotificationAsReadController);
app.patch('/notificaciones/read-all', fakeAuth, markAllNotificationsAsReadController);
app.delete('/notificaciones/:id', fakeAuth, deleteNotificationController);

// PUBLICACIONES
app.post("/api/publicaciones", (req, res) => {
  const nuevaPublicacion = req.body;
  res.json({ message: "Publicación creada", publicacion: nuevaPublicacion });
});

app.get("/api/publicaciones", (req, res) => {
  res.json({ message: "Listado de publicaciones" });
});

app.get("/api/publicaciones/gratis", (req, res) => {
  res.json({ message: "Listado de publicaciones gratuitas" });
});

// ------------------- SERVER -------------------
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});