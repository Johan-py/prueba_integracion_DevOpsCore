import { prisma } from '../db'

export const obtenerConsumo = async (userId: number) => {
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

  //Si no existe el usuario
  if (!usuario) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Sin usuario'
    }
  }

  const suscripcion = usuario.suscripciones_activas[0]

  //  Si no tiene suscripción
  if (!suscripcion) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Sin suscripción'
    }
  }

  const plan = suscripcion.plan_suscripcion

  //  Si no tiene plan
  if (!plan) {
    return {
      usadas: 0,
      limite: 0,
      plan: 'Sin plan'
    }
  }

  // Aquí luego puedes calcular las publicaciones reales
  return {
    usadas: 0,
    limite: plan.nro_publicaciones_plan,
    plan: plan.nombre_plan
  }
}
