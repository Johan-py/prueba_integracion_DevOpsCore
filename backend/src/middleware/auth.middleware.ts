import type { NextFunction, Request, Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { verifyJwtToken } from '../utils/jwt.js'
import { findActiveSessionByToken } from '../modules/auth/auth.repository.js'

// ----------------------------------------
// ✅ EXPRESS MIDDLEWARE
// ----------------------------------------
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token inválido' })
  }

  try {
    verifyJwtToken(token)

    const session = await findActiveSessionByToken(token)

    if (!session) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' })
    }

    req.user = {
      id: session.usuario.id,
      correo: session.usuario.correo
    }

    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

// ----------------------------------------
// ✅ VERCEL HELPER
// ----------------------------------------
type VerifyAuthResult = {
  token: string
  user: {
    id: number
    correo: string
  }
} | null

export const verifyAuth = async (
  req: VercelRequest,
  res: VercelResponse
): Promise<VerifyAuthResult> => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' })
    return null
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: 'Token inválido' })
    return null
  }

  try {
    verifyJwtToken(token)

    const session = await findActiveSessionByToken(token)

    if (!session) {
      res.status(401).json({ message: 'Sesión inválida o expirada' })
      return null
    }

    return {
      token,
      user: {
        id: session.usuario.id,
        correo: session.usuario.correo
      }
    }
  } catch {
    res.status(401).json({ message: 'Token inválido' })
    return null
  }
}
