import { prisma } from '../lib/prisma.config.js'

const USE_MOCK = true

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
    throw new Error('Usuario no encontrado')
  }

  const suscripcion = usuario.suscripciones_activas[0]

  if (!suscripcion) {
    throw new Error('No tiene suscripción activa')
  }

  const plan = suscripcion.plan_suscripcion

  if (!plan) {
    throw new Error('La suscripción no tiene plan asignado')
  }

  return {
    usadas: 0,
    limite: plan.nro_publicaciones_plan,
    plan: plan.nombre_plan
  }
}
