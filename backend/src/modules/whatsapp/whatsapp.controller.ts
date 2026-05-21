import type { Request, Response } from "express";
import { env } from "../../config/env.js";

const evolutionFetch = async (path: string, method = "GET", body?: object) => {
  const response = await fetch(`${env.EVOLUTION_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: env.EVOLUTION_API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return response.json();
};

// GET /api/whatsapp/estado
// Devuelve si la instancia está conectada o no
export const obtenerEstado = async (_req: Request, res: Response) => {
  try {
    const data = await evolutionFetch(
      `/instance/connectionState/${env.EVOLUTION_INSTANCE}`
    );
    return res.json({ ok: true, estado: data });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al obtener estado", error });
  }
};

// GET /api/whatsapp/qr
// Devuelve el QR para escanear con tu WhatsApp
export const obtenerQR = async (_req: Request, res: Response) => {
  try {
    const data = await evolutionFetch(
      `/instance/connect/${env.EVOLUTION_INSTANCE}`
    );
    return res.json({ ok: true, qr: data });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al obtener QR", error });
  }
};

// POST /api/whatsapp/crear-instancia
// Solo se usa la primera vez para crear la instancia en Evolution
export const crearInstancia = async (_req: Request, res: Response) => {
  try {
    const data = await evolutionFetch("/instance/create", "POST", {
      instanceName: env.EVOLUTION_INSTANCE,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    });
    return res.json({ ok: true, instancia: data });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al crear instancia", error });
  }
};