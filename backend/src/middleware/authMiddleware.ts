// backend/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number }
    ;(req as any).userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
