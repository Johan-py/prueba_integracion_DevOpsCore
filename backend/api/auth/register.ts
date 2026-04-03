import type { VercelRequest, VercelResponse } from '@vercel/node'
import { registerUser } from '../../src/modules/auth/auth.service.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Método no permitido'
    })
  }

  try {
    const result = await registerUser(req.body);

    return res.status(200).json({
      message: "Te enviamos un código de verificación a tu correo.",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Error en registro'
    })
  }
}
