import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loginService } from '../../src/modules/auth/auth.service.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Método no permitido'
    })
  }

  try {
    const result = await loginService(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : 'Error en login'
    })
  }
}
