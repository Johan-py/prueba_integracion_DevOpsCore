import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAuth } from '../../middleware/auth.middleware.ts'
import { logoutService } from '../../modules/auth/auth.service.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  try {
    const result = await logoutService(auth.token);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Error al cerrar sesión",
    });
  }
}
