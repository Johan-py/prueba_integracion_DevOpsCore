import path from "path";
import http from "http";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import type { Request, Response } from "express";
import { prisma } from "./lib/prisma.client.js";
import zonaRoutes from "./modules/perfil/zonaUsario.routes.js";
import telemetriaRouter from "./modules/perfil/telemetria.routes.js";
import locationRoutes from "./modules/locations/locations.routes.js";
import consumoRoutes from "./modules/LimiteSuscripcion/consumo.routes.js";
import { iniciarCronRetroalimentacion } from './modules/recomendaciones/retroalimentacionCron.js'
import mlRoutes from './modules/ml/ml.routes.js'
import { cargarModeloActivo } from './modules/ml/model-loader.js'

// --------------------
// CONTROLLERS
// --------------------
import { propertiesController } from './modules/properties/properties.controller.js'

import {
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getNotificationByIdController,
  archiveNotificationController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js'
import notificationStreamRoutes from './modules/notificaciones/notificaciones-stream.routes.js'
import { BannersController } from './modules/banners/banners.controller.js'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js'
import { CityController } from './modules/city/city.controller.js'
// --------------------
// AUTH
// --------------------
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController,
  verify2FAController,
  getMeController,
  activate2FAController,
  deactivate2FAController,
  get2FAStatusController,
  forgotPasswordController,
  resetPasswordController,
  resend2FAController,
  requestMagicLinkController,
  loginWithMagicLinkController,
  resendMagicLinkController,
  activateAccountByPasswordController,
  requestActivationCodeController,
  activateAccountByCodeController,
  resendRegisterCodeController,
} from './modules/auth/auth.controller.js'
import { requireAuth } from './middleware/auth.middleware.js'

// --------------------
// ROUTES / HANDLERS
// --------------------
import locationSearchHandler from './api/locations/search.js'
import { getZonasController } from './modules/zonas/zonas.controller.js'
import correoverificacionRoutes from './modules/perfil/correoverificacion.routes.js'
import perfilRoutes from './modules/perfil/perfil.routes.js'
import comparacionRoutes from './modules/perfil/comparacion.routes.js'

import {
  googleCallbackController,
  getGoogleLinkUrlController,
  StratGoogleLoginController,
  StartGoogleRegisterController
} from './modules/auth/google/google.controller.js'

import {
  startLinkedInLoginController,
  startLinkedInRegisterController,
  linkedInCallbackController,
  getLinkedInLinkUrlController
} from './modules/auth/linkedin/linkedin.controller.js'

import {
  discordCallbackController,
  getDiscordLinkUrlController,
  startDiscordLoginController,
  startDiscordRegisterController
} from './modules/auth/discord/discord.controller.js'

import multimediaRoutes from "./modules/multimedia/multimedia.routes.js";
import publicacionRoutes from "./modules/publicacion/publicacion.routes.js";
import router from "./modules/registro-publicacion/publicacion.routes.js";
import parametrosRoutes from "./modules/parametros-publicacion/parametros.routes.js";
import tutorialPublicacionRoutes from "./modules/tutorial-publicacion/tutorial-publicacion.routes.js";
import estadisticasRoutes from "./modules/estadisticas-publicacion/estadisticas.routes.js";
import tagsRoutes from "./modules/tags/tags.routes.js";
import estadisticasZonaRoutes from "./modules/estadisticas-zona/estadisticas-zona.routes.js";

import {
  facebookCallbackController,
  getFacebookLinkUrlController,
  startFacebookLoginController,
  startFacebookRegisterController
} from './modules/auth/facebook/facebook.controller.js'

import {
  getSocialLinksController,
  unlinkSocialProviderController,
  getLinkedInOriginalEmailController
} from './modules/auth/social-links/social-links.controller.js'

import securityRoutes from "./routes/security.routes.js";
import propiedadRoutes from "./routes/propiedad.routes.js";
import { validarPublicacionesFree } from "./controllers/publicacionesController.js";
// --------------------
// LEGACY
// --------------------
import authRoutes from './routes/auth.routes.js'
import publicacionesRoutes from './routes/publicaciones.js'
import { authMiddleware } from './middleware/authMiddleware.js'
import blogsRoutes from './modules/blogs/blogs.routes.js'
import testimoniosRoutes from './modules/testimonios/testimonios.routes.js'
// --------------------
// LEGACY
// --------------------
// Borra la l├¡nea 66 y pon esta:
import historialRoutes from './modules/perfil/historial.routes.js'

// --------------------
// SERVICES
// --------------------
import { verifyEmailTransport } from './lib/email.service.js'

