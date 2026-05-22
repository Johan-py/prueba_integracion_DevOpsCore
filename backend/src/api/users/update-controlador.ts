import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../../middleware/auth.middleware.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  try {
    return res.status(200).json({
      message: "Funcionalidad temporalmente deshabilitada",
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Error al actualizar",
    });
  }
}
