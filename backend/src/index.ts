import * as dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import { propertiesController } from './modules/properties/properties.controller.js'
import { BannersController } from './modules/banners/banners.controller.js'
import locationSearchHandler from '../api/locations/search.js'
// Importamos el manejador de popularidad -- BitPro 
import popularidadHandler from '../api/locations/popularidad.js'
dotenv.config()

import type { NextFunction, Request, Response } from "express";
import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { registerController, loginController, logoutController } from './modules/auth/auth.controller.js'
import meHandler from "../api/auth/me.js";
import correoverificacionRoutes from './modules/perfil/correoverificacion.routes.js';
const app = express();
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

app.use(cors())
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    email?: string;
  };
};

// auth temporal para pruebas
const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  ; (req as AuthenticatedRequest).user = {
    id: 1
  }

  next();
};
const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.post("/api/auth/logout", logoutController);
app.use('/api/perfil', correoverificacionRoutes);

app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))
app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(req as unknown as VercelRequest, res as unknown as VercelResponse)
})

// Usamos POST porque así lo definimos en tu Hook del frontend
app.post('/api/locations/popularidad', async (req, res) => {
  await popularidadHandler(req as any, res as any)
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" })
})

app.get("/api/properties/search", propertiesController.search)
app.get('/api/inmuebles', propertiesController.getAll)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})})
app.get('/notificaciones', fakeAuth, getNotificationsController)
app.get('/notificaciones/unread-count', fakeAuth, getUnreadCountController)
app.patch('/notificaciones/:id/read', fakeAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', fakeAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', fakeAuth, deleteNotificationController)


app.post("/api/publicaciones", (req, res) => {
  const nuevaPublicacion = req.body
  res.json({ message: "Publicación creada", publicacion: nuevaPublicacion });
});

app.get("/api/publicaciones", (req, res) => {
  res.json({ message: "Listado de publicaciones" });
})

app.get("/api/publicaciones/gratis", (req, res) => {
  res.json({ message: "Listado de publicaciones gratuitas" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/auth/me", async (req, res) => {
  await meHandler(req as any, res as any);
});
