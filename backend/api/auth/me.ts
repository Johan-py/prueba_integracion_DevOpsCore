import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from '../../src/middleware/auth.middleware.js'
import { getMeService } from '../../src/modules/auth/auth.service.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Método no permitido'
    })
  }

  const auth = await verifyAuth(req, res)
  if (!auth) return

  try {
    const result = await getMeService(auth.token)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : 'No autorizado'
    })
  }
}