// FAVORITES
import favoritesRoutes from "./modules/favorites/favorites.routes.js";
import telemetriaRoutes from "./modules/telemetria/telemetria.routes.js";
import recomendacionesRoutes from "./modules/recomendaciones/recomendaciones.routes.js";
import transaccionesRoutes from "./modules/transacciones/transacciones.routes.js";
import suscripcionesRoutes from "./modules/suscripciones/suscripciones.routes.js";
import plansRoutes from "./modules/plans/plans.routes.js";
import usdtRoutes from "./modules/usdt/usdt.routes.js";
import historialBusquedaRoutes from "./modules/perfil/historialBusqueda.routes.js";
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes.js";
import adminTestimoniosRoutes from "./modules/testimonios/adminTestimonios.routes.js";
import adminPlanesRoutes from "./modules/planes/adminPlanes.routes.js";
import sesionRoutes from "./modules/perfil/sesion.routes.js";
import poisRoutes from "./modules/pois/pois.routes.js";

import "./jobs/suscripcion.job.js";
import { initSocket } from "./services/socket.service.js";

// --------------------
// SERVER
// --------------------
const app = express()

// --------------------
// MIDDLEWARES
// --------------------
const normalizedFrontendOrigin = env.FRONTEND_URL.replace(/\/$/, '')
const allowedOrigins = [
  normalizedFrontendOrigin,
  'https://prop-bol-cicd.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:2000'
]

// Middleware CORS global
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS policy: Origin not allowed: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))
app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))

// --------------------
// RUTAS LEGACY
// --------------------
app.post("/api/auth/forgot-password", forgotPasswordController);
app.post("/api/auth/magic-link/request", requestMagicLinkController);
app.post("/api/auth/magic-link/login", loginWithMagicLinkController);
app.post("/api/auth/magic-link/resend", resendMagicLinkController);
app.post("/api/auth/resend-2fa", resend2FAController);
app.post("/api/auth/reset-password", resetPasswordController);
app.use("/api/auth-legacy", authRoutes);
app.get("/api/users/:id/publicaciones/free", authMiddleware, (_req, res) => {
  res.json({ restantes: 2 });
});
app.get(
  "/api/publicaciones/validar-limite/:id",
  authMiddleware,
  validarPublicacionesFree
);
app.use("/api/publicaciones-legacy", publicacionesRoutes);

// --------------------
// RUTAS PRINCIPALES
// --------------------
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/publicaciones", multimediaRoutes);
app.use("/api/publicaciones/tutorial", tutorialPublicacionRoutes);
app.use("/api/perfil", correoverificacionRoutes);
app.use("/api/perfil/usuario", perfilRoutes);
app.use("/api/perfil/zonas", zonaRoutes);
app.use("/api", router);
app.use("/api", consumoRoutes);
app.use("/api", parametrosRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api", estadisticasRoutes);
app.use("/api/estadisticas-zona", estadisticasZonaRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/telemetria", telemetriaRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use("/api/propiedad", propiedadRoutes);
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/publicaciones", multimediaRoutes);
app.use("/api/perfil", correoverificacionRoutes);
app.use("/api/perfil/usuario", perfilRoutes);
app.use("/api/perfil/zonas", zonaRoutes);
app.use("/api/perfil/historial", historialRoutes);
app.use("/api/perfil/historial-busqueda", historialBusquedaRoutes);
app.use("/api", router);
app.use("/api", parametrosRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/telemetria", telemetriaRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/testimonios", testimoniosRoutes);
app.use("/api/telemetria", telemetriaRouter);
app.use("/api/comparaciones", comparacionRoutes);
app.use("/api/sesion", sesionRoutes);
app.use('/api/ml', mlRoutes)
app.use("/api/transacciones", transaccionesRoutes);
app.use("/api/suscripciones", suscripcionesRoutes);
app.use("/api/planes", plansRoutes);
app.use("/api/usdt", usdtRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/locations", locationRoutes);

// --------------------
// MOCK / TEST
// --------------------
app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})

// --------------------
// AUTH
// --------------------
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.post('/api/auth/verify-2fa', verify2FAController)
app.post('/api/auth/activate-2fa', requireAuth, activate2FAController)
app.post('/api/auth/deactivate-2fa', requireAuth, deactivate2FAController)
app.get('/api/auth/2fa-status', requireAuth, get2FAStatusController)
app.post('/api/auth/logout', logoutController)
app.post('/api/auth/verify-register', verifyRegisterCodeController)
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.post('/api/auth/logout', logoutController)
app.post('/api/auth/verify-register', verifyRegisterCodeController)
app.post('/api/auth/resend-register-code', resendRegisterCodeController)

app.post('/api/auth/activate-by-password', activateAccountByPasswordController)
app.post('/api/auth/request-activation-code', requestActivationCodeController)
app.post('/api/auth/activate-by-code', activateAccountByCodeController)

app.get('/api/auth/me', getMeController)

app.get("/api/auth/google/login", StratGoogleLoginController);
app.get("/api/auth/google/register", StartGoogleRegisterController);
app.get("/api/auth/google/callback", googleCallbackController);

app.get("/api/auth/discord/login", startDiscordLoginController);
app.get("/api/auth/discord/register", startDiscordRegisterController);
app.get("/api/auth/discord/callback", discordCallbackController);

app.get("/api/auth/facebook/login", startFacebookLoginController);
app.get("/api/auth/facebook/register", startFacebookRegisterController);
app.get("/api/auth/facebook/callback", facebookCallbackController);

app.get('/api/auth/social-links', requireAuth, getSocialLinksController)
app.get('/api/auth/linkedin/original-email', requireAuth, getLinkedInOriginalEmailController)
app.delete('/api/auth/social-links/:provider', requireAuth, unlinkSocialProviderController)
app.get('/api/auth/facebook/link-url', requireAuth, getFacebookLinkUrlController)
app.get('/api/auth/discord/link-url', requireAuth, getDiscordLinkUrlController)
app.get('/api/auth/google/link-url', requireAuth, getGoogleLinkUrlController)
app.get('/api/auth/linkedin/login', startLinkedInLoginController)
app.get('/api/auth/linkedin/callback', linkedInCallbackController)
app.get('/api/auth/linkedin/link-url', requireAuth, getLinkedInLinkUrlController)
app.get('/api/auth/linkedin/register', startLinkedInRegisterController)
//comentario

// --------------------
// BANNERS & FILTERS
// --------------------
const bannersController = new BannersController()
const filtersController = new FiltersHomepageController()

app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))
const cityController = new CityController()

