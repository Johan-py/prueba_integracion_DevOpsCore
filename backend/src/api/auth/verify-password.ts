import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../../middleware/auth.middleware.js";
import { verifyPasswordService } from "../../modules/auth/auth.service.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const auth = await verifyAuth(req, res);
  if (!auth) return;

  try {
    const { password } = req.body;
    await verifyPasswordService({ userId: auth.user.id, password });
    return res
      .status(200)
      .json({ message: "Contraseña verificada correctamente" });
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : "Contraseña incorrecta",
    });
  }
}
