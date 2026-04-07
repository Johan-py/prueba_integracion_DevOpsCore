// backend/src/routes/auth.routes.ts
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const router = Router()

router.get('/validate', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number }
    return res.json({ valid: true, userId: decoded.userId })
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid token' })
  }
})

export default router