app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))
app.get('/api/cities', (req, res) => cityController.getFeatured(req, res))

// --------------------
// LOCATIONS
// --------------------
app.get('/api/zonas', getZonasController)

app.get('/api/locations/search', async (req: Request, res: Response) => {
  await locationSearchHandler(req as any, res as any)
})
app.get('/api/locations/search', async (req: Request, res: Response) => {
  // @ts-ignore
  await locationSearchHandler(req, res)
})

// --------------------
// HEALTH
// --------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

// --------------------
// PROPERTIES
// --------------------
app.get('/api/properties/search', propertiesController.search)
app.get('/api/inmuebles', propertiesController.getAll)
app.get('/api/properties/inmuebles', propertiesController.getAll)
app.use('/api/propiedad', propiedadRoutes)

// --------------------
// NOTIFICACIONES
// --------------------
app.post('/notificaciones', requireAuth, createNotificationController)
app.get('/notificaciones', requireAuth, getNotificationsController)
app.get('/notificaciones/unread-count', requireAuth, getUnreadCountController)
app.use('/notificaciones', notificationStreamRoutes)
app.get('/notificaciones/:id', requireAuth, getNotificationByIdController)
app.patch('/notificaciones/:id/read', requireAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', requireAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', requireAuth, deleteNotificationController)
app.patch('/notificaciones/:id/archivar', requireAuth, archiveNotificationController)

// --------------------
// PUBLICACIONES MOCK
// --------------------
app.post('/api/publicaciones', (req, res) => {
  const nuevaPublicacion = req.body
  res.json({ message: 'Publicaci├│n creada', publicacion: nuevaPublicacion })
})

// --------------------
// TESTIMONIOSADMIN
// --------------------
app.use("/api/admin", adminTestimoniosRoutes);
app.use("/api/admin", adminPlanesRoutes);
app.use("/api/pois", poisRoutes);

// --------------------
// LEVANTAR SERVIDOR
// --------------------
const PORT = Number(process.env.PORT) || 5000

async function seedPlanes() {
  const count = await prisma.plan_suscripcion.count()
  if (count > 0) return
  await prisma.plan_suscripcion.createMany({
    data: [
      {
        nombre_plan: 'B├ísico',
        precio_plan: 0,
        nro_publicaciones_plan: 3,
        duracion_plan_dias: 30,
        imagen_gr_url: '/qrs/basico.png'
      },
      {
        nombre_plan: 'Est├índar',
        precio_plan: 99,
        nro_publicaciones_plan: 10,
        duracion_plan_dias: 30,
        imagen_gr_url: '/qrs/estandar.png'
      },
      {
        nombre_plan: 'Pro',
        precio_plan: 199,
        nro_publicaciones_plan: 100,
        duracion_plan_dias: 30,
        imagen_gr_url: '/qrs/pro.png'
      }
    ]
  })
  console.log('Ô£à Planes de suscripci├│n inicializados en DB')
}

iniciarCronRetroalimentacion()

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, async () => {
  console.log(`­ƒÜÇ Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  await cargarModeloActivo()


  try {
    await seedPlanes()
  } catch (error) {
    console.error('ÔØî Error al inicializar planes:', error)
  }



  try {
    await verifyEmailTransport()
    console.log('Ô£à Servicio de email de registro listo')
  } catch (error) {
    console.error('ÔØî Error en configuraci├│n de email de registro:', error)
  }
})

export default app