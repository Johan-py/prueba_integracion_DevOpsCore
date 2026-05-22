// backend/src/modules/sesion/sesion.controller.ts
import { Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'
import type { AuthRequest } from '../../middleware/validarJWT.js'

export const sesionController = {
  // Obtener todas las sesiones activas del usuario autenticado
  async getMisSesiones(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      // ✅ Obtener SOLO sesiones activas (estado = true)
      const sesiones = await prisma.sesion.findMany({
        where: {
          usuarioId,
          estado: true // ← Agregar este filtro
        },
        orderBy: {
          fechaInicio: 'desc'
        },
        select: {
          id: true,
          token: true,
          fechaInicio: true,
          fechaExpiracion: true,
          estado: true,
          metodo_auth: true
        }
      })

      // Obtener la sesión actual (la del token activo)
      const tokenActual = req.headers.authorization?.split(' ')[1]

      const sesionesFormateadas = sesiones.map((sesion) => ({
        id: sesion.id,
        token: sesion.token.substring(0, 20) + '...',
        fechaInicio: sesion.fechaInicio,
        fechaExpiracion: sesion.fechaExpiracion,
        estado: sesion.estado,
        metodoAuth: sesion.metodo_auth,
        esActual: sesion.token === tokenActual
      }))

      res.json({
        total: sesiones.length,
        activas: sesiones.length, // Todas son activas por el filtro
        sesiones: sesionesFormateadas
      })
    } catch (error) {
      console.error('Error al obtener sesiones:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Obtener una sesión específica por ID
  async getSesionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      const sesionId = Array.isArray(id) ? id[0] : id

      if (!sesionId) {
        return res.status(400).json({ error: 'ID no válido' })
      }

      const sesion = await prisma.sesion.findFirst({
        where: {
          id: parseInt(sesionId),
          usuarioId
        },
        select: {
          id: true,
          token: true,
          fechaInicio: true,
          fechaExpiracion: true,
          estado: true,
          metodo_auth: true
        }
      })

      if (!sesion) {
        return res.status(404).json({ error: 'Sesión no encontrada' })
      }

      res.json(sesion)
    } catch (error) {
      console.error('Error al obtener sesión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Cerrar sesión específica (cambiar estado a false)
  async cerrarSesion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      const sesionId = Array.isArray(id) ? id[0] : id

      if (!sesionId) {
        return res.status(400).json({ error: 'ID no válido' })
      }

      // Verificar que la sesión existe y pertenece al usuario
      const sesion = await prisma.sesion.findFirst({
        where: {
          id: parseInt(sesionId),
          usuarioId
        }
      })

      if (!sesion) {
        return res.status(404).json({ error: 'Sesión no encontrada' })
      }

      // No permitir cerrar la sesión actual
      const tokenActual = req.headers.authorization?.split(' ')[1]
      if (sesion.token === tokenActual) {
        return res.status(400).json({
          error: 'No puedes cerrar tu sesión actual desde aquí. Usa logout.'
        })
      }

      // Cambiar estado a false (cerrar sesión)
      await prisma.sesion.update({
        where: { id: parseInt(sesionId) },
        data: { estado: false }
      })

      res.json({
        message: 'Sesión cerrada exitosamente',
        sesionId: parseInt(sesionId)
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  },

  // Cerrar todas las sesiones excepto la actual
  async cerrarTodasSesionesExceptoActual(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.usuario?.id
      const tokenActual = req.headers.authorization?.split(' ')[1]

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      const result = await prisma.sesion.updateMany({
        where: {
          usuarioId,
          token: { not: tokenActual },
          estado: true
        },
        data: { estado: false }
      })

      res.json({
        message: 'Todas las demás sesiones fueron cerradas',
        sesionesCerradas: result.count
      })
    } catch (error) {
      console.error('Error al cerrar sesiones:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
