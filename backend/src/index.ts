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
  archiveNotificationController,
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js'
import { verifyJwtToken } from './utils/jwt.js'
import { findActiveSessionByToken } from './modules/auth/auth.repository.js'
import {
  subscribeToNotificationEvents,
  type NotificationRealtimeEvent
} from './modules/notificaciones/notificaciones.events.js'
import { BannersController } from './modules/banners/banners.controller.js'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js'

// --------------------
// AUTH
// --------------------
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController,
  getMeController
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
const app = express()

// --------------------
// MIDDLEWARES
// --------------------
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://prop-bol-cicd.vercel.app',
  'http://localhost:3000'
]

// Middleware CORS global
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`CORS policy: Origin not allowed: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

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
app.get('/api/auth/me', getMeController)
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
app.get('/notificaciones/stream', async (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : ''

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  try {
    verifyJwtToken(token)

    const session = await findActiveSessionByToken(token)

    if (!session) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' })
    }

    const usuarioId = session.usuario.id

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    res.flushHeaders?.()

    const sendEvent = (payload: NotificationRealtimeEvent) => {
      const eventName = payload.type === 'connected' ? 'connected' : 'notifications-updated'

      res.write(`event: ${eventName}\n`)
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    sendEvent({
      type: 'connected',
      userId: usuarioId,
      timestamp: new Date().toISOString()
    })

    const unsubscribe = subscribeToNotificationEvents(usuarioId, sendEvent)

    const heartbeat = setInterval(() => {
      res.write(`event: ping\n`)
      res.write(`data: {"ok":true}\n\n`)
    }, 25000)

    req.on('close', () => {
      clearInterval(heartbeat)
      unsubscribe()
      res.end()
    })

    req.on('end', () => {
      clearInterval(heartbeat)
      unsubscribe()
      res.end()
    })
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
})

// --------------------
// NOTIFICACIONES
// --------------------

app.post('/notificaciones', requireAuth, createNotificationController)
app.get('/notificaciones', requireAuth, getNotificationsController)
app.get('/notificaciones/unread-count', requireAuth, getUnreadCountController)
app.patch('/notificaciones/:id/read', requireAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', requireAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', requireAuth, deleteNotificationController)
app.patch('/notificaciones/:id/archivar', requireAuth, archiveNotificationController)

// --------------------
// PUBLICACIONES MOCK
// --------------------
app.post('/api/publicaciones', (req, res) => {
  const nuevaPublicacion = req.body
  res.json({ message: 'Publicación creada', publicacion: nuevaPublicacion })
})

// --- Dev-only logic ---
if (process.env.NODE_ENV !== 'production') {
  verifyNotificationEmailTransport()
    .then(() => console.log('✅ Email listo'))
    .catch((err) => console.error('❌ Email error:', err))
}

// --- Levantar servidor ---
const PORT = Number(process.env.PORT) || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

export default app
