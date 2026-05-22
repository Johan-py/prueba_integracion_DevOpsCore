import { publicacionesRepository } from './publicaciones.repository.js'
import { Publicacion } from '@prisma/client'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'
import { prisma } from '../../lib/prisma.client.js'

export const publicacionesService = {
  async listarTodas(): Promise<Publicacion[]> {
    return publicacionesRepository.findAll()
  },

  async listarGratis(): Promise<Publicacion[]> {
    return publicacionesRepository.findGratis()
  },

  async listarMisPublicaciones(userId: number): Promise<any> {
    return publicacionesRepository.findByUserId(userId)
  },

  async obtenerEstadisticasPublicaciones(userId: number) {
    const totalPublicaciones = await publicacionesRepository.countByUser(userId)
    const limite = await suscripcionesService.obtenerLimitePublicaciones(userId)
    const tieneSuscripcion = await suscripcionesService.tieneSuscripcionActiva(userId)
    const suscripcion = await suscripcionesService.obtenerSuscripcionActiva(userId)

    return {
      totalPublicaciones,
      limite,
      disponibles: Math.max(0, limite - totalPublicaciones),
      tieneSuscripcion,
      suscripcion: suscripcion
        ? {
            id: suscripcion.id,
            planNombre: suscripcion.plan_suscripcion?.nombre_plan,
            fechaInicio: suscripcion.fecha_inicio,
            fechaFin: suscripcion.fecha_fin
          }
        : null
    }
  },

  async crear(userId: number, data: Partial<Publicacion>): Promise<Publicacion> {
    const count = await publicacionesRepository.countByUser(userId)

    console.log('📊 Publicaciones del usuario:', count)

    if (count >= 3) {
      throw new Error('LIMIT_REACHED')
    }

    return publicacionesRepository.create(userId, data as Omit<Publicacion, 'id' | 'usuarioId'>)
  },

  async validarFlujo(userId: number): Promise<string> {
    const count = await publicacionesRepository.countByUser(userId)

    console.log('🔍 Validando flujo, publicaciones:', count)

    if (count >= 3) {
      throw new Error('LIMIT_REACHED')
    }

    return 'FLOW_ALLOWED'
  },

  async eliminar(publicacionId: number, userId: number): Promise<void> {
    const publicacion = await publicacionesRepository.findById(publicacionId)

    if (!publicacion) {
      throw new Error('PUBLICACION_NOT_FOUND')
    }

    if (publicacion.usuarioId !== userId) {
      throw new Error('UNAUTHORIZED')
    }

    await publicacionesRepository.deleteById(publicacionId)
  },

  async cambiarEstado(publicacionId: number, userId: number, activa: boolean): Promise<void> {
    const publicacion = await publicacionesRepository.findById(publicacionId)

    if (!publicacion) {
      throw new Error('PUBLICACION_NOT_FOUND')
    }

    if (publicacion.usuarioId !== userId) {
      throw new Error('UNAUTHORIZED')
    }

    await publicacionesRepository.updateEstado(publicacionId, activa)
  },

  async validarPublicacionHU5(userId: number, data: Partial<Publicacion>) {
    const count = await publicacionesRepository.countByUser(userId)
    if (count >= 3) {
      throw new Error('LIMIT_REACHED')
    }

    return {
      estado: 'Validado',
      mensaje: 'Publicación lista para guardar'
    }
  },

  async obtenerMetricasPorInmueble(inmuebleId: number): Promise<{
    visitas: number
    favoritos: number
    contactos: number
  }> {
    const [visitas, favoritos] = await Promise.all([
      prisma.propiedad_vista.count({
        where: { inmuebleId }
      }),
      prisma.favorito.count({
        where: { inmuebleId }
      })
    ])

    return {
      visitas,
      favoritos,
      contactos: 0 // hasta que exista modelo contacto
    }
  }
}
