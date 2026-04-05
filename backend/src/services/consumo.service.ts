import { prisma } from '../config/prisma.js'

// Cambiar este dato true para usar datos simulados y false para usar los datos de la DB
const USE_MOCK = true
/*
Al no tener los datos en la DB es decir al estar vacio la DB saltara el mensaje de no se puso cargar 
es por eso que se creo esta manera de ver con datos simulados temporalmente luego se cambiara
para que puedan observar como funciona con datos ya que por el momento esos datos llegan de otra
epica de otro grupo y no se puede tocar la DB
*/
export const obtenerConsumo = async (userId: number) => {
  //cambiar estos datos para ver que funcione todo
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
