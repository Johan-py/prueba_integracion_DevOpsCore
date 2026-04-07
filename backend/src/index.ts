import path from 'path'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { env } from './config/env'

import type { VercelRequest, VercelResponse } from '@vercel/node'

// --------------------
// CONTROLLERS
// --------------------
import { propertiesController } from './modules/properties/properties.controller'
import {
  createNotificationController,
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller'
import { BannersController } from './modules/banners/banners.controller'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller'

// --------------------
// AUTH
// --------------------
import {
  registerController,
  loginController,
  logoutController,
  verifyRegisterCodeController
} from './modules/auth/auth.controller'
import { requireAuth } from './middleware/auth.middleware'

// --------------------
// ROUTES / HANDLERS
// --------------------
import locationSearchHandler from '../api/locations/search'
import popularidadHandler from '../api/locations/popularidad'
import meHandler from '../api/auth/me'

import correoverificacionRoutes from './modules/perfil/correoverificacion.routes'
import perfilRoutes from './modules/perfil/perfil.routes'

import {
  googleCallbackController,
  StratGoogleLoginController
} from './modules/auth/google/google.controller'

import multimediaRoutes from './modules/multimedia/multimedia.routes'
import publicacionRoutes from './modules/publicacion/publicacion.routes'
import router from './modules/registro-publicacion/publicacion.routes'

// --------------------
// LEGACY
// --------------------
import authRoutes from './routes/auth.routes'
import publicacionesRoutes from './routes/publicaciones'
import { authMiddleware } from './middleware/authMiddleware'

// --------------------
// SERVICES
// --------------------
import { verifyNotificationEmailTransport } from './modules/email/notification-email.service'

// --------------------------------------------------

const app = express()

// --------------------
// MIDDLEWARES
// --------------------
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))

// --------------------
// LEGACY AUTH
// --------------------
app.use('/api/auth-legacy', authRoutes)

app.get('/api/users/:id/publicaciones/free', authMiddleware, (req, res) => {
  res.json({ restantes: 2 })
})

// --------------------
// LEGACY PUBLICACIONES
// --------------------
app.use('/api/publicaciones-legacy', publicacionesRoutes)

// --------------------
// ROUTES PRINCIPALES
// --------------------
app.use('/api/publicaciones', publicacionRoutes)
app.use('/api/publicaciones', multimediaRoutes)

app.use('/api/perfil', correoverificacionRoutes)
app.use('/api/perfil/usuario', perfilRoutes)

app.use('/api', router)

// --------------------
// TEST / MOCK
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

app.get('/api/auth/me', async (req, res) => {
  await meHandler(req as any, res as any)
})

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
app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(
    req as unknown as VercelRequest,
    res as unknown as VercelResponse
  )
})

app.post('/api/locations/popularidad', async (req, res) => {
  await popularidadHandler(req as any, res as any)
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

app.get('/api/publicaciones', (_req, res) => {
  res.json({ message: 'Listado de publicaciones' })
})

app.get('/api/publicaciones/gratis', (_req, res) => {
  res.json({ message: 'Listado de publicaciones gratuitas' })
})

// --------------------
// SERVER LOCAL
// --------------------
const PORT = Number(process.env.PORT) || 5000

if (process.env.NODE_ENV !== 'production') {
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

// --------------------------------------------------

export default app