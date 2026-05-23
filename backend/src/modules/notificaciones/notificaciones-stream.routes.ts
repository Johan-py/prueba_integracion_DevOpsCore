import { Router } from 'express'
import type { Request, Response } from 'express'

import { findActiveSessionByToken } from '../auth/auth.repository.js'
import { verifyJwtToken } from '../../utils/jwt.js'
import { subscribeToNotificationEvents } from './notificaciones.events.js'

const router = Router()

const getNotificationStreamUserId = async (token: string) => {
  verifyJwtToken(token)

  const session = await findActiveSessionByToken(token)

  if (!session) {
    return null
  }

  const usuario_id = Number(session.usuario.id)

  if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
    return null
  }

  return usuario_id
}

router.get('/stream', async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token ?? '')

    if (!token) {
      return res.status(401).json({
        message: 'Token requerido'
      })
    }

    const usuario_id = await getNotificationStreamUserId(token)

    if (!usuario_id) {
      return res.status(401).json({
        message: 'Sesión inválida o expirada'
      })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    res.flushHeaders?.()

    res.write('event: connected\n')
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        userId: usuario_id,
        timestamp: new Date().toISOString()
      })}\n\n`
    )

    const unsubscribe = subscribeToNotificationEvents(usuario_id, (payload) => {
      res.write(`event: ${payload.type}\n`)
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    const pingInterval = setInterval(() => {
      res.write('event: ping\n')
      res.write(
        `data: ${JSON.stringify({
          timestamp: new Date().toISOString()
        })}\n\n`
      )
    }, 25000)

    req.on('close', () => {
      clearInterval(pingInterval)
      unsubscribe()
      res.end()
    })
  } catch {
    return res.status(401).json({
      message: 'Token inválido'
    })
  }
})

export default router
