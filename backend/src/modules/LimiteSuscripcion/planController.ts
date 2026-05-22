import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

export const getPlanLimit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const user = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      include: {
        publicaciones: true,
        suscripciones_activas: true,
        _count: {
          select: { publicaciones: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const publicacionesMes = await prisma.publicacion.count({
      where: {
        usuarioId: Number(userId)
      }
    })

    return res.status(200).json({
      total: publicacionesMes
    })
  } catch (error) {
    console.error('❌ getPlanLimit error:', error)
    return res.status(500).json({ message: 'Error en el servidor' })
  }
}
