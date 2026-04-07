import path from 'path'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import type { Request, Response } from 'express'

// --------------------
// CONTROLLERS
// --------------------
import { propertiesController } from './modules/properties/properties.controller.js'
import {
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js'
import { BannersController } from './modules/banners/banners.controller.js'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js'

// --------------------
// AUTH
// --------------------
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController
} from './modules/auth/auth.controller.js'
import { requireAuth } from './middleware/auth.middleware.js'

// --------------------
// ROUTES / HANDLERS
// --------------------
import locationSearchHandler from './api/locations/search.js'

import correoverificacionRoutes from './modules/perfil/correoverificacion.routes.js'
import perfilRoutes from './modules/perfil/perfil.routes.js'

import {
  googleCallbackController,
  StratGoogleLoginController
} from './modules/auth/google/google.controller.js'

import multimediaRoutes from './modules/multimedia/multimedia.routes.js'
import publicacionRoutes from './modules/publicacion/publicacion.routes.js'
import router from './modules/registro-publicacion/publicacion.routes.js'

// --------------------
// LEGACY
// --------------------
import authRoutes from './routes/auth.routes.js'
import publicacionesRoutes from './routes/publicaciones.js'
import { authMiddleware } from './middleware/authMiddleware.js'

// --------------------
// SERVICES
// --------------------
import { verifyNotificationEmailTransport } from './modules/email/notification-email.service.js'

// --------------------
// SERVER
// --------------------
import serverless from 'serverless-http'
const app = express()

// --------------------
// MIDDLEWARES
// --------------------
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://prop-bol-cicd.vercel.app',
  'http://localhost:3000'
]

// Configuración de CORS con soporte para preflight en serverless
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (postman o server-side)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS policy: Origin not allowed: ${origin}`))
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}))

// Responder correctamente OPTIONS para preflight
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))

// --------------------
// RUTAS LEGACY
// --------------------
app.use('/api/auth-legacy', authRoutes)
app.get('/api/users/:id/publicaciones/free', authMiddleware, (_req, res) => {
  res.json({ restantes: 2 })
})
app.use('/api/publicaciones-legacy', publicacionesRoutes)

// --------------------
// RUTAS PRINCIPALES
// --------------------
app.use('/api/publicaciones', publicacionRoutes)
app.use('/api/publicaciones', multimediaRoutes)
app.use('/api/perfil', correoverificacionRoutes)
app.use('/api/perfil/usuario', perfilRoutes)
app.use('/api', router)

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
app.post('/api/auth/logout', logoutController)
app.post('/api/auth/verify-register', verifyRegisterCodeController)
app.get('/api/auth/google/login', StratGoogleLoginController)
app.get('/api/auth/google/callback', googleCallbackController)

// --------------------
// BANNERS & FILTERS
// --------------------
const bannersController = new BannersController()
const filtersController = new FiltersHomepageController()
app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))

// --------------------
// LOCATIONS
// --------------------
app.get('/api/locations/search', async (req: Request, res: Response) => {
  await locationSearchHandler(req as any, res as any)
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

// --------------------
// NOTIFICACIONES
// --------------------
app.post('/notificaciones', requireAuth, createNotificationController)
app.get('/notificaciones', requireAuth, getNotificationsController)
app.get('/notificaciones/unread-count', requireAuth, getUnreadCountController)
app.patch('/notificaciones/:id/read', requireAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', requireAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', requireAuth, deleteNotificationController)

// --------------------
// PUBLICACIONES MOCK
// --------------------
app.post('/api/publicaciones', (req, res) => {
  const nuevaPublicacion = req.body
  res.json({ message: 'Publicación creada', publicacion: nuevaPublicacion })
})

// --------------------
// LOCAL SERVER (solo para dev)
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 5000
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`Health: http://localhost:${PORT}/health`)
    try {
      await verifyNotificationEmailTransport()
      console.log('✅ Email listo')
    } catch (error) {
      console.error('❌ Email error:', error)
    }
  })
}

// --------------------
// EXPORT PARA VERCEL
export default serverless(app)