import { prisma } from '../../lib/prisma.client.js'

const USE_MOCK = false

export const obtenerConsumo = async (userId: number) => {
  // 🟡MODO MOCK (datos simulados)
  if (USE_MOCK) {
    return {
      usadas: 7,
      limite: 10,
      plan: 'Plan básico (mock)'
    }
  }

  // 🟢 MODO BASE DE DATOS (real)
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: userId
    },
    include: {
      suscripciones_activas: {
        include: {
          plan_suscripcion: true
        }
      }
    }
  })

  if (!usuario) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Usuario no encontrado'
    }
  }

  const suscripcion = usuario.suscripciones_activas?.[0]

  if (!suscripcion) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Sin suscripción'
    }
  }

  const plan = suscripcion.plan_suscripcion

  if (!plan) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Plan no definido'
    }
  }

  // Contar publicaciones del mes actual (incluye eliminadas para no reducir el contador)
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const publicacionesMes = await prisma.publicacion.count({
    where: {
      usuarioId: userId,
      fechaPublicacion: { gte: inicioMes },
    },
  })

  return {
    usadas: publicacionesMes,
    limite: plan.nro_publicaciones_plan ?? 0,
    plan: plan.nombre_plan ?? 'Plan sin nombre'
  }
}
