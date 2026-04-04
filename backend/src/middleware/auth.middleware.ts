import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyJwtToken } from '../utils/jwt.js'
import { findActiveSessionByToken } from '../modules/auth/auth.repository.js'

export const verifyAuth = async (req: VercelRequest, res: VercelResponse) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Token no proporcionado'
    })
    return null
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      message: 'Token no proporcionado'
    })
    return null
  }

  try {
    verifyJwtToken(token)
    const session = await findActiveSessionByToken(token)

    if (!session) {
      res.status(401).json({
        message: 'Sesión inválida o expirada'
      })
      return null
    }

    return {
      token,
      user: session.usuario
    }
  } catch {
    res.status(401).json({
      message: 'Token Inválido'
    })
    return null
  }
}
