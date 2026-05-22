import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../../middleware/auth.middleware.js";
import { prisma } from "../../lib/prisma.client.js";
import { findActiveSessionByToken } from "../../modules/auth/auth.repository.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  try {
    const session = await findActiveSessionByToken(auth.token);
    if (!session)
      return res.status(401).json({ message: "Sesión inválida o expirada" });
    if (session.usuario.activo === false)
      return res.status(403).json({ message: "Esta cuenta está desactivada" });

    await prisma.usuario.update({
      where: { id: session.usuario.id },
      data: { controlador: true },
    });

    return res.status(200).json({ message: "Tour marcado como visto" });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Error al actualizar",
    });
  }
}
