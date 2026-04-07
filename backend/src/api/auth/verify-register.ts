import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRegisterCodeService } from '../../modules/auth/auth.service.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  try {
    const result = await verifyRegisterCodeService(req.body);

    return res.status(201).json({
      message: "Correo verificado y usuario creado correctamente",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Error al verificar código",
    });
  }
}
