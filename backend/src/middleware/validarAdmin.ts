import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './validarJWT.js'

export const validarAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const usuario = req.usuario
  if (!usuario) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  if (usuario.rol?.nombre !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso denegado — se requiere rol ADMIN' })
  }
  next()
}
