import { prisma } from '../../../lib/prisma.client.js'
import { enviarComprobantePago } from '../../../lib/email.service.js'

export async function emitirComprobante(transaccionId: number): Promise<boolean> {
  const transaccion = await prisma.transacciones.findUnique({
    where: { id: transaccionId },
    include: {
      plan_suscripcion: true,
      usuario: true,
    },
  })

  if (!transaccion) throw new Error(`Transacción ${transaccionId} no encontrada`)

  const tipoFacturacion = transaccion.metodo_pago === 'QR_BANCARIO_ANUAL' ? 'anual' : 'mensual'

  const resultado = await enviarComprobantePago({
    emailUsuario: transaccion.usuario.correo,
    nombreUsuario: `${transaccion.usuario.nombre} ${transaccion.usuario.apellido}`,
    idTransaccion: transaccion.id,
    nombrePlan: transaccion.plan_suscripcion.nombre_plan ?? 'Plan PropBol',
    monto: Number(transaccion.total),
    fechaHora: transaccion.fecha_completado ?? transaccion.fecha_intento ?? new Date(),
    tipoFacturacion,
  })

  await prisma.bitacora_pagos.create({
    data: {
      id_usuario: transaccion.id_usuario,
      id_suscripcion: transaccion.id_suscripcion,
      id_transaccion: transaccionId,
      evento: resultado.success ? 'COMPROBANTE_ENVIADO' : 'COMPROBANTE_FALLO',
      mensaje: resultado.success
        ? `Comprobante enviado a ${transaccion.usuario.correo}`
        : `Fallo al enviar comprobante: ${String(resultado.error)}`,
    },
  })

  return resultado.success
}
