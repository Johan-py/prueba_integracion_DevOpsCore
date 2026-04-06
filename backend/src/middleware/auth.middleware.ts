// backend/src/middleware/auth.middleware.ts
import type { NextFunction, Request, Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwtToken } from '../utils/jwt.js'
import { findActiveSessionByToken } from '../modules/auth/auth.repository.js'

export type AuthenticatedRequest = Request & {
  user?: {
    id: number
    correo?: string
  }
}

/**
 * HU1 - Middleware de autenticación para Express
 * - Verifica que el request tenga un token válido
 * - Busca sesión activa asociada al token
 * - Adjunta el usuario autenticado en req.user
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  try {
    verifyJwtToken(token)

    const session = await findActiveSessionByToken(token)

    if (!session) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' })
    }

    ;(req as AuthenticatedRequest).user = {
      id: session.usuario.id,
      correo: session.usuario.correo
    }

    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

/**
 * Middleware de autenticación para endpoints tipo Vercel (api/auth/me, api/auth/logout)
 * - Devuelve null si el token es inválido o la sesión expirada
 * - Retorna { token, user } si la sesión es válida
 */
export const verifyAuth = async (req: VercelRequest, res: VercelResponse) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' })
    return null
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: 'Token no proporcionado' })
    return null
  }

  try {
    verifyJwtToken(token)

    const session = await findActiveSessionByToken(token)

    if (!session) {
      res.status(401).json({ message: 'Sesión inválida o expirada' })
      return null
    }

    return { token, user: session.usuario }
  } catch {
    res.status(401).json({ message: 'Token inválido' })
    return null
  }
}
