import express from 'express'
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'

import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from './modules/notificaciones/notificaciones.controller.js'

import { BannersController } from './modules/banners/banners.controller.js'
import locationSearchHandler from '../api/locations/search.js'
import { FiltersHomepageController } from './modules/filtershomepage/filtershomepage.controller.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import {
  registerController,
  loginController,
  logoutController
} from './modules/auth/auth.controller.js'

import meHandler from '../api/auth/me.js'
import publicacionRoutes from './modules/publicacion/publicacion.routes.js'

const app = express()

// Configuración de CORS para permitir solicitudes desde el frontend
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.options(/.*/, cors())
app.use(express.json())

// Rutas de publicaciones
app.use('/api/publicaciones', publicacionRoutes)

// auth termporal
type AuthenticatedRequest = Request & {
  user?: {
    id: number
    email?: string
  }
}

// auth temporal para pruebas
const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  ;(req as AuthenticatedRequest).user = {
    id: 1
  }

  next()
}

// controllers
const bannersController = new BannersController()
const filtersController = new FiltersHomepageController()

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})

// Rutas de autenticación
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)
app.post('/api/auth/logout', logoutController)
app.get('/api/auth/me', async (req, res) => {
  await meHandler(req as any, res as any)
})
// Rutas de filtros y banners
app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))

app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(req as unknown as VercelRequest, res as unknown as VercelResponse)
})

//notificaciones
app.get('/notificaciones', fakeAuth, getNotificationsController)
app.get('/notificaciones/unread-count', fakeAuth, getUnreadCountController)
app.patch('/notificaciones/:id/read', fakeAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', fakeAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', fakeAuth, deleteNotificationController)

// health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Server running'
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
