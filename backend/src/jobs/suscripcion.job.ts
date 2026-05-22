import cron from 'node-cron'
import { prisma } from '../lib/prisma.client.js'
import { notificarVencimiento } from '../services/email.service.js'


cron.schedule('0 8 * * *', async () => {
  console.log('🔄 Ejecutando job de suscripciones...')

  const ahora = new Date()
  const dentroDe3Dias = new Date()
  dentroDe3Dias.setDate(ahora.getDate() + 3)

  const porVencer = await prisma.suscripciones_activas.findMany({
    where: {
      estado: 'activa',
      fecha_fin: {
        gte: ahora,
        lte: dentroDe3Dias
      }
    },
    include: { usuario: true, plan_suscripcion: true }
  })

  for (const susc of porVencer) {
    // Validar que usuario y plan_suscripcion existan
    if (!susc.usuario || !susc.plan_suscripcion) {
      console.warn(`⚠️ Suscripción ${susc.id} no tiene usuario o plan asociado`)
      continue
    }

    // TypeScript ahora sabe que susc.usuario y susc.plan_suscripcion no son null
    await notificarVencimiento(
      susc.usuario.correo,
      susc.plan_suscripcion.nombre_plan || 'Plan desconocido',
      susc.fecha_fin
    )
  }

  console.log('✅ Job de suscripciones finalizado')
})
