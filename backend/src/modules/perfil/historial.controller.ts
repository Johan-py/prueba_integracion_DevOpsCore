import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'

export const historialController = {
  // GET: Obtener historial real
  getHistorialVistas: async (req: Request, res: Response) => {
    try {
      const usuarioId = (req as any).user?.id
      if (!usuarioId) return res.status(401).json({ error: 'No autorizado' })

      const historial = await prisma.propiedad_vista.findMany({
        where: {
          usuarioId: Number(usuarioId),
          activo: true // Solo mostramos los que no han sido "limpiados"
        },
        include: {
          inmueble: {
            include: {
              ubicacion: true,
              publicaciones: { include: { multimedia: true }, take: 1 }
            }
          }
        },
        orderBy: { vistaEn: 'desc' }
      })

      return res.json({
        total: historial.length,
        data: historial.map((item) => ({
          id: item.id,
          title: item.inmueble?.titulo || 'Sin título',
          price: item.inmueble?.precio,
          location: item.inmueble?.ubicacion?.ciudad,
          viewedDate: item.vistaEn,
          imageUrl: item.inmueble?.publicaciones[0]?.multimedia[0]?.url || null,
          activo: (item as any).activo // Mostramos el estado
        }))
      })
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al obtener historial', detalle: error.message })
    }
  },

  // PATCH: Limpiar historial (Borrado lógico)
  deleteHistorial: async (req: Request, res: Response) => {
    try {
      const usuarioId = (req as any).user?.id
      if (!usuarioId) return res.status(401).json({ error: 'No autorizado' })

      // Actualizamos todos los registros del usuario a activo = false
      const resultado = await prisma.propiedad_vista.updateMany({
        where: { usuarioId: Number(usuarioId) },
        data: { activo: false } as any // El 'as any' evita errores de tipado si Prisma aún no se refrescó
      })

      return res.json({
        message: 'Historial limpiado exitosamente',
        registrosAfectados: resultado.count
      })
    } catch (error: any) {
      console.error('Error en limpieza:', error.message)
      return res
        .status(500)
        .json({ error: 'No se pudo limpiar el historial', detalle: error.message })
    }
  }
}
