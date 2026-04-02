import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { propertiesController } from "./modules/properties/properties.controller.js";
import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./modules/notificaciones/notificaciones.controller.js";
import { BannersController } from "./modules/banners/banners.controller.js";
import locationSearchHandler from "../api/locations/search.js";
import popularidadHandler from "../api/locations/popularidad.js";
import { FiltersHomepageController } from "./modules/filtershomepage/filtershomepage.controller.js";
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController,
} from "./modules/auth/auth.controller.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import meHandler from "../api/auth/me.js";
import correoverificacionRoutes from "./modules/perfil/correoverificacion.routes.js";
import {
  googleCallbackController,
  StratGoogleLoginController,
} from "./modules/auth/google/google.controller.js";

import {
  AuthError,
  loginWithGoogleCodeService,
} from "./modules/auth/auth.service.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

const bannersController = new BannersController();
const filtersController = new FiltersHomepageController();

app.post("/api/users", (req, res) => {
  const user = req.body;
  res.json({ message: "User created", user });
});
app.post("/api/auth/register", registerController);
app.post("/api/auth/login", loginController);
app.post("/api/auth/logout", logoutController);
app.post("/api/auth/verify-register", verifyRegisterCodeController);
const buildGooglePopupResponseHtml = (payload: {
  type: "GOOGLE_AUTH_SUCCESS" | "GOOGLE_AUTH_ERROR";
  token?: string;
  user?: unknown;
  error?: string;
}) => {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Google Auth</title>
      </head>
      <body>
        <script>
          (function () {
            const message = ${JSON.stringify({
              source: "propbol-google-auth",
              ...payload,
            })};
            const frontendOrigin = ${JSON.stringify(env.FRONTEND_URL)};

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(message, frontendOrigin);
              window.close();
              return;
            }

            const params = new URLSearchParams();

            if (message.type === 'GOOGLE_AUTH_SUCCESS') {
              params.set('google', 'success');
              params.set('token', message.token || '');
            } else {
              params.set('google', 'error');
              params.set(
                'message',
                typeof message.error === 'string'
                  ? message.error
                  : 'No se pudo iniciar sesión con Google'
              );
            }

            window.location.href = frontendOrigin + '/sign-in?' + params.toString();
          })();
        </script>
      </body>
    </html>
  `;
};
app.get("/api/auth/google/login", StratGoogleLoginController);

app.get("/api/auth/google/callback", googleCallbackController);

app.use("/api/perfil", correoverificacionRoutes);

app.get("/api/filters", filtersController.getFilters);
app.get("/api/banners", (req, res) => bannersController.getBanners(req, res));

app.get("/api/locations/search", async (req, res) => {
  await locationSearchHandler(
    req as unknown as VercelRequest,
    res as unknown as VercelResponse,
  );
});

app.post("/api/locations/popularidad", async (req, res) => {
  await popularidadHandler(req as any, res as any);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.get("/api/properties/search", propertiesController.search);
app.get("/api/inmuebles", propertiesController.getAll);

app.get("/notificaciones", requireAuth, getNotificationsController);
app.get("/notificaciones/unread-count", requireAuth, getUnreadCountController);
app.patch(
  "/notificaciones/:id/read",
  requireAuth,
  markNotificationAsReadController,
);
app.patch(
  "/notificaciones/read-all",
  requireAuth,
  markAllNotificationsAsReadController,
);
app.delete("/notificaciones/:id", requireAuth, deleteNotificationController);

app.post("/api/publicaciones", (req, res) => {
  const nuevaPublicacion = req.body;
  res.json({ message: "Publicación creada", publicacion: nuevaPublicacion });
});

app.get("/api/publicaciones", (_req, res) => {
  res.json({ message: "Listado de publicaciones" });
});

app.get("/api/publicaciones/gratis", (_req, res) => {
  res.json({ message: "Listado de publicaciones gratuitas" });
});

app.get("/api/auth/me", async (req, res) => {
  await meHandler(req as any, res as any);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
