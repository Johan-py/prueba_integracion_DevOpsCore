import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getPlanLimit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    // Obtenemos el inicio del mes actual para el filtro
    const inicioMes = new Date();
    inicioMes.setHours(0, 0, 0, 0);
    inicioMes.setDate(1);

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        // 💡 Contamos solo las de este mes
        _count: {
          select: {
            publicaciones: {
              where: {
                fechaPublicacion: { gte: inicioMes }, // Ajusta 'fechaPublicacion' al nombre de tu columna de fecha
              },
            },
          },
        },
        suscripciones_activas: {
          where: { estado: "ACTIVA" },
          take: 1, // Solo nos interesa la actual
          select: {
            plan_suscripcion: {
              select: { nro_publicaciones_plan: true },
            },
          },
        },
      },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const total =
      user.suscripciones_activas?.[0]?.plan_suscripcion
        ?.nro_publicaciones_plan ?? 0;
    const usadas = user._count?.publicaciones ?? 0;

    res.json({ total, usadas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el límite del plan" });
  }
};
