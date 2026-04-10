import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debes iniciar sesión para ver los planes'
    })
  }

  try {
    const secret = process.env.JWT_SECRET || 'mi-secreto-temporal'
    const decoded = jwt.verify(token, secret) as any

    req.user = {
      id: decoded.id,
      correo: decoded.correo
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        error: 'Token expirado',
        message: 'Tu sesión expiró, inicia sesión nuevamente'
      })
    }

    return res.status(403).json({
      error: 'Token inválido',
      message: 'No pudimos validar tu sesión'
    })
  }
}
