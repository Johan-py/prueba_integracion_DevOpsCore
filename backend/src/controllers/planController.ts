import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express' // Importa los tipos

const prisma = new PrismaClient()

export const getPlanLimit = async (req: Request, res: Response) => {
  try {
    // Usamos 'any' en req para que no chille por el .user
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const userPlan = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        nro_publicaciones_plan: true,
        _count: {
          select: { publicaciones: true }
        }
      }
    })

    if (!userPlan) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({
      total: userPlan.nro_publicaciones_plan,
      usadas: userPlan._count.publicaciones
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el límite del plan' })
  }
}
