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
import { registerController, loginController } from './modules/auth/auth.controller.js'

const app = express()
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  })
)

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json())

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
const bannersController = new BannersController()
const filtersController = new FiltersHomepageController()

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})
app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)

app.get('/api/filters', filtersController.getFilters)
app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))
app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(req as unknown as VercelRequest, res as unknown as VercelResponse)
})

app.get('/notificaciones', fakeAuth, getNotificationsController)
app.get('/notificaciones/unread-count', fakeAuth, getUnreadCountController)
app.patch('/notificaciones/:id/read', fakeAuth, markNotificationAsReadController)
app.patch('/notificaciones/read-all', fakeAuth, markAllNotificationsAsReadController)
app.delete('/notificaciones/:id', fakeAuth, deleteNotificationController)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
