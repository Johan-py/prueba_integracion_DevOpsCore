import { prisma } from '../db/prisma.js'

export const obtenerConsumo = async (userId: number) => {

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: userId
    },
    include: {
      suscripciones_activas: {
        where: {
          estado: 'ACTIVA'
        },
        include: {
          plan_suscripcion: true
        }
      }
    }
  })

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const suscripcion = usuario.suscripciones_activas[0]

  if (!suscripcion) {
    throw new Error('No tiene suscripción activa')
  }

  if (!suscripcion.plan_suscripcion) {
    throw new Error('La suscripción no tiene plan asignado')
  }

  const plan = suscripcion.plan_suscripcion

  // 🔥 CONTAR PUBLICACIONES REALES (ya puedes hacerlo con tu BD)
  const publicacionesUsadas = await prisma.publicacion.count({
    where: {
      usuarioId: userId,
      estado: 'ACTIVA' // opcional pero recomendado
    }
  })

  return {
    usadas: publicacionesUsadas,
    limite: plan.nro_publicaciones_plan,
    plan: plan.nombre_plan
  }
}