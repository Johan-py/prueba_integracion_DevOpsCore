import type { Request, Response } from "express";
import { zonasRepository } from "./zonas.repository.js";

export async function getZonasController(req: Request, res: Response) {
  try {
    const zonas = await zonasRepository.getAll();
    res.json({ data: zonas });
  } catch (error) {
    console.error("Error al obtener zonas:", error);
    res.status(500).json({ error: "Error al obtener zonas predefinidas" });
  }
}
